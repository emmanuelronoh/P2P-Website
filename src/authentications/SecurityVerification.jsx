import React from "react";
import { useState, useEffect } from 'react';
import axios from 'axios'; // or your preferred HTTP client
import '../styles/SecurityVerification.css';

const SecurityVerification = ({ onComplete, onCancel }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Send verification code on component mount
  useEffect(() => {
    sendVerificationCode();
  }, []);

  // Handle resend timer
  useEffect(() => {
    if (resendDisabled && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
      setResendTimer(30);
    }
  }, [resendDisabled, resendTimer]);

  const sendVerificationCode = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('Token being sent:', localStorage.getItem('accessToken'));
      const response = await axios.post('https://cheetahx.onrender.com/crypto/api/auth/send-verification-code/', {
        // You might want to include trade details here
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      setResendDisabled(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.post('https://cheetahx.onrender.com/crypto/api/auth/verify-code/', {
        code: verificationCode,
        // Include any trade context if needed
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      onComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="security-verification">
      <h3>Security Verification</h3>
      
      <div className="verification-step">
        <p>We've sent a 6-digit verification code to your registered email address.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
                setError('');
              }}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="resend-code">
            <span>Didn't receive code?</span>
            <button 
              type="button" 
              onClick={sendVerificationCode}
              disabled={resendDisabled || isLoading}
            >
              {resendDisabled ? `Resend in ${resendTimer}s` : 'Resend Code'}
            </button>
          </div>
          
          <div className="button-group">
            <button type="button" onClick={onCancel} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="security-tips">
        <p><strong>Security Tip:</strong> Never share your verification codes with anyone.</p>
      </div>
    </div>
  );
};

export default SecurityVerification;
