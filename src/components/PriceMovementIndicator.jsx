import React from 'react';
import PropTypes from 'prop-types';
import '../styles/PriceMovementIndicator.css';

const PriceMovementIndicator = ({ currentPrice, change24h, currency }) => {
  const isPositive = change24h >= 0;
  const arrow = isPositive ? '↑' : '↓';
  
  return (
    <div className={`price-movement ${isPositive ? 'positive' : 'negative'}`}>
      <span className="current-price">
        {new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(currentPrice)}
      </span>
      <span className="change-percentage">
        {arrow} {Math.abs(change24h).toFixed(2)}%
      </span>
    </div>
  );
};

PriceMovementIndicator.propTypes = {
  currentPrice: PropTypes.number.isRequired,
  change24h: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired
};

export default PriceMovementIndicator;
