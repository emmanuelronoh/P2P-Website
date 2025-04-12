import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, Mail } from "lucide-react";
import "../styles/forgotPassword.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: email input, 2: success message
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        
        setLoading(true);
        setMessage(null);

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/auth/forgot-password/", 
                { email }
            );
            
            setMessage({ 
                type: "success", 
                text: response.data.message || "Password reset link sent to your email!" 
            });
            setStep(2);
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.error || 
                     error.response?.data?.message ||
                     "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail("");
        setMessage(null);
        setStep(1);
    };

    return (
        <div className="fp-container">
            <motion.div 
                className="fp-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="email-form"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="fp-form-container"
                        >
                            <button 
                                onClick={() => navigate(-1)} 
                                className="fp-back-button"
                                aria-label="Go back"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <div className="fp-header">
                                <div className="fp-icon-circle">
                                    <Mail size={24} />
                                </div>
                                <h2 className="fp-title">Forgot Password?</h2>
                                <p className="fp-subtitle">
                                    Enter your email and we'll send you a reset link
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="fp-form">
                                <div className="fp-input-group">
                                    <label htmlFor="email" className="fp-label">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="fp-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                {message && (
                                    <motion.div 
                                        className={`fp-message ${message.type}`}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {message.type === "success" ? (
                                            <CheckCircle size={18} />
                                        ) : (
                                            <AlertCircle size={18} />
                                        )}
                                        <span>{message.text}</span>
                                    </motion.div>
                                )}

                                <button 
                                    type="submit" 
                                    className="fp-submit-button"
                                    disabled={loading || !email}
                                >
                                    {loading ? (
                                        <span className="fp-button-loading">
                                            <Loader2 className="animate-spin" size={18} />
                                            Sending...
                                        </span>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            </form>

                            <div className="fp-footer">
                                <p>
                                    Remember your password?{" "}
                                    <button 
                                        onClick={() => navigate("/login")} 
                                        className="fp-link-button"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-message"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="fp-success-container"
                        >
                            <div className="fp-success-icon">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="fp-success-title">Check Your Email</h2>
                            <p className="fp-success-message">
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                            <p className="fp-success-note">
                                Didn't receive the email? Check your spam folder or{" "}
                                <button onClick={resetForm} className="fp-link-button">
                                    try another email address
                                </button>
                            </p>
                            <button
                                onClick={() => navigate("/login")}
                                className="fp-success-button"
                            >
                                Back to Login
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;