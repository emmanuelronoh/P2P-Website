import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  FaRegCheckCircle, 
  FaStar, 
  FaUserShield,
  FaClock,
  FaGlobe,
  FaLanguage,
  FaBan,
  FaHandshake
} from "react-icons/fa";
import { IoMdFlash, IoMdTime } from "react-icons/io";
import { MdOutlineArrowForwardIos, MdPayment, MdLocationOn } from "react-icons/md";
import "../styles/profile.css";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [trader, setTrader] = useState(null);
  const [offers, setOffers] = useState({ buy: [], sell: [] });
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verify token first
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // Verify token is valid
        const tokenValid = await validateToken(token);
        if (!tokenValid) {
          localStorage.removeItem('accessToken');
          navigate('/login');
          return;
        }

        // Fetch trader profile
        const traderResponse = await fetchTraderProfile(username, token);
        setTrader(traderResponse);

        // Pre-fetch offers and feedback
        const offersResponse = await fetchTraderOffers(username, token);
        setOffers(offersResponse);

        const feedbackResponse = await fetchTraderFeedback(username, token);
        setFeedback(feedbackResponse.reviews);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, navigate]);

  const validateToken = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/validate-token', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const fetchTraderProfile = async (username, token) => {
    const response = await fetch(`http://127.0.0.1:8000/api/auth/traders/${username}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch trader profile');
    return await response.json();
  };
  
  const fetchTraderOffers = async (username, token) => {
    const response = await fetch(`http://127.0.0.1:8000/api/auth/traders/${username}/offers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch trader offers');
    return await response.json();
  };
  
  const fetchTraderFeedback = async (username, token) => {
    const response = await fetch(`http://127.0.0.1:8000/api/auth/traders/${username}/feedback`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch trader feedback');
    return await response.json();
  };
  
  const handleInitiateTrade = async (offerId, tradeType) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://127.0.0.1:8000/api/auth/trades/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trader_username: username,
          offer_id: offerId,
          type: tradeType.toLowerCase()
        })
      });

      if (!response.ok) throw new Error('Failed to initiate trade');

      const data = await response.json();
      navigate(`/trade/${data.tradeId}`);
    } catch (error) {
      setError(error.message);
    }
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= rating ? "star filled" : "star empty"} 
        />
      );
    }
    return stars;
  };

  if (loading) {
    return <div className="loading">Loading trader profile...</div>;
  }

  if (error) {
    return (
      <div className="profile-error">
        <h2>Error loading profile</h2>
        <p>{error}</p>
        <Link to="/market" className="back-button">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="profile-not-found">
        <h2>Trader not found</h2>
        <p>The trader you're looking for doesn't exist or may have been removed.</p>
        <Link to="/market" className="back-button">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar">{trader.user?.first_name?.charAt(0) || 'T'}</div>
          {trader.rating >= 4.9 && (
            <div className="trusted-badge">
              <FaUserShield /> Trusted Trader
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <h1>
            {trader.user?.first_name} {trader.user?.last_name}
            <FaRegCheckCircle className="verified-icon" />
          </h1>
          
          <div className="rating-container">
            <div className="stars">{renderRatingStars(trader.rating)}</div>
            <span className="rating-value">{trader.rating.toFixed(2)}</span>
            <span className="trades-count">
              <IoMdFlash /> {trader.trades_completed.toLocaleString()} trades
            </span>
          </div>
          
          <div className="location-info">
            <MdLocationOn /> {trader.location}
          </div>
          
          <div className="last-active">
            <IoMdTime /> Last online: {new Date(trader.last_online).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Trader Details
        </button>
        <button 
          className={`tab-button ${activeTab === "offers" ? "active" : ""}`}
          onClick={() => setActiveTab("offers")}
        >
          Trade Offers
        </button>
        <button 
          className={`tab-button ${activeTab === "feedback" ? "active" : ""}`}
          onClick={() => setActiveTab("feedback")}
        >
          Feedback ({feedback.length || 0})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "details" && (
          <div className="trader-details-card">
            <div className="detail-item">
              <FaClock className="detail-icon" />
              <div>
                <h3>Member since</h3>
                <p>{new Date(trader.member_since).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <FaGlobe className="detail-icon" />
              <div>
                <h3>Timezone</h3>
                <p>{trader.timezone}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <FaLanguage className="detail-icon" />
              <div>
                <h3>Spoken languages</h3>
                <p>{trader.languages}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <FaBan className="detail-icon" />
              <div>
                <h3>Blocked by</h3>
                <p>{trader.blocked_by_count} traders</p>
              </div>
            </div>
            
            <div className="detail-item">
              <FaHandshake className="detail-icon" />
              <div>
                <h3>Trusted by</h3>
                <p>{trader.trusted_by_count} traders</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "offers" && (
          <div className="trader-offers">
            {offers.buy.length === 0 && offers.sell.length === 0 ? (
              <div className="no-offers">
                <p>This trader currently has no active offers.</p>
              </div>
            ) : (
              <>
                {offers.buy.map((offer) => (
                  <OfferCard 
                    key={`buy-${offer.id}`}
                    offer={offer}
                    tradeType="Buy"
                    onInitiateTrade={handleInitiateTrade}
                  />
                ))}
                {offers.sell.map((offer) => (
                  <OfferCard 
                    key={`sell-${offer.id}`}
                    offer={offer}
                    tradeType="Sell"
                    onInitiateTrade={handleInitiateTrade}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="feedback-section">
            {feedback.length > 0 ? (
              feedback.map((review) => (
                <FeedbackCard 
                  key={review.id}
                  review={review}
                  renderRatingStars={renderRatingStars}
                />
              ))
            ) : (
              <div className="no-feedback">
                <p>This trader hasn't received any feedback yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Extracted Offer Card Component
const OfferCard = ({ offer, tradeType, onInitiateTrade }) => (
  <div className="offer-card">
    <div className="offer-header">
      <h2>
        {tradeType} {offer.crypto} in {offer.trader.trader_profile?.location}
      </h2>
      <span className="offer-type">{tradeType}</span>
    </div>
    
    <div className="offer-details">
      <div className="price-info">
        <p className="price">${offer.price}</p>
        <p className="price-change">
          {offer.price_change.includes("above") ? (
            <span className="above">▲ {offer.price_change}</span>
          ) : (
            <span className="below">▼ {offer.price_change}</span>
          )}
        </p>
      </div>
      
      <div className="limits-info">
        <p><strong>Min:</strong> ${offer.min_limit}</p>
        <p><strong>Max:</strong> ${offer.max_limit}</p>
      </div>
      
      <div className="payment-method">
        <MdPayment /> {offer.payment_method}
      </div>
    </div>
    
    <button 
      className={`trade-button ${tradeType.toLowerCase()}`}
      onClick={() => onInitiateTrade(offer.id, tradeType)}
    >
      {tradeType} Now <MdOutlineArrowForwardIos />
    </button>
  </div>
);

// Extracted Feedback Card Component
const FeedbackCard = ({ review, renderRatingStars }) => {
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="feedback-card">
      <div className="feedback-header">
        <div className="reviewer">{review.reviewer.first_name}</div>
        <div className="review-rating">
          {renderRatingStars(review.rating)}
        </div>
      </div>
      <p className="review-comment">{review.comment}</p>
      <div className="review-date">{getTimeAgo(review.created_at)}</div>
    </div>
  );
};

export default Profile;