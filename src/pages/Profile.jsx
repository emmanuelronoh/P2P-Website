import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
import { tradersData } from "./Market";
import "../styles/profile.css";

const Profile = () => {
  const { id } = useParams();
  const [trader, setTrader] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const foundTrader = tradersData.find((t) => t.id === parseInt(id, 10));
    setTrader(foundTrader);
  }, [id]);

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
          <div className="avatar">{trader.name.charAt(0)}</div>
          {trader.rating >= 4.9 && (
            <div className="trusted-badge">
              <FaUserShield /> Trusted Trader
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <h1>
            {trader.name} 
            <FaRegCheckCircle className="verified-icon" />
          </h1>
          
          <div className="rating-container">
            <div className="stars">{renderRatingStars(trader.rating)}</div>
            <span className="rating-value">{trader.rating.toFixed(2)}</span>
            <span className="trades-count">
              <IoMdFlash /> {trader.trades.toLocaleString()} trades
            </span>
          </div>
          
          <div className="location-info">
            <MdLocationOn /> {trader.location}
          </div>
          
          <div className="last-active">
            <IoMdTime /> Last online: {trader.lastOnline}
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
          Feedback ({trader.feedback?.length || 0})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "details" && (
          <div className="trader-details-card">
            <div className="detail-item">
              <FaClock className="detail-icon" />
              <div>
                <h3>Member since</h3>
                <p>{trader.memberSince}</p>
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
                <p>{trader.blockedBy} traders</p>
              </div>
            </div>
            
            <div className="detail-item">
              <FaHandshake className="detail-icon" />
              <div>
                <h3>Trusted by</h3>
                <p>{trader.trustedBy} traders</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "offers" && (
          <div className="trader-offers">
            {['Buy', 'Sell'].map((tradeType) => (
              <div className="offer-card" key={tradeType}>
                <div className="offer-header">
                  <h2>
                    {tradeType} {trader.crypto.split(" - ")[0]} in {trader.location}
                  </h2>
                  <span className="offer-type">{tradeType}</span>
                </div>
                
                <div className="offer-details">
                  <div className="price-info">
                    <p className="price">{trader.price}</p>
                    <p className="price-change">
                      {trader.priceIncrease.includes("above") ? (
                        <span className="above">▲ {trader.priceIncrease}</span>
                      ) : (
                        <span className="below">▼ {trader.priceIncrease}</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="limits-info">
                    <p><strong>Min:</strong> {trader.minLimit}</p>
                    <p><strong>Max:</strong> {trader.maxLimit}</p>
                  </div>
                  
                  <div className="payment-method">
                    <MdPayment /> {trader.paymentMethod}
                  </div>
                </div>
                
                <button className={`trade-button ${tradeType.toLowerCase()}`}>
                  {tradeType} Now <MdOutlineArrowForwardIos />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="feedback-section">
            {trader.feedback?.length > 0 ? (
              trader.feedback.map((review, index) => (
                <div key={index} className="feedback-card">
                  <div className="feedback-header">
                    <div className="reviewer">{review.user}</div>
                    <div className="review-rating">
                      {renderRatingStars(review.rating)}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <div className="review-date">2 weeks ago</div>
                </div>
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

export default Profile;