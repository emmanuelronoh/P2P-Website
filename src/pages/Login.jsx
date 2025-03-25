import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

const Login = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); 

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/auth/login/", { 
                email,
                password 
            });

            if (response.status === 200) {
                localStorage.setItem("accessToken", response.data.access);
                localStorage.setItem("refreshToken", response.data.refresh);
                
                setIsAuthenticated(true); // ✅ Update auth state in App.js
                alert("Login Successful!");
                navigate("/dashboard");
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data.error || "Invalid credentials");
            } else {
                setError("An error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}

                <label>Email</label>
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />

                <label>Password</label>
                <input 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />

                <button type="submit">Login</button>

                <div className="forgot-password">
                    <p>
                        Forgot your password? <a href="/forgot-password">Click here</a> to reset.
                    </p>
                </div>

                <p>
                    Don't have an account? <a href="/register">Register here</a>
                </p>
            </form>
        </div>
    );
};

export default Login;
