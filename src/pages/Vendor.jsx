import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Vendor.css';

const VendorVerification = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    termsAccepted: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [state, setState] = useState({
    loading: false,
    error: null,
    verificationUrl: null,
    success: false,
    verificationStatus: null,
    pollCount: 0
  });

  // Handle error animation
  useEffect(() => {
    if (state.error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

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

  const startVerification = async () => {
    if (!validateForm()) return;
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      verificationStatus: null,
      pollCount: 0
    }));
  
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication required - please login');
      }
  
      // Get current user ID (you might need to adjust this based on your auth system)
      const userId = localStorage.getItem('userId') || 'temp-user'; // Fallback if needed
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/generate-sumsub-link`, 
        {
          userId: userId,
          levelName: 'kyc_verification', // or whatever level name you're using
          email: formData.email, // include collected data
          phone: formData.phone
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
  
      if (!response.data?.url) {
        throw new Error('Invalid response from verification service');
      }
  
      // Try to open in new tab first
      const newWindow = window.open(response.data.url, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback to current tab if popup blocked
        window.location.href = response.data.url;
      }
  
      setState(prev => ({
        ...prev,
        loading: false,
        verificationUrl: response.data.url,
        success: true
      }));
  
    } catch (err) {
      console.error('Verification error:', err);
      
      let errorMessage = 'Verification failed';
      if (err.response) {
        if (err.response.data?.error) {
          errorMessage = err.response.data.error;
          if (err.response.data.details) {
            errorMessage += `: ${err.response.data.details}`;
          }
        } else if (err.response.status === 401) {
          errorMessage = 'Session expired - please login again';
        } else if (err.response.status === 400) {
          errorMessage = 'Validation error - please check your details';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
  
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
    }
  };

  const renderVerificationStatus = () => {
    if (!state.verificationUrl) return null;

    return (
      <div className="verification-success">
        <div className="success-icon">
          <svg viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </div>
        <h3>Verification Started Successfully!</h3>
        <p>Your verification window should open automatically.</p>
        <button
          className="primary-button"
          onClick={() => window.open(state.verificationUrl, '_blank')}
        >
          Reopen Verification
        </button>
      </div>
    );
  };

  return (
    <div className="verification-container">
      <div className={`verification-card ${shake ? 'shake' : ''}`}>
        <div className="verification-header">
          <h2>Vendor Identity Verification</h2>
          <p>Complete your verification to start selling on our platform</p>
        </div>

        <div className="verification-progress">
          <div className={`progress-step ${state.success ? 'completed' : 'active'}`}>
            <div className="step-number">1</div>
            <div className="step-label">Enter Details</div>
          </div>
          <div className={`progress-step ${state.success ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Verify Identity</div>
          </div>
        </div>

        {!state.success ? (
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
                disabled={state.loading}
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
                disabled={state.loading}
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
                disabled={state.loading}
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
                onClick={startVerification}
                disabled={state.loading}
              >
                {state.loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : 'Start Verification'}
              </button>
            </div>
          </div>
        ) : (
          renderVerificationStatus()
        )}

        {state.error && (
          <div className="error-message-container">
            <div className="error-icon">!</div>
            <div>{state.error}</div>
          </div>
        )}
      </div>

      <div className="verification-help">
        <h4>Need help with verification?</h4>
        <p>Contact our support team at <a href="mailto:admin@cheetahxofficial.com">admin@cheetahxofficial.com</a></p>
      </div>
    </div>
  );
};

export default VendorVerification;