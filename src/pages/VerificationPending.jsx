import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock, 
  FiMail, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiHelpCircle,
  FiRefreshCw,
  FiExternalLink
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import '../styles/VerificationPending.css';

const VerificationPending = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const userEmail = localStorage.getItem('userEmail') || 'your email';

  // Check verification status periodically
  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      try {
        await checkVerificationStatus();
        setLastChecked(new Date().toLocaleTimeString());
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkStatus();

    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const checkVerificationStatus = async () => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/verification/status');
      // if (response.verified) navigate('/dashboard');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Status check failed:", error);
    }
  };

  const handleResubmit = () => {
    navigate('/kyc-verification');
  };

  const handleContactSupport = () => {
    window.open('mailto:support@cheetahx.com?subject=Verification%20Help');
  };

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      await checkVerificationStatus();
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setIsChecking(false);
    }
  };

  const handleGoToMarket = () => {
    navigate('/market');
  };

  return (
    <div className="verification-page">
      <motion.div 
        className="verification-page__card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="verification-page__header">
          <div className="verification-page__icon-container">
            <FiClock className="verification-page__icon" />
            <div className="verification-page__pulse" />
          </div>
          <h1 className="verification-page__title">Verification Under Review</h1>
          <p className="verification-page__subtitle">We're reviewing your submitted documents</p>
        </div>

        <div className="verification-page__content">
          <div className="verification-page__progress">
            <div className="verification-page__progress-step verification-page__progress-step--completed">
              <FiCheckCircle className="verification-page__step-icon" />
              <span>Submitted</span>
            </div>
            <div className="verification-page__progress-line verification-page__progress-line--active" />
            <div className="verification-page__progress-step verification-page__progress-step--active">
              <div className="verification-page__pulse-dot" />
              <span>Under Review</span>
            </div>
            <div className="verification-page__progress-line" />
            <div className="verification-page__progress-step">
              <span>Verified</span>
            </div>
          </div>

          <div className="verification-page__details">
            <div className="verification-page__alert verification-page__alert--warning">
              <FiAlertCircle className="verification-page__alert-icon" />
              <div className="verification-page__alert-content">
                <h3>What to Expect Next</h3>
                <ul>
                  <li>Typical review time: 24-48 hours</li>
                  <li>We may contact you for additional information</li>
                  <li>You'll receive email notifications for updates</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="verification-page__actions">
            <button 
              className="verification-page__button verification-page__button--primary"
              onClick={handleGoToMarket}
            >
              Go to Market
            </button>
            <button 
              className="verification-page__button verification-page__button--secondary"
              onClick={handleContactSupport}
            >
              <FiHelpCircle /> Contact Support
            </button>
          </div>

          <div className="verification-page__status-check">
            <button 
              className="verification-page__button verification-page__button--primary"
              onClick={handleManualCheck} 
              disabled={isChecking}
            >
              <FiRefreshCw className={isChecking ? 'verification-page__spin' : ''} />
              {isChecking ? 'Checking...' : 'Check Status Now'}
            </button>
            {lastChecked && (
              <div className="verification-page__last-checked">Last checked: {lastChecked}</div>
            )}
          </div>

          <div className="verification-page__faq">
            <h3 className="verification-page__faq-title">Common Questions</h3>
            <div className="verification-page__faq-item">
              <h4>Why is verification taking so long?</h4>
              <p>We manually review each submission to ensure security and compliance with financial regulations. This helps protect all users on our platform.</p>
            </div>
            <div className="verification-page__faq-item">
              <h4>What documents do I need?</h4>
              <p>Typically a government-issued ID (passport, driver's license) and proof of address (utility bill, bank statement). Requirements may vary by region.</p>
            </div>
            <div className="verification-page__faq-item">
              <h4>Can I speed up the process?</h4>
              <p>Ensure your documents are clear, valid, and show all required information. Blurry or expired documents will delay verification.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerificationPending;