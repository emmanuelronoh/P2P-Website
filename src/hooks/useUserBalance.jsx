// src/hooks/useUserBalance.js
import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching user balance
 * @param {string} cryptoSymbol - Crypto symbol to get balance for
 * @returns {object} { availableBalance, totalBalance, loading, error }
 */
export const useUserBalance = (cryptoSymbol) => {
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        // In a real app, you would call your API here
        // This is a mock implementation for demonstration
        const mockBalance = cryptoSymbol === 'BTC' ? 0.42 : 15.7;
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setAvailableBalance(mockBalance * 0.95); // 95% available
        setTotalBalance(mockBalance);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching balance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [cryptoSymbol]);

  return { availableBalance, totalBalance, loading, error };
};