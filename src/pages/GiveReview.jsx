import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaStar, FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import '../styles/GiveReview.css';

const GiveReview = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { chatRoomId } = useParams();

  // State from navigation (passed when clicking "I have paid")
  const { counterparty, tradeId, orderDetails } = location.state || {};

  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://cheetahx.onrender.com';

  // Get the trade ID from either location state or params
  const effectiveTradeId = tradeId || chatRoomId;

  // Fetch trade details if not passed in state
  useEffect(() => {
    if (!counterparty || !effectiveTradeId) {
      setError('Missing trade information. Please go back and try again.');
      setIsLoading(false);
      return;
    }

    if (!counterparty) {
      const fetchTradeDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem('accessToken');
          
          // First try to get trade details using the chat room ID
          const response = await axios.get(
            `${API_BASE_URL}/api/chat-rooms/${chatRoomId}/trade-details/`, 
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (!response.data) {
            throw new Error('No data received');
          }

          // Determine counterparty (buyer or seller)
          const counterpartyData = 
            response.data.buyer.id === user?.id 
              ? response.data.seller 
              : response.data.buyer;
          
          // Update location state with trade details
          location.state = {
            ...location.state,
            counterparty: counterpartyData,
            tradeId: response.data.id,
            orderDetails: response.data.order
          };
        } catch (err) {
          console.error('Failed to fetch trade details:', err);
          
          // Fallback to try with trade ID if chat room request fails
          if (effectiveTradeId && effectiveTradeId !== chatRoomId) {
            try {
              const token = localStorage.getItem('accessToken');
              const tradeResponse = await axios.get(
                `${API_BASE_URL}/api/trades/${effectiveTradeId}/`, 
                {
                  headers: { Authorization: `Bearer ${token}` }
                }
              );

              if (tradeResponse.data) {
                const counterpartyData = 
                  tradeResponse.data.buyer.id === user?.id 
                    ? tradeResponse.data.seller 
                    : tradeResponse.data.buyer;
                
                location.state = {
                  ...location.state,
                  counterparty: counterpartyData,
                  tradeId: tradeResponse.data.id,
                  orderDetails: tradeResponse.data.order
                };
              }
            } catch (tradeError) {
              console.error('Fallback trade fetch failed:', tradeError);
              setError('Failed to load trade details. Please try again later.');
            }
          } else {
            setError('Failed to load trade details. Please try again later.');
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchTradeDetails();
    }
  }, [chatRoomId, counterparty, effectiveTradeId, user, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!effectiveTradeId || !counterparty?.id || !user?.id) {
      setError('Missing required information. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_BASE_URL}/api/reviews/`,
        {
          trade: effectiveTradeId,
          reviewer: user.id,
          reviewee: counterparty.id,
          rating,
          comment: reviewText,
          is_public: isPublic
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Review submitted successfully!');
      navigate(`/messages/${chatRoomId || ''}`, {
        state: { reviewSubmitted: true }
      });
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/messages/${chatRoomId || ''}`);
  };

  if (isLoading) {
    return (
      <div className="review-container">
        <div className="review-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft />
          </button>
          <h2>Leave a Review</h2>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-container">
        <div className="review-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft />
          </button>
          <h2>Leave a Review</h2>
        </div>
        <div className="review-error">
          {error}
          <button onClick={() => navigate(-1)} className="retry-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!counterparty) {
    return (
      <div className="review-container">
        <div className="review-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft />
          </button>
          <h2>Leave a Review</h2>
        </div>
        <div className="review-error">
          Unable to load user information. Please try again.
          <button onClick={() => navigate(-1)} className="retry-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-container">
      <div className="review-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft />
        </button>
        <h2>Leave a Review</h2>
      </div>

      <div className="review-user-info">
        <img
          src={counterparty.profile_picture || '/default-profile.png'}
          alt={counterparty.username}
          className="review-user-avatar"
        />
        <div className="review-user-details">
          <h3>{counterparty.username}</h3>
          <p>Trade #{effectiveTradeId}</p>
          {orderDetails && (
            <p className="review-order-details">
              {orderDetails.amount} {orderDetails.currency} • {orderDetails.payment_method}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-section">
          <label>How would you rate this transaction?</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`star ${star <= rating ? 'active' : ''}`}
                onClick={() => setRating(star)}
                size={32}
              />
            ))}
          </div>
          <div className="rating-labels">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        <div className="review-text-section">
          <label htmlFor="review-text">Share your experience (optional)</label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Describe your experience with this user..."
            maxLength={500}
          />
          <div className="character-count">{reviewText.length}/500</div>
        </div>

        <div className="privacy-section">
          <label className="privacy-toggle">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={() => setIsPublic(!isPublic)}
            />
            <span className="toggle-slider"></span>
            <span className="privacy-label">
              {isPublic ? 'Public review' : 'Private feedback'}
            </span>
          </label>
          <p className="privacy-note">
            {isPublic
              ? 'This review will be visible on the user\'s profile'
              : 'This feedback will only be visible to our moderation team'}
          </p>
        </div>

        {error && <div className="review-error">{error}</div>}

        <div className="review-buttons">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            <FaTimes /> Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || !rating}
          >
            {isSubmitting ? 'Submitting...' : (
              <>
                <FaCheck /> Submit Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GiveReview;