import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdFlash } from "react-icons/io";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import "../styles/profile.css";
import { tradersData } from "./Market"; // Ensure correct path

const Profile = () => {
  const { id } = useParams();
  const [trader, setTrader] = useState(null);

  useEffect(() => {
    const foundTrader = tradersData.find((t) => t.id === parseInt(id, 10));
    setTrader(foundTrader);
  }, [id]);

  if (!trader) {
    return <div className="not-found">Trader not found</div>;
  }

  return (
    <div className="profile-container">
      <h1>{trader.name} <span className="verified-badge">✓</span></h1>
      <p><strong>Rating:</strong> {trader.rating} ⭐</p>
      <p><strong>Trades:</strong> {trader.trades}</p>
      <p><strong>Crypto:</strong> {trader.crypto}</p>
      <p><strong>Price:</strong> {trader.price}</p>

      {/* Trader Details Section */}
      <div className="trader-details-card">
        <h2>Trader Details</h2>
        <p><strong>Member since:</strong> May 26, 2020</p>
        <p><strong>Last online:</strong> An hour ago</p>
        <p><strong>Timezone:</strong> Australia/Sydney</p>
        <p><strong>Spoken languages:</strong> English, Français, Português, Español, Castellano</p>
        <p><strong>Blocked by:</strong> 5 traders</p>
        <p><strong>Trusted by:</strong> 118 traders</p>
      </div>

      {/* Buy and Sell Crypto Sections */}
      {['Buy', 'Sell'].map((tradeType) => (
        <div className="trader-list" key={tradeType}>
          <h2>
            {tradeType} {trader.crypto.split(" - ")[0]} in {trader.location}
          </h2>
          <div className="trader-card">
            <div className="trader-info">
              <h3>
                <Link to={`/profile/${trader.id}`} className="trader-link">
                  {trader.name}
                </Link>{" "}
                <FaRegCheckCircle className="verified-icon" />
              </h3>
              <p className="rating">
                <IoMdFlash /> {trader.rating} ⭐ {trader.trades} trades
              </p>
              <p className="trade-details">
                {trader.paymentMethod} · {trader.location}
              </p>
            </div>
            <div className="price-section">
              <p className="price">{trader.price} KES</p>
              <p className="price-increase">{trader.priceIncrease}</p>
              <p className="limits">
                Limits: {trader.minLimit} - {trader.maxLimit}
              </p>
            </div>
            <button className={`${tradeType.toLowerCase()}-button`}>
              {tradeType} <MdOutlineArrowForwardIos />
            </button>
          </div>
        </div>
        
      ))}
      {/* Feedback Section */}
<div className="feedback-section">
  <h2>Trader Feedback</h2>
  {trader?.feedback?.length > 0 ? (
    trader.feedback.map((review, index) => (
      <div key={index} className="feedback-card">
        <p><strong>{review.user}</strong>: {review.comment}</p>
        <p className="rating">Rating: {review.rating} ⭐</p>
      </div>
    ))
  ) : (
    <p>No feedback available.</p>
  )}
</div>

    </div>
    
  );
};

export default Profile;
