import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/forgotPassword.css"; // Add your styling here

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(""); // Clear any previous message

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/auth/reset-password/", {
                email,
            });
            setMessage({ type: "success", text: response.data.message });
            setTimeout(() => navigate("/login"), 3000); // Redirect to login after 3 seconds
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "An error occurred. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <h2>Forgot Password</h2>
            {message && <p className={`message ${message.type}`}>{message.text}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>
            <p>
                Remembered your password? <a href="/login">Login here</a>
            </p>
        </div>
    );
};

export default ForgotPassword;
