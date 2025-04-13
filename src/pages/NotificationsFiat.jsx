import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiX, FiAlertTriangle, FiDollarSign, FiShield, FiMessageSquare, FiUser, FiClock } from 'react-icons/fi';
import "../styles/Notifications.css"

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      // Simulate API call
      setTimeout(() => {
        const mockNotifications = [
          {
            id: 1,
            type: 'trade',
            title: 'New Trade Request',
            message: 'User CryptoKing has requested to trade 0.5 BTC with you',
            time: '2 mins ago',
            read: false,
            tradeId: 'TX-789456',
            urgent: true
          },
          {
            id: 2,
            type: 'escrow',
            title: 'Escrow Funded',
            message: 'Funds for trade TX-123456 have been secured in escrow',
            time: '1 hour ago',
            read: false,
            tradeId: 'TX-123456'
          },
          {
            id: 3,
            type: 'message',
            title: 'New Message',
            message: 'You have a new message from User BitTrader regarding trade TX-654321',
            time: '3 hours ago',
            read: true,
            tradeId: 'TX-654321'
          },
          {
            id: 4,
            type: 'system',
            title: 'Security Alert',
            message: 'We detected a login from a new device in London, UK',
            time: '1 day ago',
            read: true
          },
          {
            id: 5,
            type: 'trade',
            title: 'Trade Completed',
            message: 'Trade TX-987654 has been successfully completed',
            time: '2 days ago',
            read: true,
            tradeId: 'TX-987654'
          },
          {
            id: 6,
            type: 'escrow',
            title: 'Escrow Release Required',
            message: 'Please release escrow funds for trade TX-321654 as goods have been delivered',
            time: '3 days ago',
            read: false,
            tradeId: 'TX-321654',
            urgent: true
          }
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
        setIsLoading(false);
      }, 800);
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };

  const filteredNotifications = activeFilter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === activeFilter);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'trade':
        return <FiDollarSign className="icon trade-icon" />;
      case 'escrow':
        return <FiShield className="icon escrow-icon" />;
      case 'message':
        return <FiMessageSquare className="icon message-icon" />;
      case 'system':
        return <FiAlertTriangle className="icon system-icon" />;
      default:
        return <FiBell className="icon default-icon" />;
    }
  };

  return (
    <div className="notifications-container">
      <div className="notifications-content">
        <div className="notifications-header">
          <h1 className="notifications-title">
            <FiBell className="title-icon" />
            Notifications
            {unreadCount > 0 && (
              <span className="unread-count">
                {unreadCount} new
              </span>
            )}
          </h1>
          <button 
            onClick={markAllAsRead}
            className="mark-all-read-btn"
          >
            Mark all as read
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setActiveFilter('trade')}
            className={`filter-tab ${activeFilter === 'trade' ? 'active' : ''}`}
          >
            Trades
          </button>
          <button
            onClick={() => setActiveFilter('escrow')}
            className={`filter-tab ${activeFilter === 'escrow' ? 'active' : ''}`}
          >
            Escrow
          </button>
          <button
            onClick={() => setActiveFilter('message')}
            className={`filter-tab ${activeFilter === 'message' ? 'active' : ''}`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveFilter('system')}
            className={`filter-tab ${activeFilter === 'system' ? 'active' : ''}`}
          >
            System
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <FiBell className="empty-icon" />
              <h3>No notifications</h3>
              <p>
                {activeFilter === 'all' 
                  ? "You don't have any notifications yet." 
                  : `You don't have any ${activeFilter} notifications.`}
              </p>
            </div>
          ) : (
            <ul className="notifications-items">
              {filteredNotifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`notification-item ${notification.urgent ? 'urgent' : ''} ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-content">
                    <div className={`notification-icon-container ${notification.read ? '' : 'unread-icon'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-details">
                      <div className="notification-header">
                        <p className={`notification-title ${!notification.read ? 'unread-title' : ''}`}>
                          {notification.title}
                        </p>
                        <span className="notification-time">
                          <FiClock className="time-icon" />
                          {notification.time}
                        </span>
                      </div>
                      <p className="notification-message">
                        {notification.message}
                      </p>
                      {notification.tradeId && (
                        <div className="trade-id-container">
                          <span className="trade-id">
                            {notification.tradeId}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="notification-actions">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="action-btn"
                          title="Mark as read"
                        >
                          <FiCheck className="action-icon" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="action-btn"
                        title="Delete"
                      >
                        <FiX className="action-icon" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mobile Floating Action Button */}
        <div className="mobile-fab">
          <button
            onClick={markAllAsRead}
            className="fab-button"
            title="Mark all as read"
          >
            <FiCheck className="fab-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;