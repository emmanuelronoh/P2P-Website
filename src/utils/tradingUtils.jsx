// src/utils/tradingUtils.js

/**
 * Formats currency with proper symbols and decimal places
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (e.g., 'KES')
 * @param {boolean} [compact=false] - Whether to use compact notation
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency, compact = false) => {
    if (isNaN(amount)) return '-';
    
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      notation: compact ? 'compact' : 'standard'
    });
    
    return formatter.format(amount);
  };
  
  /**
   * Validates trade amount input
   * @param {string} value - Input value
   * @param {number} min - Minimum allowed amount
   * @param {number} max - Maximum allowed amount
   * @returns {boolean} Whether the input is valid
   */
  export const validateInput = (value, min, max) => {
    if (value === '') return true;
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (num < 0) return false;
    if (min && num < min) return false;
    if (max && num > max) return false;
    return true;
  };
  
  /**
   * Calculates crypto amount based on fiat input
   * @param {number|string} fiatAmount - Amount in fiat
   * @param {number} price - Price of crypto in fiat
   * @returns {number} Amount in crypto
   */
  export const calculateCryptoAmount = (fiatAmount, price) => {
    if (!fiatAmount || isNaN(fiatAmount) || !price || isNaN(price)) return 0;
    const amount = typeof fiatAmount === 'string' ? parseFloat(fiatAmount) : fiatAmount;
    return amount / price;
  };
  
  /**
   * Helper function to format crypto amounts
   * @param {number} amount - Crypto amount
   * @param {number} [decimals=8] - Decimal places to show
   * @returns {string} Formatted amount
   */
  export const formatCrypto = (amount, decimals = 8) => {
    if (isNaN(amount)) return '-';
    return amount.toFixed(decimals).replace(/\.?0+$/, '');
  };