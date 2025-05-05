import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaShieldAlt, FaUserCheck, FaRegClock, FaExchangeAlt, FaPercentage, FaRegThumbsUp, FaRegThumbsDown } from 'react-icons/fa';
import { MdPayment, MdAccountBalance, MdAttachMoney, MdVerifiedUser } from 'react-icons/md';
import jwt_decode from "jwt-decode";
import axios from 'axios';
import '../styles/userProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    reviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('30'); // Default to last 30 days
  const [typeFilter, setTypeFilter] = useState('all'); // Default to all types

  useEffect(() => {
    const fetchProfile = async () => {

      try {
        const token = localStorage.getItem('accessToken');
        const decoded = jwt_decode(token);
        const userId = decoded.user_id;

        console.log("userId:", userId);
        console.log("token:", token);
        const response = await axios.get(`http://127.0.0.1:8000/user/api/users/${userId}/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">Error: {error}</div>;
  if (!profile) return <div className="profile-not-found">Profile not found</div>;

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; Back to Orders
        </button>

        <div className="user-basic-info">
          <div className="avatar-container">
            <img
              src={profile.avatar || 'https://i.ibb.co/PsXqD7Xd/groom-6925756.png'}
              alt={profile.username}
              className="profile-avatar"
            />
            {profile.online && <span className="online-badge">Online</span>}
          </div>

          <div className="user-main-details">
            <h1>{profile.username}</h1>
            <div className="verification-badges">
              {profile.verification_level >= 1 && (
                <span className="badge email-verified">
                  <FaUserCheck /> Email Verified
                </span>
              )}
              {profile.verification_level >= 2 && (
                <span className="badge id-verified">
                  <MdVerifiedUser /> ID Verified
                </span>
              )}
              {profile.verification_level >= 3 && (
                <span className="badge address-verified">
                  <FaShieldAlt /> Address Verified
                </span>
              )}
            </div>

            <div className="member-since">
              Member since {new Date(profile.join_date).toLocaleDateString()}
            </div>
          </div>

          <div className="user-stats-summary">
            <div className="stat-item">
              <FaStar className="stat-icon" />
              <div className="stat-value">{profile.rating?.toFixed(1) || '0.0'}</div>
              <div className="stat-label">Rating</div>
            </div>
            <div className="stat-item">
              <FaExchangeAlt className="stat-icon" />
              <div className="stat-value">{profile.total_trades}</div>
              <div className="stat-label">Trades</div>
            </div>
            <div className="stat-item">
              <FaPercentage className="stat-icon" />
              <div className="stat-value">{profile.completion_rate}%</div>
              <div className="stat-label">Completion</div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({profile.reviews?.length || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'trade-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('trade-history')}
        >
          Trade History
        </button>
        <button
          className={`tab-button ${activeTab === 'payment-methods' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment-methods')}
        >
          Payment Methods
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="profile-section">
              <h3>Trader Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-title">Average Release Time</div>
                  <div className="stat-value">
                    <FaRegClock /> {profile.avg_release_time}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Positive Feedback</div>
                  <div className="stat-value positive">
                    <FaRegThumbsUp /> {profile.positive_feedback}%
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Dispute Rate</div>
                  <div className="stat-value negative">
                    <FaRegThumbsDown /> {profile.dispute_rate}%
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Response Time</div>
                  <div className="stat-value">
                    <FaRegClock /> {profile.avg_response_time}
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {Array.isArray(profile.recent_activity) ? (
                  profile.recent_activity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'trade' && <FaExchangeAlt />}
                        {activity.type === 'login' && <FaUserCheck />}
                        {activity.type === 'verification' && <FaShieldAlt />}
                      </div>
                      <div className="activity-details">
                        <div className="activity-text">{activity.text}</div>
                        <div className="activity-time">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activity-item">
                    <div className="activity-icon">
                      <FaUserCheck />
                    </div>
                    <div className="activity-details">
                      <div className="activity-text">{profile.recent_activity || 'No recent activity'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        )}

        {activeTab === 'reviews' && (
          <div className="reviews-tab">
            {profile?.rating && (
              <div className="reviews-summary">
                <div className="rating-overview">
                  <div className="average-rating">
                    {(profile.rating || 0).toFixed(1)} <FaStar className="star-icon" />
                  </div>
                  {profile.rating_distribution && profile.total_reviews ? (
                    <div className="rating-distribution">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="rating-bar">
                          <span className="stars">{stars} <FaStar /></span>
                          <div className="bar-container">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${((profile.rating_distribution[stars] || 0) / (profile.total_reviews || 1)) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="count">{profile.rating_distribution[stars] || 0}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-ratings">No rating distribution available</div>
                  )}
                </div>
              </div>
            )}

            <div className="reviews-list">
              {profile?.reviews?.length > 0 ? (
                profile.reviews.map((review) => (
                  <div key={review.id || Math.random()} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <img
                          src={review.reviewer?.avatar || 'https://i.ibb.co/PsXqD7Xd/groom-6925756.png'}
                          alt={review.reviewer?.username || 'Anonymous'}
                          className="reviewer-avatar"
                        />
                        <span className="reviewer-name">
                          {review.reviewer?.username || 'Anonymous'}
                        </span>
                      </div>
                      <div className="review-rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar
                            key={i}
                            className={`star ${i < (review.rating || 0) ? 'filled' : ''}`}
                          />
                        ))}
                      </div>
                      <div className="review-time">
                        {review.timestamp ? new Date(review.timestamp).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                    <div className="review-content">
                      <p>{review.comment || 'No comment provided'}</p>
                    </div>
                    {review.response && (
                      <div className="review-response">
                        <div className="response-header">
                          <strong>Response from {profile.username || 'User'}:</strong>
                        </div>
                        <p>{review.response}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-reviews">No reviews yet</div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'trade-history' && (
          <div className="trade-history-tab">
            <div className="history-filters">
              <select
                className="time-filter"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <select
                className="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Trades</option>
                <option value="buy">Buy Trades</option>
                <option value="sell">Sell Trades</option>
              </select>
            </div>

            <div className="trades-list">

              {activeTab === 'trade-history' && (
                <div className="trade-history-tab">
                  <div className="history-filters">
                    <select
                      className="time-filter"
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                    >
                      <option value="30">Last 30 Days</option>
                      <option value="90">Last 90 Days</option>
                      <option value="365">Last Year</option>
                      <option value="all">All Time</option>
                    </select>
                    <select
                      className="type-filter"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <option value="all">All Trades</option>
                      <option value="buy">Buy Trades</option>
                      <option value="sell">Sell Trades</option>
                    </select>
                  </div>

                  <div className="trades-list">
                    {profile?.trade_history?.length > 0 ? (
                      <table className="trades-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Price</th>
                            <th>Counterparty</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profile.trade_history
                            .filter(trade => {
                              if (!trade) return false;
                              if (typeFilter === 'all') return true;
                              return trade.type?.toLowerCase() === typeFilter;
                            })
                            .filter(trade => {
                              if (!trade?.date) return false;
                              if (timeFilter === 'all') return true;

                              const days = parseInt(timeFilter);
                              const tradeDate = new Date(trade.date);
                              const cutoffDate = new Date();
                              cutoffDate.setDate(cutoffDate.getDate() - days);
                              return tradeDate >= cutoffDate;
                            })
                            .map((trade) => (
                              <tr key={trade?.id || Math.random()}>
                                <td>{trade?.date ? new Date(trade.date).toLocaleDateString() : 'N/A'}</td>
                                <td className={`trade-type ${trade?.type || ''}`}>
                                  {trade?.type || 'Unknown'}
                                </td>
                                <td>
                                  {trade?.amount || '0'} {trade?.currency || ''}
                                </td>
                                <td>
                                  {trade?.price || '0'} {trade?.currency || ''}/{trade?.crypto || ''}
                                </td>
                                <td className="counterparty">
                                  <img
                                    src={trade.counterparty?.avatar || 'https://i.ibb.co/PsXqD7Xd/groom-6925756.png'}
                                    alt={trade.counterparty?.username || 'Unknown'}
                                    className="counterparty-avatar"
                                    onError={(e) => {
                                      e.target.src = 'https://i.ibb.co/PsXqD7Xd/groom-6925756.png';
                                    }}
                                  />
                                  {trade.counterparty?.username || 'Unknown'}
                                </td>
                                <td className={`trade-status ${trade?.status || ''}`}>
                                  {trade?.status || 'Unknown'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="no-trades-message">
                        No trade history available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payment-methods' && (
          <div className="payment-methods-tab">
            <div className="payment-methods-list">
              {profile?.payment_methods?.length > 0 ? (
                profile.payment_methods.map((method) => (
                  <div key={method?.id || Math.random()} className="payment-method-card">
                    <div className="method-header">
                      <div className="method-name">
                        <MdPayment className="method-icon" />
                        {method?.name || 'Unknown Payment Method'}
                      </div>
                      <div className="method-status">
                        {method?.verified ? (
                          <span className="verified-badge">
                            <FaCheckCircle /> Verified
                          </span>
                        ) : (
                          <span className="unverified-badge">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="method-details">
                      {method?.details && typeof method.details === 'object' ? (
                        <div className="details">
                          {Object.entries(method.details).map(([key, value]) => (
                            <div key={key} className="detail-item">
                              <span className="detail-label">{key}:</span>
                              <span className="detail-value">{value || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-details">No payment details available</div>
                      )}
                    </div>

                    <div className="method-limits">
                      <div className="limit-item">
                        <span>Min:</span>
                        <strong>{method?.min_limit || '0'} {method?.currency || ''}</strong>
                      </div>
                      <div className="limit-item">
                        <span>Max:</span>
                        <strong>{method?.max_limit || '0'} {method?.currency || ''}</strong>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-payment-methods">
                  <MdPayment className="no-methods-icon" />
                  <p>No payment methods available</p>
                  <button
                    className="add-payment-method-btn"
                    onClick={() => navigate('/settings/payment-methods')}
                  >
                    Add Payment Method
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default UserProfile;
