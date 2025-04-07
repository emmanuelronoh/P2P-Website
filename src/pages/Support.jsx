import React, { useState, useRef, useEffect } from 'react';
import '../styles/Support.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCheckCircle, FiAlertCircle, FiChevronDown } from 'react-icons/fi';

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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically send to your backend
      // const response = await fetch('/api/support', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        message: '',
        category: 'general',
        transactionId: '',
        urgency: 'normal'
      });
      
      // Reset form after success
      setTimeout(() => {
        setSubmitStatus(null);
      }, 4000);
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => {
        setSubmitStatus(null);
      }, 4000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Auto-scroll to form on load
  useEffect(() => {
    window.scrollTo({
      top: formRef.current.offsetTop - 100,
      behavior: 'smooth'
    });
  }, []);
  
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
                <span className="fast-response">30</span>min
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
                98%
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
          whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          Start Live Chat
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Support;