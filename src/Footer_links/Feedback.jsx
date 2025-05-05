import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feedback.css';

const Feedback = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    rating: 0,
    message: '',
    feedback_type: 'general'
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (rating) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await fetch('http://127.0.0.1:8000/users/support/api/feedback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(feedback)
      });

      if (response.status === 401) {
        throw new Error('Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }

      const data = await response.json();
      console.log('Feedback submitted:', data);
      
      setSubmitted(true);
      setFeedback({
        name: '',
        email: '',
        rating: 0,
        message: '',
        feedback_type: 'general'
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
      if (err.message === 'Failed to fetch') {
        setError('Network error. Please check your connection.');
      } else if (err.message.includes('401')) {
        navigate('/login');
      } else {
        setError(err.message || 'An error occurred while submitting feedback');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError(null);
  };


  return (
    <div className="feedback-container">
      <header className="feedback-header">
        <div className="navigation-buttons">
          <button className="nav-button back-button" onClick={() => navigate(-1)}>
            &larr; Back
          </button>
          <button className="nav-button next-button" onClick={() => navigate(1)}>
            Next &rarr;
          </button>
        </div>
        <h1>Share Your Feedback</h1>
        <p className="subtitle">Help us improve CheetahX</p>
      </header>

      <main className="feedback-content">
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {submitted ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Thank You!</h2>
            <p>Your feedback has been submitted successfully.</p>
            <button className="submit-button" onClick={resetForm}>
              Submit Another Feedback
            </button>
          </div>
        ) : (
          <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Your Name (Optional)</label>
              <input
                type="text"
                id="name"
                name="name"
                value={feedback.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={feedback.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label>How would you rate your experience?</label>
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= feedback.rating ? 'filled' : ''}`}
                    onClick={() => handleRatingClick(star)}
                  >
                    {star <= feedback.rating ? '★' : '☆'}
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="feedback_type">Feedback Type</label>
              <select
                id="feedback_type"
                name="feedback_type"
                value={feedback.feedback_type}
                onChange={handleChange}
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="security">Security Concern</option>
                <option value="transaction">Transaction Issue</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Your Feedback</label>
              <textarea
                id="message"
                name="message"
                value={feedback.message}
                onChange={handleChange}
                placeholder="Tell us what you think..."
                required
                rows="5"
              ></textarea>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading || !feedback.message}
              >
                {isLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className="feedback-footer">
        <p className="contact-info">
          Need immediate help? <a href="mailto:admin@cheetahxofficial.com">Contact Support</a>
        </p>
      </footer>
    </div>
  );
};

export default Feedback;