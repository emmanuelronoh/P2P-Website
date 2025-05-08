
import React, { useState, useRef, useEffect } from 'react';
import '../styles/Support.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCheckCircle, FiAlertCircle, FiChevronDown } from 'react-icons/fi';

// API configuration
const API_BASE_URL = 'https://cheetahx.onrender.com/users/support';

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: 'general',
    transactionId: '',
    urgency: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [isLiveChatAvailable, setIsLiveChatAvailable] = useState(false);
  const [supportStats, setSupportStats] = useState({
    responseTime: '30min',
    satisfactionRate: '98%'
  });
  const formRef = useRef(null);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Fetch support statistics from backend
  const fetchSupportStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setSupportStats({
        responseTime: data.averageResponseTime || '30min',
        satisfactionRate: data.satisfactionRate || '98%'
      });
    } catch (error) {
      console.error('Error fetching support stats:', error);
    }
  };
  
  const checkLiveChatAvailability = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/live-chat/status`);
      if (!response.ok) throw new Error('Failed to check chat status');
      const data = await response.json();
      setIsLiveChatAvailable(data.isAvailable || false);
    } catch (error) {
      console.error('Error checking live chat status:', error);
      setIsLiveChatAvailable(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(response.statusText || 'Submission failed');
      }
      
      const data = await response.json();
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        message: '',
        category: 'general',
        transactionId: '',
        urgency: 'normal'
      });
      
      // Reset status after 4 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 4000);
      
    } catch (error) {
      console.error('Error submitting support request:', error);
      setSubmitStatus('error');
      setTimeout(() => {
        setSubmitStatus(null);
      }, 4000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Initialize component
  useEffect(() => {
    // Fetch initial data when component mounts
    fetchSupportStats();
    checkLiveChatAvailability();
    
    // Auto-scroll to form on load
    window.scrollTo({
      top: formRef.current?.offsetTop - 100 || 0,
      behavior: 'smooth'
    });
    
    // Set up periodic checks for live chat availability (every 5 minutes)
    const chatCheckInterval = setInterval(checkLiveChatAvailability, 300000);
    
    return () => {
      clearInterval(chatCheckInterval);
    };
  }, []);
  
  // Handle live chat button click
  const handleLiveChatClick = async () => {
    if (!isLiveChatAvailable) {
      alert('Live chat is currently unavailable. Please try again later or submit your request via the form.');
      return;
    }
    
    try {
      // Initiate live chat session
      const response = await fetch(`${API_BASE_URL}/live-chat/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name || 'Anonymous User',
          email: formData.email || '',
          category: formData.category
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to initiate live chat');
      }
      
      const data = await response.json();
      
      // In a real app, you would connect to the live chat system here
      alert(`Live chat session started! Session ID: ${data.sessionId}`);
      
    } catch (error) {
      console.error('Error initiating live chat:', error);
      alert('Failed to start live chat. Please try again later.');
    }
  };
  
  return (
    <div className="support-container">
      <motion.div 
        className="support-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>CheetahX Support Center</h1>
        <p>Our team is ready to help you with any issues regarding your P2P transactions</p>
      </motion.div>
      
      <motion.div 
        className="support-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="support-info" variants={itemVariants}>
          <h2>How can we help you today?</h2>
          <p>
            At CheetahX, we prioritize your trading experience. Our support team is available 
            24/7 to assist with escrow disputes, transaction issues, or general inquiries.
          </p>
          
          <div className="support-stats">
            <div className="stat-card">
              <motion.div 
                className="stat-number"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                24/7
              </motion.div>
              <div className="stat-label">Support Availability</div>
            </div>
            <div className="stat-card">
              <motion.div 
                className="stat-number"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <span className="fast-response">{supportStats.responseTime}</span>
              </motion.div>
              <div className="stat-label">Average Response Time</div>
            </div>
            <div className="stat-card">
              <motion.div 
                className="stat-number"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                {supportStats.satisfactionRate}
              </motion.div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </motion.div>
        
        <motion.form 
          ref={formRef}
          onSubmit={handleSubmit}
          className="support-form"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
        >
          <AnimatePresence>
            {submitStatus === 'success' && (
              <motion.div 
                className="alert success"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <FiCheckCircle /> Your message has been sent successfully!
              </motion.div>
            )}
            
            {submitStatus === 'error' && (
              <motion.div 
                className="alert error"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <FiAlertCircle /> There was an error sending your message. Please try again.
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Issue Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="general">General Inquiry</option>
              <option value="escrow">Escrow Issue</option>
              <option value="transaction">Transaction Problem</option>
              <option value="verification">Account Verification</option>
              <option value="security">Security Concern</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div 
            className="toggle-additional"
            onClick={() => setShowAdditionalFields(!showAdditionalFields)}
          >
            <span>Additional Information</span>
            <motion.div
              animate={{ rotate: showAdditionalFields ? 180 : 0 }}
            >
              <FiChevronDown />
            </motion.div>
          </div>
          
          <AnimatePresence>
            {showAdditionalFields && (
              <motion.div
                className="additional-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <label htmlFor="transactionId">Transaction ID (if applicable)</label>
                  <input
                    type="text"
                    id="transactionId"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    placeholder="Enter transaction ID"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="urgency">Urgency Level</label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                  >
                    <option value="low">Low - General Question</option>
                    <option value="normal">Normal - Need help</option>
                    <option value="high">High - Transaction blocked</option>
                    <option value="critical">Critical - Funds at risk</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="form-group">
            <label htmlFor="message">Your Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Describe your issue in detail..."
            />
          </div>
          
          <motion.button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <span className="spinner"></span>
            ) : (
              <>
                <FiSend /> Send Message
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
      
      <motion.div 
        className="support-cta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3>Need immediate assistance?</h3>
        <p>For urgent matters regarding active transactions, please contact our live support.</p>
        <motion.button
          className="live-chat-btn"
          onClick={handleLiveChatClick}
          whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          {isLiveChatAvailable ? 'Start Live Chat' : 'Live Chat Unavailable'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Support;
