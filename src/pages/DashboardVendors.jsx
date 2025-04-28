
import React, { useState, useEffect } from "react";
import { FiTrendingUp, FiCheckCircle, FiList, FiDollarSign, FiBarChart2, FiCalendar } from "react-icons/fi";
import "../styles/styles.css";
const DashboardVendors = () => {
  const [stats, setStats] = useState({
    listings: 0,
    completed: 0,
    active: 0,
    revenue: 0,
    rating: 4.8,
    disputes: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        listings: 12,
        completed: 47,
        active: 5,
        revenue: 28450,
        rating: 4.8,
        disputes: 2
      });
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [timeframe]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderStatCard = (icon, title, value, change, isCurrency = false) => (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h4>{title}</h4>
        <div className="stat-value">
          {isCurrency ? formatCurrency(value) : value}
          {change && (
            <span className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header">
        <h1><FiBarChart2 /> Vendor Dashboard</h1>
        <div className="timeframe-selector">
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-indicator">Loading dashboard data...</div>
      ) : (
        <>
          <div className="stats-grid">
            {renderStatCard(<FiList size={24} />, "Active Listings", stats.active, 12)}
            {renderStatCard(<FiCheckCircle size={24} />, "Completed Sales", stats.completed, 8)}
            {renderStatCard(<FiDollarSign size={24} />, "Total Revenue", stats.revenue, 15, true)}
            {renderStatCard(<FiTrendingUp size={24} />, "Vendor Rating", stats.rating, -2)}
          </div>

          <div className="dashboard-content">
            <div className="dashboard-section">
              <h2><FiCalendar /> Recent Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-details">
                    <span className="activity-type sale">New Sale</span>
                    <span className="activity-description">BTC purchase completed</span>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                  <div className="activity-amount">+$1,250.00</div>
                </div>
                <div className="activity-item">
                  <div className="activity-details">
                    <span className="activity-type listing">New Listing</span>
                    <span className="activity-description">ETH trading pair added</span>
                    <span className="activity-time">5 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-details">
                    <span className="activity-type dispute">Dispute Opened</span>
                    <span className="activity-description">Payment not received</span>
                    <span className="activity-time">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Performance Metrics</h2>
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-label">Completion Rate</div>
                  <div className="metric-value">98.7%</div>
                  <div className="metric-comparison positive">+2.1% from last period</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">Avg. Response Time</div>
                  <div className="metric-value">12 min</div>
                  <div className="metric-comparison negative">+3 min from last period</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">Dispute Rate</div>
                  <div className="metric-value">1.2%</div>
                  <div className="metric-comparison positive">-0.4% from last period</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardVendors;
