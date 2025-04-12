import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Vendor.css';

const VendorVerification = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    termsAccepted: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Email is invalid';
    
    if (!formData.phone) errors.phone = 'Phone number is required';
    else if (!/^[\d\s\+\-\(\)]{10,}$/.test(formData.phone)) errors.phone = 'Phone number is invalid';
    
    if (!formData.termsAccepted) errors.termsAccepted = 'You must accept the terms';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const startVerification = async (regenerate = false) => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const endpoint = regenerate 
        ? 'http://localhost:3001/api/regenerate-sumsub-link' 
        : 'http://localhost:3001/api/generate-sumsub-link';
      
      const response = await axios.post(endpoint, {
        userId,
        levelName: 'kyc_verification'
      });

      setSuccess(true);
      
      // Open SumSub in a new tab after a brief delay for better UX
      setTimeout(() => {
        window.open(response.data.url, '_blank', 'noopener,noreferrer');
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <div className={`verification-card ${shake ? 'shake' : ''}`}>
        <div className="verification-header">
          <h2>Vendor Identity Verification</h2>
          <p>Complete your verification to start selling on our platform</p>
        </div>
        
        <div className="verification-progress">
          <div className={`progress-step ${success ? 'completed' : 'active'}`}>
            <div className="step-number">1</div>
            <div className="step-label">Enter Details</div>
          </div>
          <div className={`progress-step ${success ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Verify Identity</div>
          </div>
        </div>
        
        {!success ? (
          <div className="verification-form">
            <div className={`form-group ${formErrors.email ? 'error' : ''}`}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled={loading}
              />
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
            </div>
            
            <div className={`form-group ${formErrors.phone ? 'error' : ''}`}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (123) 456-7890"
                disabled={loading}
              />
              {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
            </div>
            
            <div className={`form-group checkbox-group ${formErrors.termsAccepted ? 'error' : ''}`}>
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="termsAccepted">
                I accept the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and 
                <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </label>
              {formErrors.termsAccepted && <span className="error-message">{formErrors.termsAccepted}</span>}
            </div>
            
            <div className="form-actions">
              <button
                className="primary-button"
                onClick={() => startVerification(false)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : 'Start Verification'}
              </button>
              
              <button
                className="secondary-button"
                onClick={() => startVerification(true)}
                disabled={loading}
              >
                Restart Verification
              </button>
            </div>
          </div>
        ) : (
          <div className="verification-success">
            <div className="success-icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
            <h3>Verification Started Successfully!</h3>
            <p>Your verification window should open automatically. If it doesn't, please check your pop-up blocker.</p>
            <button 
              className="primary-button"
              onClick={() => startVerification(false)}
            >
              Reopen Verification
            </button>
          </div>
        )}
        
        {error && (
          <div className="error-message-container">
            <div className="error-icon">!</div>
            <div>{error}</div>
          </div>
        )}
      </div>
      
      <div className="verification-help">
        <h4>Need help with verification?</h4>
        <p>Contact our support team at <a href="mailto:support@vendors.com">support@vendors.com</a></p>
      </div>
    </div>
  );
};

export default VendorVerification;