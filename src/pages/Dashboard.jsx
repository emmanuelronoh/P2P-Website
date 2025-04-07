import React, { useState } from 'react';
import '../styles/dashboard.css';
import profileImage from '../assets/cheetah-logo.png';
import { FiBell, FiMessageSquare, FiDollarSign, FiCreditCard, FiBarChart2, FiShield, FiSettings, 
  FiArrowUp, FiArrowDown, FiTrendingUp, FiClock, FiCheckCircle, FiUsers, 
  FiLayers, FiPieChart, FiRefreshCw, FiExternalLink } from 'react-icons/fi';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [available, setAvailable] = useState(true);
  const [showNotification, setShowNotification] = useState(true);

  // Mock data - replace with real data from your backend
  const userStats = {
    totalTrades: 24,
    completionRate: 92.5,
    responseRate: 100,
    rating: 4.8,
    disputes: 0,
    activeTrades: 2,
    currency: 'USD'
  };

  const tradeStats = {
    buy: 15,
    sell: 9,
    totalVolume: 45200,
    thisMonth: 3200
  };

  const recentTransactions = [
    { id: 1, type: 'buy', amount: 0.25, currency: 'BTC', fiatValue: 15000, counterparty: 'crypto_whale', status: 'completed', time: '2 hours ago' },
    { id: 2, type: 'sell', amount: 1.2, currency: 'ETH', fiatValue: 3600, counterparty: 'new_trader_2023', status: 'in progress', time: '5 hours ago' },
    { id: 3, type: 'buy', amount: 500, currency: 'USDT', fiatValue: 500, counterparty: 'stable_arbitrageur', status: 'completed', time: '1 day ago' },
  ];

  const notifications = [
    { id: 1, type: 'trade', message: 'New trade request from crypto_whale', time: '10 min ago', read: false },
    { id: 2, type: 'system', message: 'System update scheduled for tomorrow', time: '2 hours ago', read: true },
    { id: 3, type: 'promotion', message: 'Special bonus for completing 3 trades this week', time: '1 day ago', read: true },
  ];

  const toggleAvailability = () => {
    setAvailable(!available);
  };

  return (
    <div className="cheetahx-dashboard">
      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-menu">
            <button 
              className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FiBarChart2 className="menu-icon" />
              <span>Overview</span>
            </button>
            <button 
              className={`menu-item ${activeTab === 'trades' ? 'active' : ''}`}
              onClick={() => setActiveTab('trades')}
            >
              <FiRefreshCw className="menu-icon" />
              <span>My Trades</span>
            </button>
            <button 
              className={`menu-item ${activeTab === 'wallet' ? 'active' : ''}`}
              onClick={() => setActiveTab('wallet')}
            >
              <FiCreditCard className="menu-icon" />
              <span>Wallet Balance</span>
            </button>
            <button 
              className={`menu-item ${activeTab === 'reputation' ? 'active' : ''}`}
              onClick={() => setActiveTab('reputation')}
            >
              <FiShield className="menu-icon" />
              <span>Reputation</span>
            </button>
            <button 
              className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings className="menu-icon" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="dashboard-main">
          {showNotification && (
            <div className="notification-banner">
              <div className="notification-content">
                <FiBell className="notification-icon" />
                <p>Complete your profile verification to increase your trade limits and gain trust.</p>
              </div>
              <button className="notification-close" onClick={() => setShowNotification(false)}>
                &times;
              </button>
            </div>
          )}

          <div className="welcome-section">
            <div className="welcome-header">
              <h1>Welcome back, Emmanuel!</h1>
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
              <div className="stat-value">{userStats.totalTrades}</div>
              <div className="stat-trend">
                <FiTrendingUp className="trend-icon up" />
                <span className="trend-text up">12% from last week</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <FiCheckCircle className="stat-icon" />
                <h3>Completion Rate</h3>
              </div>
              <div className="stat-value">{userStats.completionRate}%</div>
              <div className="stat-trend">
                <FiTrendingUp className="trend-icon up" />
                <span className="trend-text up">2.5% from last month</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <FiUsers className="stat-icon" />
                <h3>Active Trades</h3>
              </div>
              <div className="stat-value">{userStats.activeTrades}</div>
              <div className="stat-trend">
                <FiClock className="trend-icon neutral" />
                <span className="trend-text neutral">2 in progress</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <FiShield className="stat-icon" />
                <h3>Dispute Rate</h3>
              </div>
              <div className="stat-value">{userStats.disputes}%</div>
              <div className="stat-trend">
                <FiTrendingUp className="trend-icon down" />
                <span className="trend-text down">Industry avg. 5%</span>
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
                      <span>Buy ({tradeStats.buy})</span>
                    </div>
                    <div className="legend-item sell">
                      <span className="legend-color"></span>
                      <span>Sell ({tradeStats.sell})</span>
                    </div>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-bar" style={{ height: '80%' }}></div>
                  <div className="chart-bar" style={{ height: '60%' }}></div>
                  <div className="chart-bar" style={{ height: '45%' }}></div>
                  <div className="chart-bar" style={{ height: '75%' }}></div>
                  <div className="chart-bar" style={{ height: '90%' }}></div>
                  <div className="chart-bar" style={{ height: '30%' }}></div>
                  <div className="chart-bar" style={{ height: '50%' }}></div>
                </div>
                <div className="chart-xaxis">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                </div>
              </div>

              <div className="recent-transactions">
                <h3>Recent Transactions</h3>
                <div className="transactions-list">
                  {recentTransactions.map(tx => (
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
                          <span className="tx-fiat">~{userStats.currency}{tx.fiatValue}</span>
                        </div>
                        <div className="tx-meta">
                          <span className="tx-counterparty">with {tx.counterparty}</span>
                          <span className="tx-time">{tx.time}</span>
                        </div>
                      </div>
                      <div className={`tx-status ${tx.status.replace(' ', '-')}`}>
                        {tx.status}
                      </div>
                    </div>
                  ))}
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
                  <div className="progress-step active">
                    <div className="step-marker">1</div>
                    <div className="step-info">
                      <h4>New Trader</h4>
                      <p>Complete 5 trades to level up</p>
                    </div>
                  </div>
                  <div className="progress-step">
                    <div className="step-marker">2</div>
                    <div className="step-info">
                      <h4>Verified Trader</h4>
                      <p>Complete KYC and 20+ trades</p>
                    </div>
                  </div>
                  <div className="progress-step">
                    <div className="step-marker">3</div>
                    <div className="step-info">
                      <h4>Trusted Trader</h4>
                      <p>50+ trades with 95%+ rating</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rating-card">
                <div className="rating-score">
                  <div className="score-value">{userStats.rating}</div>
                  <div className="score-stars">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`star ${i < Math.floor(userStats.rating) ? 'filled' : ''} 
                          ${i === Math.floor(userStats.rating) && userStats.rating % 1 >= 0.5 ? 'half' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="score-count">from 12 reviews</div>
                </div>
                <div className="rating-details">
                  <div className="rating-bar">
                    <span className="bar-label">5 stars</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: '70%' }}></div>
                    </div>
                    <span className="bar-count">8</span>
                  </div>
                  <div className="rating-bar">
                    <span className="bar-label">4 stars</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: '25%' }}></div>
                    </div>
                    <span className="bar-count">3</span>
                  </div>
                  <div className="rating-bar">
                    <span className="bar-label">3 stars</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: '5%' }}></div>
                    </div>
                    <span className="bar-count">1</span>
                  </div>
                  <div className="rating-bar">
                    <span className="bar-label">2 stars</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: '0%' }}></div>
                    </div>
                    <span className="bar-count">0</span>
                  </div>
                  <div className="rating-bar">
                    <span className="bar-label">1 star</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: '0%' }}></div>
                    </div>
                    <span className="bar-count">0</span>
                  </div>
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