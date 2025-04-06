// src/components/SecurityVerification.jsx
import { useState } from 'react';
import '../styles/SecurityVerification.css';

const SecurityVerification = ({ onComplete, onCancel }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1 = email, 2 = 2fa, 3 = complete
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setStep(3);
    onComplete();
  };

  return (
    <div className="security-verification">
      <h3>Security Verification</h3>
      
      {step === 1 && (
        <div className="verification-step">
          <p>We've sent a verification code to your email address.</p>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            <div className="button-group">
              <button type="button" onClick={onCancel}>Cancel</button>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="security-tips">
        <p><strong>Security Tip:</strong> Never share your verification codes with anyone.</p>
      </div>
    </div>
  );
};

export default SecurityVerification;