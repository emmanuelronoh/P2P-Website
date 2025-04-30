import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import "../styles/resetPassword.css";

const ResetPassword = () => {
    const { uidb64, token } = useParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!newPassword || !confirmPassword) {
            setMessage({ type: "error", text: "Please fill in all fields" });
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords don't match" });
            return;
        }
        
        setLoading(true);
        setMessage(null);

        try {
            const response = await axios.post(
                "http://localhost:8000/api/auth/reset-password/",
                {
                    uidb64,
                    token,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                }
            );
            
            setMessage({ 
                type: "success", 
                text: response.data.message || "Password reset successfully!" 
            });
            
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.error || 
                     error.response?.data?.message ||
                     "Password reset failed. The link may be invalid or expired.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rp-container">
            <motion.div 
                className="rp-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="rp-header">
                    <div className="rp-icon-circle">
                        <Lock size={24} />
                    </div>
                    <h2 className="rp-title">Reset Your Password</h2>
                    <p className="rp-subtitle">
                        Create a new password for your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="rp-form">
                    <div className="rp-input-group">
                        <label htmlFor="newPassword" className="rp-label">New Password</label>
                        <div className="rp-password-input">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="newPassword"
                                className="rp-input"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength="8"
                            />
                            <button
                                type="button"
                                className="rp-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="rp-input-group">
                        <label htmlFor="confirmPassword" className="rp-label">Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="confirmPassword"
                            className="rp-input"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {message && (
                        <motion.div 
                            className={`rp-message ${message.type}`}
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
                        className="rp-submit-button"
                        disabled={loading || !newPassword || !confirmPassword}
                    >
                        {loading ? (
                            <span className="rp-button-loading">
                                <Loader2 className="animate-spin" size={18} />
                                Resetting...
                            </span>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>

                <div className="rp-footer">
                    <p>
                        Remember your password?{" "}
                        <button 
                            onClick={() => navigate("/login")} 
                            className="rp-link-button"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
