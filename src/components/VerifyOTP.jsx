import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/verifyotp.css"; // Add styles if needed

const VerifyOTP = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp_code, setOtp] = useState(""); // Ensure consistency in naming
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "email") setEmail(value);
        if (name === "otp_code") setOtp(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // ✅ Corrected API request variable name (was "otp", now "otp_code")
            const response = await axios.post("http://127.0.0.1:8000/api/auth/verify-otp/", { email, otp_code });
            setMessage({ type: "success", text: response.data.message });

            // Redirect after successful OTP verification
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "Invalid OTP" });
        } finally {
            setLoading(false);
        }
    };

    // Handle the Resend OTP request
    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/auth/resend-otp/", { email });
            setMessage({ type: "success", text: response.data.message });
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "Failed to resend OTP" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otp-container">
            <h2>Verify OTP</h2>
            {message && <p className={`message ${message.type}`}>{message.text}</p>}
            
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={handleChange} 
                    required 
                />

                <input 
                    type="text" 
                    name="otp_code" 
                    placeholder="Enter OTP" 
                    value={otp_code} 
                    onChange={handleChange} 
                    required 
                />
                
                <button type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>
            </form>

            <p>
                Didn't receive an OTP? 
                <a href="#" onClick={handleResendOTP}>Resend OTP</a>
            </p>
        </div>
    );
};

export default VerifyOTP;
