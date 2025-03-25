import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";

const Register = () => {
    const navigate = useNavigate();  // To redirect after registration
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
    });

    const [message, setMessage] = useState(null); // Success/Error messages
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/auth/register/", formData);
            setMessage({ type: "success", text: response.data.message });

            // Redirect to OTP verification page after 3 seconds
            setTimeout(() => navigate("/verify-otp"), 3000);
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "Registration failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {message && <p className={`message ${message.type}`}>{message.text}</p>}
            
            <form onSubmit={handleSubmit}>
                <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
                <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                
                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Sign Up"}
                </button>
            </form>

            <p>Already have an account? <a href="/login">Login</a></p>
        </div>
    );
};

export default Register;
