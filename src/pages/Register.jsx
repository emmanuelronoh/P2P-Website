import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
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
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});

    // Password strength meter with detailed feedback
    const checkPasswordStrength = (password) => {
        let strength = 0;
        let feedback = [];
        
        if (password.length === 0) {
            setPasswordStrength({ score: 0, feedback: "" });
            return;
        }

        // Length check
        if (password.length < 8) {
            feedback.push("Password should be at least 8 characters");
        } else {
            strength++;
        }

        // Uppercase check
        if (!/[A-Z]/.test(password)) {
            feedback.push("Add at least one uppercase letter");
        } else {
            strength++;
        }

        // Number/special char check
        if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
            feedback.push("Add at least one number or special character");
        } else {
            strength++;
        }

        // Very strong check
        if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
            strength = 4;
            feedback = ["Very strong password!"];
        }

        setPasswordStrength({
            score: strength,
            feedback: feedback.length > 0 ? feedback.join(". ") : "Strong password!"
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Update touched fields
        if (!touchedFields[name]) {
            setTouchedFields({ ...touchedFields, [name]: true });
        }
        
        // Check password strength in real-time
        if (name === "password") {
            checkPasswordStrength(value);
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        if (!touchedFields[name]) {
            setTouchedFields({ ...touchedFields, [name]: true });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Validate form before submission
        if (formData.password !== formData.confirm_password) {
            setMessage({ type: "error", text: "Passwords do not match!" });
            setLoading(false);
            return;
        }

        if (passwordStrength.score < 2) {
            setMessage({ 
                type: "error", 
                text: "Please choose a stronger password. " + passwordStrength.feedback 
            });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                "https://cheetahx.onrender.com/api/auth/register/", 
                formData
            );

            setMessage({ 
                type: "success", 
                text: response.data.message || "Registration successful! Redirecting to verification..." 
            });
            
            setTimeout(() => navigate("/verify-otp"), 3000);
        } catch (error) {
            let errorMessage = "Registration failed. Please try again.";
            
            if (error.response) {
                if (error.response.data) {
                    // Handle Django error responses
                    if (error.response.data.errors) {
                        errorMessage = Object.values(error.response.data.errors)
                            .flat()
                            .join(". ");
                    } else if (error.response.data.error) {
                        errorMessage = error.response.data.error;
                    } else if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                }
            }
            
            setMessage({
                type: "error",
                text: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    // Check if all required fields are filled
    const isFormValid = () => {
        return (
            formData.username &&
            formData.email &&
            formData.password &&
            formData.confirm_password &&
            formData.first_name &&
            formData.last_name &&
            formData.phone_number &&
            formData.password === formData.confirm_password &&
            passwordStrength.score >= 2
        );
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h2>Create Your Account</h2>
                    <p>Join our community today</p>
                </div>

                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                        {message.type === "success" && (
                            <div className="progress-bar">
                                <div className="progress"></div>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="first_name">First Name</label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                placeholder="John"
                                value={formData.first_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={touchedFields.first_name && !formData.first_name ? "error" : ""}
                            />
                            {touchedFields.first_name && !formData.first_name && (
                                <span className="error-message">First name is required</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="last_name">Last Name</label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                placeholder="Doe"
                                value={formData.last_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={touchedFields.last_name && !formData.last_name ? "error" : ""}
                            />
                            {touchedFields.last_name && !formData.last_name && (
                                <span className="error-message">Last name is required</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="johndoe123"
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className={touchedFields.username && !formData.username ? "error" : ""}
                        />
                        {touchedFields.username && !formData.username && (
                            <span className="error-message">Username is required</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className={touchedFields.email && !formData.email ? "error" : ""}
                        />
                        {touchedFields.email && !formData.email && (
                            <span className="error-message">Email is required</span>
                        )}
                        {touchedFields.email && formData.email && !/^\S+@\S+\.\S+$/.test(formData.email) && (
                            <span className="error-message">Please enter a valid email</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone_number">Phone Number</label>
                        <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            placeholder="1234567890"
                            value={formData.phone_number}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            inputMode="numeric"
                            className={touchedFields.phone_number && !formData.phone_number ? "error" : ""}
                        />
                        {touchedFields.phone_number && !formData.phone_number && (
                            <span className="error-message">Phone number is required</span>
                        )}
                    </div>

                    <div className="form-group password-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e) => {
                                    handleChange(e);
                                    checkPasswordStrength(e.target.value);
                                }}
                                onBlur={handleBlur}
                                required
                                className={touchedFields.password && !formData.password ? "error" : ""}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {touchedFields.password && !formData.password && (
                            <span className="error-message">Password is required</span>
                        )}
                        
                        <div className="password-strength-meter">
                            <div className="strength-bars">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={`strength-bar ${passwordStrength.score >= level ? `strength-${passwordStrength.score}` : ""}`}
                                    ></div>
                                ))}
                            </div>
                            {formData.password && (
                                <div className={`strength-feedback strength-${passwordStrength.score}`}>
                                    {passwordStrength.feedback}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group password-group">
                        <label htmlFor="confirm_password">Confirm Password</label>
                        <div className="password-input-container">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirm_password"
                                name="confirm_password"
                                placeholder="Confirm your password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={touchedFields.confirm_password && !formData.confirm_password ? "error" : ""}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {touchedFields.confirm_password && !formData.confirm_password && (
                            <span className="error-message">Please confirm your password</span>
                        )}
                        {touchedFields.confirm_password && formData.password !== formData.confirm_password && formData.confirm_password && (
                            <span className="error-message">Passwords do not match</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading || !isFormValid()}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creating Account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>

                    <div className="login-link">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </div>

                    <div className="terms-agreement">
                        By creating an account, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;