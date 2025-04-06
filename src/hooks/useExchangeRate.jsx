// src/hooks/useExchangeRate.js
import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching exchange rates
 * @param {string} cryptoSymbol - Crypto symbol (e.g., 'BTC')
 * @param {string} fiatSymbol - Fiat symbol (e.g., 'KES')
 * @returns {object} { currentPrice, priceChange24h, loading, error }
 */
export const useExchangeRate = (cryptoSymbol, fiatSymbol) => {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setLoading(true);
        // In a real app, you would call your API here
        // This is a mock implementation for demonstration
        const mockPrice = cryptoSymbol === 'BTC' ? 5000000 : 3500;
        const mockChange = cryptoSymbol === 'BTC' ? 2.5 : -1.2;
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCurrentPrice(mockPrice);
        setPriceChange24h(mockChange);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching exchange rate:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();

    // In a real app, you might want to set up polling
    const interval = setInterval(fetchExchangeRate, 30000);
    return () => clearInterval(interval);
  }, [cryptoSymbol, fiatSymbol]);

  return { currentPrice, priceChange24h, loading, error };
};