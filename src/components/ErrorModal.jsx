import React from 'react';
import PropTypes from 'prop-types';
import '../styles/ErrorModal.css';

const ErrorModal = ({ show, title, message, onClose, actions }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="error-modal-overlay">
      <div className="error-modal-container">
        <div className="error-modal-header">
          <h3 className="error-modal-title">{title}</h3>
          <button className="error-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="error-modal-body">
          <div className="error-modal-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <p className="error-modal-message">{message}</p>
        </div>
        
        <div className="error-modal-footer">
          {actions ? (
            actions.map((action, index) => (
              <button
                key={index}
                className={`error-modal-button ${index === 0 ? 'primary' : 'secondary'}`}
                onClick={action.handler}
              >
                {action.text}
              </button>
            ))
          ) : (
            <button className="error-modal-button primary" onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ErrorModal.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      handler: PropTypes.func.isRequired
    })
  )
};

ErrorModal.defaultProps = {
  actions: null
};

export default ErrorModal;