
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/dashboard.css';
import profileImage from '../assets/cheetah-logo.png';
import {
  FiBell, FiMessageSquare, FiDollarSign, FiCreditCard, FiBarChart2,
  FiShield, FiSettings, FiArrowUp, FiArrowDown, FiTrendingUp,
  FiClock, FiCheckCircle, FiUsers, FiLayers, FiPieChart,
  FiRefreshCw, FiExternalLink, FiAlertCircle, FiLoader
} from 'react-icons/fi';

// API configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api/dashboard/';
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  }
});

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [available, setAvailable] = useState(true);
  const [showNotification, setShowNotification] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for all data
  const [dashboardData, setDashboardData] = useState({
    userStats: null,
    tradeStats: null,
    recentTransactions: [],
    notifications: [],
    reputation: null
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // You might want to use Promise.all for parallel requests
        const [userRes, tradesRes, transactionsRes, notificationsRes, reputationRes] = await Promise.all([
          axiosInstance.get('/users/stats/'),
          axiosInstance.get('/trades/stats/'),
          axiosInstance.get('/transactions/recent/'),
          axiosInstance.get('http://127.0.0.1:8000/crypto/notifications/'),
          axiosInstance.get('/reputation/')
        ]);

        setDashboardData({
          userStats: userRes.data,
          tradeStats: tradesRes.data,
          recentTransactions: transactionsRes.data,
          notifications: notificationsRes.data,
          reputation: reputationRes.data
        });

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Toggle availability status
  const toggleAvailability = async () => {
    try {
      const newStatus = !available;
      await axiosInstance.patch('/users/availability/', { available: newStatus });
      setAvailable(newStatus);
    } catch (err) {
      console.error('Failed to update availability:', err);
      // You might want to show a toast notification here
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axiosInstance.patch(`http://127.0.0.1:8000/crypto/notifications/${notificationId}/mark-read/`);
      setDashboardData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      }));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Here you could add logic to fetch tab-specific data if needed
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <FiLoader className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FiAlertCircle className="error-icon" />
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Destructure data for easier access
  const { userStats, tradeStats, recentTransactions, notifications, reputation } = dashboardData;

  return (
    <div className="cheetahx-dashboard">
      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="user-profile">
            <div className="profile-image">
              {userStats?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <h3>{userStats?.username || 'User'}</h3>
              <p className="profile-level">
                Level {reputation?.level || 1} {reputation?.title || 'Trader'}
              </p>
            </div>
          </div>


          <div className="sidebar-menu">
            <button
              className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <FiBarChart2 className="menu-icon" />
              <span>Overview</span>
            </button>
            <button
              className={`menu-item ${activeTab === 'trades' ? 'active' : ''}`}
              onClick={() => handleTabChange('trades')}
            >
              <FiRefreshCw className="menu-icon" />
              <span>My Trades</span>
            </button>
            <button
              className={`menu-item ${activeTab === 'wallet' ? 'active' : ''}`}
              onClick={() => handleTabChange('wallet')}
            >
              <FiCreditCard className="menu-icon" />
              <span>Wallet Balance</span>
            </button>
            <button
              className={`menu-item ${activeTab === 'reputation' ? 'active' : ''}`}
              onClick={() => handleTabChange('reputation')}
            >
              <FiShield className="menu-icon" />
              <span>Reputation</span>
            </button>
            <button
              className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              <FiSettings className="menu-icon" />
              <span>Settings</span>
            </button>
          </div>

          <div className="sidebar-footer">
            <div className="online-status">
              <span className={`status-indicator ${available ? 'online' : 'offline'}`}></span>
              <span>{available ? 'Online' : 'Offline'}</span>
            </div>
            <button className="support-button">
              <FiMessageSquare className="support-icon" />
              <span>Support</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="dashboard-main">
          {showNotification && notifications.some(n => !n.read) && (
            <div className="notification-banner">
              <div className="notification-content">
                <FiBell className="notification-icon" />
                <p>You have {notifications.filter(n => !n.read).length} unread notifications</p>
              </div>
              <button
                className="notification-close"
                onClick={() => setShowNotification(false)}
              >
                &times;
              </button>
            </div>
          )}

          <div className="welcome-section">
            <div className="welcome-header">
              <h1>Welcome back, {userStats?.first_name || 'Trader'}!</h1>
              <p>Here's what's happening with your P2P trading today</p>
            </div>
            <div className="availability-toggle">
              <span className={`availability-status ${available ? 'online' : 'offline'}`}>
                {available ? 'Online' : 'Offline'}
              </span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={toggleAvailability}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <FiDollarSign className="stat-icon" />
                <h3>Total Trades</h3>
              </div>
              <div className="stat-value">{userStats?.total_trades || 0}</div>
              <div className="stat-trend">
                {userStats?.trades_trend === 'up' ? (
                  <>
                    <FiTrendingUp className="trend-icon up" />
                    <span className="trend-text up">{userStats.trades_change}% from last week</span>
                  </>
                ) : (
                  <>
                    <FiTrendingUp className="trend-icon down" />
                    <span className="trend-text down">{userStats?.trades_change || 0}% from last week</span>
                  </>
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <FiCheckCircle className="stat-icon" />
                <h3>Completion Rate</h3>
              </div>
              <div className="stat-value">{userStats?.completion_rate || 0}%</div>
              <div className="stat-trend">
                {userStats?.completion_trend === 'up' ? (
                  <>
                    <FiTrendingUp className="trend-icon up" />
                    <span className="trend-text up">{userStats.completion_change}% from last month</span>
                  </>
                ) : (
                  <>
                    <FiTrendingUp className="trend-icon down" />
                    <span className="trend-text down">{userStats?.completion_change || 0}% from last month</span>
                  </>
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <FiUsers className="stat-icon" />
                <h3>Active Trades</h3>
              </div>
              <div className="stat-value">{userStats?.active_trades || 0}</div>
              <div className="stat-trend">
                <FiClock className="trend-icon neutral" />
                <span className="trend-text neutral">
                  {userStats?.active_trades || 0} in progress
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <FiShield className="stat-icon" />
                <h3>Dispute Rate</h3>
              </div>
              <div className="stat-value">{userStats?.dispute_rate || 0}%</div>
              <div className="stat-trend">
                {userStats?.dispute_trend === 'down' ? (
                  <>
                    <FiTrendingUp className="trend-icon up" />
                    <span className="trend-text up">Industry avg. {userStats?.industry_avg_dispute || 5}%</span>
                  </>
                ) : (
                  <>
                    <FiTrendingUp className="trend-icon down" />
                    <span className="trend-text down">Industry avg. {userStats?.industry_avg_dispute || 5}%</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Trade Activity Section */}
          <div className="activity-section">
            <div className="section-header">
              <h2>Trade Activity</h2>
              <button className="section-action">
                View All <FiExternalLink className="action-icon" />
              </button>
            </div>

            <div className="activity-content">
              <div className="trade-chart">
                <div className="chart-header">
                  <h3>Trade Volume (Last 30 Days)</h3>
                  <div className="chart-legend">
                    <div className="legend-item buy">
                      <span className="legend-color"></span>
                      <span>Buy ({tradeStats?.buy_count || 0})</span>
                    </div>
                    <div className="legend-item sell">
                      <span className="legend-color"></span>
                      <span>Sell ({tradeStats?.sell_count || 0})</span>
                    </div>
                  </div>
                </div>
                <div className="chart-placeholder">
                  {tradeStats?.weekly_volume?.map((volume, index) => (
                    <div
                      key={index}
                      className="chart-bar"
                      style={{ height: `${(volume / tradeStats.max_weekly_volume) * 80}%` }}
                    ></div>
                  ))}
                </div>
                <div className="chart-xaxis">
                  {tradeStats?.weekly_labels?.map((label, index) => (
                    <span key={index}>{label}</span>
                  ))}
                </div>
              </div>

              <div className="recent-transactions">
                <h3>Recent Transactions</h3>
                <div className="transactions-list">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map(tx => (
                      <div key={tx.id} className="transaction-item">
                        <div className="tx-icon">
                          {tx.type === 'buy' ? (
                            <FiArrowDown className="tx-icon-buy" />
                          ) : (
                            <FiArrowUp className="tx-icon-sell" />
                          )}
                        </div>
                        <div className="tx-details">
                          <div className="tx-amount">
                            {tx.amount} {tx.currency}
                            <span className="tx-fiat">~{userStats?.currency || 'USD'}{tx.fiat_value}</span>
                          </div>
                          <div className="tx-meta">
                            <span className="tx-counterparty">with {tx.counterparty}</span>
                            <span className="tx-time">{tx.time_ago}</span>
                          </div>
                        </div>
                        <div className={`tx-status ${tx.status.replace(' ', '-')}`}>
                          {tx.status}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-transactions">
                      <p>No recent transactions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reputation and Level Section */}
          <div className="reputation-section">
            <div className="section-header">
              <h2>Reputation & Level</h2>
              <button className="section-action">
                How It Works <FiExternalLink className="action-icon" />
              </button>
            </div>

            <div className="reputation-content">
              <div className="level-progress">
                <div className="progress-track">
                  {reputation?.levels?.map((level, index) => (
                    <div
                      key={level.id}
                      className={`progress-step ${level.achieved ? 'active' : ''} ${level.next ? 'next' : ''}`}
                    >
                      <div className="step-marker">{index + 1}</div>
                      <div className="step-info">
                        <h4>{level.title}</h4>
                        <p>{level.requirements}</p>
                        {level.progress && (
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${level.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rating-card">
                <div className="rating-score">
                  <div className="score-value">{reputation?.rating || 0}</div>
                  <div className="score-stars">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`star ${i < Math.floor(reputation?.rating || 0) ? 'filled' : ''} 
                          ${i === Math.floor(reputation?.rating || 0) && (reputation?.rating || 0) % 1 >= 0.5 ? 'half' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="score-count">from {reputation?.total_reviews || 0} reviews</div>
                </div>
                <div className="rating-details">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const ratingCount = reputation?.rating_distribution?.[stars] || 0;
                    const ratingPercentage = reputation?.total_reviews
                      ? (ratingCount / reputation.total_reviews) * 100
                      : 0;

                    return (
                      <div className="rating-bar" key={stars}>
                        <span className="bar-label">{stars} stars</span>
                        <div className="bar-container">
                          <div className="bar-fill" style={{ width: `${ratingPercentage}%` }}></div>
                        </div>
                        <span className="bar-count">{ratingCount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-card">
                <FiCreditCard className="action-icon" />
                <span>Create New Offer</span>
              </button>
              <button className="action-card">
                <FiDollarSign className="action-icon" />
                <span>View Market Prices</span>
              </button>
              <button className="action-card">
                <FiUsers className="action-icon" />
                <span>Invite Friends</span>
              </button>
              <button className="action-card">
                <FiLayers className="action-icon" />
                <span>Trade History</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
