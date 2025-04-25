import React from 'react';
import PropTypes from 'prop-types';
import '../styles/LoadingOverlay.css';

const LoadingOverlay = ({ isLoading, message }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

LoadingOverlay.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  message: PropTypes.string
};

export default LoadingOverlay;