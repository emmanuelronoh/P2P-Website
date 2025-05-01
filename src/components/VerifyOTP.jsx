import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/verifyotp.css";

const VerifyOTP = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        otp_code: ""
    });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        // Countdown timer for resend OTP
        let timer;
        if (countdown > 0 && resendDisabled) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            setResendDisabled(false);
        }
        return () => clearTimeout(timer);
    }, [countdown, resendDisabled]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || !formData.otp_code) return;

        setLoading(true);
        setMessage(null);

        try {
            const response = await axios.post(
                "https://cheetahx.onrender.com/api/auth/verify-email/",
                formData
            );

            setMessage({
                type: "success",
                text: response.data.message || "Email verified successfully!",
                persistent: false
            });

            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                "Invalid OTP. Please try again.";

            setMessage({
                type: "error",
                text: errorMessage,
                persistent: true
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendDisabled || !formData.email) return;

        setLoading(true);
        setMessage(null);
        setResendDisabled(true);
        setCountdown(30);

        try {
            const response = await axios.post(
                "https://cheetahx.onrender.com/api/auth/resend-otp/",
                { email: formData.email }
            );

            setMessage({
                type: "success",
                text: response.data.message || "New OTP sent successfully!",
                persistent: false
            });
        } catch (error) {
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to resend OTP. Please try again.";

            setMessage({
                type: "error",
                text: errorMessage,
                persistent: true
            });
            setResendDisabled(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Verify Your Email</h1>
                    <p className="auth-subheader">
                        We've sent a 6-digit code to <strong>{formData.email || 'your email'}</strong>
                    </p>
                </div>

                {message && (
                    <div className={`auth-message ${message.type} ${message.persistent ? 'persistent' : ''}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Verification Code</label>
                        <input
                            type="text"
                            name="otp_code"
                            maxLength="6"
                            placeholder="Enter OTP code"
                            value={formData.otp_code}
                            onChange={handleChange}
                            disabled={loading}
                            autoFocus
                        />
                        <div className="otp-hint">
                            Enter the 6-digit code sent to your email
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-button primary"
                        disabled={loading || !formData.otp_code}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Verifying...
                            </>
                        ) : (
                            "Verify Account"
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Didn't receive a code?{' '}
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={resendDisabled || loading || !formData.email}
                            className="resend-button"
                        >
                            {resendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
                        </button>
                    </p>
                    <p className="support-text">
                        Having trouble? <a href="/contact">Contact support</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;

