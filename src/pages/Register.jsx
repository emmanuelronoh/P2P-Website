import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "../styles/register.css";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
    });

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState("");
    const [passwordStrength, setPasswordStrength] = useState(0);

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length > 0) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d|\W/.test(password)) strength++;
        setPasswordStrength(strength);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRecaptchaChange = (token) => {
        console.log("reCAPTCHA Token:", token); // Debugging
        setRecaptchaToken(token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!recaptchaToken) {
            setMessage({ type: "error", text: "Please verify the reCAPTCHA!" });
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirm_password) {
            setMessage({ type: "error", text: "Passwords do not match!" });
            setLoading(false);
            return;
        }

        try {
            console.log("Submitting Data:", { ...formData, recaptcha_token: recaptchaToken }); // Debugging
            const response = await axios.post("http://127.0.0.1:8000/api/auth/register/", {
                ...formData,
                recaptcha_token: recaptchaToken, // Ensure backend expects 'recaptcha_token'
            });

            setMessage({ type: "success", text: response.data.message });
            setTimeout(() => navigate("/verify-otp"), 3000);
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.error || "Registration failed. Please try again."
            });
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
                <input type="tel" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} required inputMode="numeric" />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => {
                        handleChange(e);
                        checkPasswordStrength(e.target.value);
                    }}
                    required
                />
                <input
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm Password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                />

                <div className="password-strength" data-strength={passwordStrength}></div>

                {/* Google reCAPTCHA */}
                <ReCAPTCHA
                    sitekey="6LfT4AkrAAAAAKhfeBpip7t-ZShH31sOIQ1MlzSM"  // Updated to your new key
                    onChange={handleRecaptchaChange}
                    size="normal"
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Sign Up"}
                </button>
            </form>

            <p>Already have an account? <a href="/login">Login</a></p>
        </div>
    );
};

export default Register;
