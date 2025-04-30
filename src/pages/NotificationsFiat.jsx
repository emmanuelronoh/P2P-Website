
import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiX, FiAlertTriangle, FiDollarSign, FiShield, FiMessageSquare, FiUser, FiClock, FiMail, FiShoppingCart, FiCreditCard, FiLock, FiCheckCircle } from 'react-icons/fi';
import { io } from 'socket.io-client';
import axios from 'axios';
import "../styles/Notifications.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    const newSocket = io('ws://cheetahx.onrender.com', {
      path: 'crypto/ws/notifications/',
      transports: ['websocket'],  // ensure only websocket is used (not polling)
      query: {
        token: localStorage.getItem('accessToken'),
      },
    });
    
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Listen for new notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off('new_notification');
    };
  }, [socket]);

  // Fetch initial notifications from Django
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('https://cheetahx.onrender.com/crypto/api/notifications/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        setNotifications(response.data.results);
        setUnreadCount(response.data.unread_count);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`https://cheetahx.onrender.com/crypto/api/notifications/${id}/mark_as_read/`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const updatedNotifications = notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('https://cheetahx.onrender.com/crypto/mark_all_as_read/', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`https://cheetahx.onrender.com/crypto/api/notifications/${id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const updatedNotifications = notifications.filter(notification => notification.id !== id);
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
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
      case 'registration':
        return <FiUser className="icon registration-icon" />;
      case 'verification':
        return <FiCheckCircle className="icon verification-icon" />;
      case 'order':
        return <FiShoppingCart className="icon order-icon" />;
      case 'payment':
        return <FiCreditCard className="icon payment-icon" />;
      case 'security':
        return <FiLock className="icon security-icon" />;
      case 'email':
        return <FiMail className="icon email-icon" />;
      default:
        return <FiBell className="icon default-icon" />;
    }
  };

  // Format time to relative time (e.g., "2 minutes ago")
  const formatTime = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    
    return 'Just now';
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
