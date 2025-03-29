import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdFlash } from "react-icons/io";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import "../styles/profileDetails.css";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("userId"); // Get logged-in user ID from localStorage

  useEffect(() => {
    if (!userId) {
      console.error("No user logged in");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/users/${userId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (!user) {
    return <div className="not-found">User profile not found</div>;
  }

  return (
    <div className="profile-container">
      <h1>{user.name} <span className="verified-badge">✓</span></h1>
      <p><strong>Rating:</strong> {user.rating} ⭐</p>
      <p><strong>Trades:</strong> {user.trades}</p>
      <p><strong>Crypto:</strong> {user.crypto}</p>
      <p><strong>Price:</strong> {user.price}</p>

      {/* Trader Details Section */}
      <div className="trader-details-card">
        <h2>Trader Details</h2>
        <p><strong>Member since:</strong> {user.memberSince}</p>
        <p><strong>Last online:</strong> {user.lastOnline}</p>
        <p><strong>Timezone:</strong> {user.timezone}</p>
        <p><strong>Spoken languages:</strong> {user.languages?.join(", ")}</p>
        <p><strong>Blocked by:</strong> {user.blockedBy} traders</p>
        <p><strong>Trusted by:</strong> {user.trustedBy} traders</p>
      </div>

      {/* Buy and Sell Crypto Sections */}
      {['Buy', 'Sell'].map((tradeType) => (
        <div className="trader-list" key={tradeType}>
          <h2>
            {tradeType} {user.crypto?.split(" - ")[0]} in {user.location}
          </h2>
          <div className="trader-card">
            <div className="trader-info">
              <h3>
                <Link to={`/profile/${user.id}`} className="trader-link">
                  {user.name}
                </Link>{" "}
                <FaRegCheckCircle className="verified-icon" />
              </h3>
              <p className="rating">
                <IoMdFlash /> {user.rating} ⭐ {user.trades} trades
              </p>
              <p className="trade-details">
                {user.paymentMethod} · {user.location}
              </p>
            </div>
            <div className="price-section">
              <p className="price">{user.price} KES</p>
              <p className="price-increase">{user.priceIncrease}</p>
              <p className="limits">
                Limits: {user.minLimit} - {user.maxLimit}
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
        {user?.feedback?.length > 0 ? (
          user.feedback.map((review, index) => (
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
