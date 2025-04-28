import React from 'react';
import PropTypes from 'prop-types';
import '../styles/TradingLimitsInfo.css';

const TradingLimitsInfo = ({ minLimit, maxLimit, currency }) => {
  const formatValue = (value) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="trading-limits-container">
      <div className="limits-header">
        <h4>Trading Limits</h4>
        <span className="limits-range">
          {formatValue(minLimit)} - {formatValue(maxLimit)}
        </span>
      </div>
      
      <div className="limits-progress-bar">
        <div 
          className="progress-indicator"
          style={{
            left: `${(minLimit / maxLimit) * 100}%`,
            width: `${100 - (minLimit / maxLimit) * 100}%`
          }}
        />
      </div>
      
      <div className="limits-labels">
        <span className="min-label">Min: {formatValue(minLimit)}</span>
        <span className="max-label">Max: {formatValue(maxLimit)}</span>
      </div>
    </div>
  );
};

TradingLimitsInfo.propTypes = {
  minLimit: PropTypes.number.isRequired,
  maxLimit: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired
};

export default TradingLimitsInfo;
