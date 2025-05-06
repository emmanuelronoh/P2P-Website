import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./register.css";

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

    const [fieldErrors, setFieldErrors] = useState({
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
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [checkingUsername, setCheckingUsername] = useState(false);

    // Debounce function to limit API calls
    const debounce = (func, delay) => {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Check if email exists in database
    const checkEmailAvailability = async (email) => {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) return;

        setCheckingEmail(true);
        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/api/auth/check-email/?email=${encodeURIComponent(email)}`
            );
            if (response.data.exists) {
                setFieldErrors(prev => ({
                    ...prev,
                    email: "This email is already registered"
                }));
            }
        } catch (error) {
            console.error("Email check error:", error);
        } finally {
            setCheckingEmail(false);
        }
    };

    // Check if username exists in database
    const checkUsernameAvailability = async (username) => {
        if (!username) return;

        setCheckingUsername(true);
        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/api/auth/check-username/?username=${encodeURIComponent(username)}`
            );
            if (response.data.exists) {
                setFieldErrors(prev => ({
                    ...prev,
                    username: "This username is already taken"
                }));
            }
        } catch (error) {
            console.error("Username check error:", error);
        } finally {
            setCheckingUsername(false);
        }
    };

    // Debounced versions of the check functions
    const debouncedCheckEmail = debounce(checkEmailAvailability, 500);
    const debouncedCheckUsername = debounce(checkUsernameAvailability, 500);

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
            feedback.push("At least 8 characters");
        } else {
            strength++;
        }

        // Uppercase check
        if (!/[A-Z]/.test(password)) {
            feedback.push("one uppercase letter");
        } else {
            strength++;
        }

        // Lowercase check
        if (!/[a-z]/.test(password)) {
            feedback.push("one lowercase letter");
        } else {
            strength++;
        }

        // Number/special char check
        if (!/[0-9]/.test(password)) {
            feedback.push("one number");
        } else {
            strength++;
        }

        // Special char check
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            feedback.push("one special character");
        } else {
            strength++;
        }

        // Very strong check
        if (password.length >= 12 && strength >= 4) {
            strength = 5;
            feedback = ["Excellent password!"];
        }

        setPasswordStrength({
            score: strength,
            feedback: feedback.length > 0 ?
                `Should contain: ${feedback.join(", ")}` :
                "Strong password!"
        });
    };

    const validateField = (name, value) => {
        let error = "";

        if (!value) {
            error = "This field is required";
        } else {
            switch (name) {
                case "email":
                    if (!/^\S+@\S+\.\S+$/.test(value)) {
                        error = "Please enter a valid email address";
                    }
                    break;
                case "phone_number":
                    if (!/^\+?[0-9]{10,15}$/.test(value)) {
                        error = "Please enter a valid phone number";
                    }
                    break;

                case "username":
                    if (!/^[a-zA-Z][a-zA-Z0-9_]{3,29}$/.test(value)) {
                        error = "4-30 characters, must start with a letter, and can only contain letters, numbers and underscores";
                    }
                    break;
                case "password":
                    if (value.length < 8) {
                        error = "Password must be at least 8 characters";
                    }
                    break;
                case "confirm_password":
                    if (value !== formData.password) {
                        error = "Passwords do not match";
                    }
                    break;
            }
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validate the field
        const error = validateField(name, value);
        setFieldErrors(prev => ({ ...prev, [name]: error }));

        // Update touched fields
        if (!touchedFields[name]) {
            setTouchedFields(prev => ({ ...prev, [name]: true }));
        }

        // Special handling for specific fields
        if (name === "password") {
            checkPasswordStrength(value);
            // Also validate confirm_password if it's been touched
            if (touchedFields.confirm_password) {
                const confirmError = validateField("confirm_password", formData.confirm_password);
                setFieldErrors(prev => ({ ...prev, confirm_password: confirmError }));
            }
        } else if (name === "email") {
            debouncedCheckEmail(value);
        } else if (name === "username") {
            debouncedCheckUsername(value);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (!touchedFields[name]) {
            setTouchedFields(prev => ({ ...prev, [name]: true }));
        }

        // Validate the field on blur
        const error = validateField(name, value);
        setFieldErrors(prev => ({ ...prev, [name]: error }));
    };

    const formatBackendErrors = (errors) => {
        const formattedErrors = {};

        if (typeof errors === 'string') {
            return { non_field_errors: [errors] };
        }

        if (Array.isArray(errors)) {
            return { non_field_errors: errors };
        }

        for (const field in errors) {
            if (Array.isArray(errors[field])) {
                formattedErrors[field] = errors[field].join(' ');
            } else if (typeof errors[field] === 'object') {
                formattedErrors[field] = Object.values(errors[field]).join(' ');
            } else {
                formattedErrors[field] = errors[field];
            }
        }

        return formattedErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Validate all fields before submission
        let hasErrors = false;
        const newErrors = {};

        for (const field in formData) {
            const error = validateField(field, formData[field]);
            newErrors[field] = error;
            if (error) hasErrors = true;
        }

        // Additional password validation
        if (passwordStrength.score < 3) {
            newErrors.password = "Please choose a stronger password. " + passwordStrength.feedback;
            hasErrors = true;
        }

        if (hasErrors) {
            setFieldErrors(newErrors);
            setLoading(false);
            setMessage({
                type: "error",
                text: "Please correct the errors in the form"
            });
            return;
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/auth/register/",
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    validateStatus: function (status) {
                        return status >= 200 && status < 500;
                    }
                }
            );

            if (response.status === 200) {
                setMessage({
                    type: "success",
                    text: response.data.message || "Registration successful! Please check your email for verification."
                });
                setTimeout(() => navigate("/verify-otp"), 3000);
            } else {
                const backendErrors = formatBackendErrors(response.data);
                const updatedFieldErrors = { ...fieldErrors };

                for (const field in backendErrors) {
                    if (field in updatedFieldErrors) {
                        updatedFieldErrors[field] = backendErrors[field];
                    }
                }

                setFieldErrors(updatedFieldErrors);

                const errorMessage = backendErrors.non_field_errors ?
                    backendErrors.non_field_errors.join(' ') :
                    "Registration failed. Please check the form and try again.";

                setMessage({
                    type: "error",
                    text: errorMessage
                });
            }
        } catch (error) {
            let errorMessage = "Registration failed. Please try again later.";

            if (error.response) {
                errorMessage = error.response.data.detail || errorMessage;
            } else if (error.request) {
                errorMessage = "Network error. Please check your internet connection.";
            }

            setMessage({
                type: "error",
                text: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        // Check all required fields are filled
        for (const field in formData) {
            if (!formData[field]) return false;
        }

        // Check no field errors
        for (const field in fieldErrors) {
            if (fieldErrors[field]) return false;
        }

        // Check password strength
        if (passwordStrength.score < 3) return false;

        // Check passwords match
        if (formData.password !== formData.confirm_password) return false;

        // Check no async validations are running
        if (checkingEmail || checkingUsername) return false;

        return true;
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

                <form onSubmit={handleSubmit} className="register-form" noValidate>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="first_name">First Name*</label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                placeholder="John"
                                value={formData.first_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={fieldErrors.first_name ? "error" : ""}
                                aria-invalid={!!fieldErrors.first_name}
                                aria-describedby={fieldErrors.first_name ? "first_name-error" : undefined}
                            />
                            {fieldErrors.first_name && (
                                <span id="first_name-error" className="error-message">
                                    {fieldErrors.first_name}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="last_name">Last Name*</label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                placeholder="Doe"
                                value={formData.last_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={fieldErrors.last_name ? "error" : ""}
                                aria-invalid={!!fieldErrors.last_name}
                                aria-describedby={fieldErrors.last_name ? "last_name-error" : undefined}
                            />
                            {fieldErrors.last_name && (
                                <span id="last_name-error" className="error-message">
                                    {fieldErrors.last_name}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username*</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="johndoe123"
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className={fieldErrors.username ? "error" : ""}
                            aria-invalid={!!fieldErrors.username}
                            aria-describedby={fieldErrors.username ? "username-error" : undefined}
                        />
                        {fieldErrors.username && (
                            <span id="username-error" className="error-message">
                                {fieldErrors.username}
                            </span>
                        )}
                        {checkingUsername && (
                            <span className="checking-message">Checking username availability...</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email*</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className={fieldErrors.email ? "error" : ""}
                            aria-invalid={!!fieldErrors.email}
                            aria-describedby={fieldErrors.email ? "email-error" : undefined}
                        />
                        {fieldErrors.email && (
                            <span id="email-error" className="error-message">
                                {fieldErrors.email}
                            </span>
                        )}
                        {checkingEmail && (
                            <span className="checking-message">Checking email availability...</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone_number">Phone Number*</label>
                        <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            placeholder="+1234567890"
                            value={formData.phone_number}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className={fieldErrors.phone_number ? "error" : ""}
                            aria-invalid={!!fieldErrors.phone_number}
                            aria-describedby={fieldErrors.phone_number ? "phone_number-error" : undefined}
                        />
                        {fieldErrors.phone_number && (
                            <span id="phone_number-error" className="error-message">
                                {fieldErrors.phone_number}
                            </span>
                        )}
                    </div>

                    <div className="form-group password-group">
                        <label htmlFor="password">Password*</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={fieldErrors.password ? "error" : ""}
                                aria-invalid={!!fieldErrors.password}
                                aria-describedby={fieldErrors.password ? "password-error" : undefined}
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
                        {fieldErrors.password && (
                            <span id="password-error" className="error-message">
                                {fieldErrors.password}
                            </span>
                        )}

                        <div className="password-strength-meter">
                            <div className="strength-bars">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                        key={level}
                                        className={`strength-bar ${passwordStrength.score >= level ?
                                                `strength-${passwordStrength.score}` : ""
                                            }`}
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
                        <label htmlFor="confirm_password">Confirm Password*</label>
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
                                className={fieldErrors.confirm_password ? "error" : ""}
                                aria-invalid={!!fieldErrors.confirm_password}
                                aria-describedby={fieldErrors.confirm_password ? "confirm_password-error" : undefined}
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
                        {fieldErrors.confirm_password && (
                            <span id="confirm_password-error" className="error-message">
                                {fieldErrors.confirm_password}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading || !isFormValid()}
                        aria-busy={loading}
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