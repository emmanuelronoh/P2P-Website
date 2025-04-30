
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext"; // Import the auth context
import "../styles/login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [tradeType, setTradeType] = useState("crypto");
    const [showPassword, setShowPassword] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const [shake, setShake] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login: authLogin } = useAuth(); // Get login function from auth context

    // Background gradient animation
    const [gradientPos, setGradientPos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const x = Math.round((clientX / window.innerWidth) * 100);
            const y = Math.round((clientY / window.innerHeight) * 100);
            setGradientPos({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setShake(false);
        setIsLoading(true);
    
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('trade_type', tradeType);
    
            const response = await axios.post(
                "http://localhost:8000/api/auth/login/",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    },
                    withCredentials: true
                }
            );
    
            // Verify response structure
            if (!response.data?.accessToken || !response.data?.refreshToken) {
                throw new Error("Authentication failed: Tokens missing in response");
            }
    
            // Store tokens with error handling
            try {
                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem("refreshToken", response.data.refreshToken);
                localStorage.setItem("tradeType", tradeType);
                console.log("Tokens stored successfully in localStorage");
            } catch (storageError) {
                console.error("LocalStorage error:", storageError);
                // Fallback to sessionStorage or memory if needed
                sessionStorage.setItem("accessToken", response.data.accessToken);
                sessionStorage.setItem("refreshToken", response.data.refreshToken);
            }
    
            // Update auth context
            await authLogin({
                token: response.data.accessToken,
                user: response.data.user
            });
    
            // Debug logging
            console.log("Login successful, tokens:", {
                accessToken: localStorage.getItem("accessToken"),
                refreshToken: localStorage.getItem("refreshToken")
            });
    
            // Navigate after state updates
            setTimeout(() => {
                navigate(tradeType === "crypto" ? "/market" : "/fiat-p2p");
            }, 0);
    
        } catch (err) {
            console.error("Login error:", err);

            let errorMessage = "Login failed. Please try again.";

            if (err.response) {
                // Handle specific error messages from backend
                if (err.response.data?.error) {
                    errorMessage = err.response.data.error;
                } else if (err.response.data?.detail) {
                    errorMessage = err.response.data.detail;
                }

                // Handle email verification case
                if (err.response.status === 403) {
                    navigate("/verify-otp", { state: { email } });
                    return;
                }

                // Handle account not found
                if (err.response.status === 404) {
                    errorMessage = "Account not found. Please check your credentials or register.";
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setIsLoading(false);
        }
    };


    const triggerError = (message) => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const backgroundStyle = {
        background: `radial-gradient(circle at ${gradientPos.x}% ${gradientPos.y}%, 
            rgba(99,102,241,0.15) 0%, 
            rgba(0,0,0,0) 50%)`
    };

    const inputVariants = {
        inactive: {
            borderColor: "#e2e8f0",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
        },
        active: {
            borderColor: "#81C3DB",
            boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.2)"
        },
        error: {
            borderColor: "#ef4444",
            boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)"
        }
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.02 },
        tap: { scale: 0.98 },
        loading: { scale: 0.98 }
    };

    return (
        <div className="login-container" style={backgroundStyle}>
            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="login-header">
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        Welcome back
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="subtitle"
                    >
                        Sign in to access your account
                    </motion.p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`error-message ${shake ? "shake" : ""}`}
                            onAnimationEnd={() => setShake(false)}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleLogin}>
                    <motion.div
                        className="form-group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <label>Email</label>
                        <motion.div
                            className="input-wrapper"
                            variants={inputVariants}
                            initial="inactive"
                            animate={activeField === "email" ? "active" : error ? "error" : "inactive"}
                            transition={{ duration: 0.2 }}
                        >
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setActiveField("email")}
                                onBlur={() => setActiveField(null)}
                                placeholder="Enter your email"
                                required
                            />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="form-group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <label>Password</label>
                        <motion.div
                            className="input-wrapper"
                            variants={inputVariants}
                            initial="inactive"
                            animate={activeField === "password" ? "active" : error ? "error" : "inactive"}
                            transition={{ duration: 0.2 }}
                        >
                            <FiLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setActiveField("password")}
                                onBlur={() => setActiveField(null)}
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="form-group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.5 }}
                    >
                        <label>Trade Type</label>
                        <div className="trade-type-selector">
                            <button
                                type="button"
                                className={`trade-type-btn ${tradeType === 'crypto' ? 'active' : ''}`}
                                onClick={() => setTradeType('crypto')}
                            >
                                Crypto
                            </button>
                            <button
                                type="button"
                                className={`trade-type-btn ${tradeType === 'fiat' ? 'active' : ''}`}
                                onClick={() => setTradeType('fiat')}
                            >
                                Fiat
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        className="forgot-password"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <a href="/forgot-password">Forgot password?</a>
                    </motion.div>

                    <motion.button
                        type="submit"
                        variants={buttonVariants}
                        initial="initial"
                        whileHover={isLoading ? "loading" : "hover"}
                        whileTap="tap"
                        animate={isLoading ? "loading" : "initial"}
                        disabled={isLoading}
                        transition={{ duration: 0.2 }}
                    >
                        {isLoading ? (
                            <span>Loading...</span>
                        ) : (
                            <>
                                <span>Continue</span>
                                <FiArrowRight />
                            </>
                        )}
                    </motion.button>
                </form>

                <motion.div
                    className="login-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <p>
                        Don't have an account? <a href="/register">Sign up</a>
                    </p>
                </motion.div>

                <div className="decoration">
                    <motion.div
                        className="circle-1"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.3 }}
                        transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
                    />
                    <motion.div
                        className="circle-2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.2 }}
                        transition={{ delay: 0.9, duration: 0.8, type: "spring" }}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
