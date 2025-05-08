import { useState, useEffect, useCallback } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import axios from 'axios';

export const useAuth = () => {
  const { address, isConnected } = useAppKitAccount();
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verify wallet signature with backend
  const verifySignature = useCallback(async (walletAddress: string, signature: string, message: string) => {
    try {
      setLoading(true);
      const response = await axios.post('https://cheetahx.onrender.com/api/connect/', {
        wallet_address: walletAddress,
        signature: signature,
        message: message,
        wallet_type: 'appkit', // or detect wallet type
        chain_id: '1' // or detect chain
      });

      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to verify signature with backend');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle wallet connection
  const handleWalletConnect = useCallback(async () => {
    if (!address || !isConnected) return;

    try {
      // In a real app, you would:
      // 1. Generate a message to sign
      // 2. Request signature from wallet
      // 3. Verify with backend
      const message = `Please sign this message to connect to our service. Nonce: ${Math.random().toString(36).substring(2, 15)}`;
      
      // This is a placeholder - you'll need to implement actual signing
      const signature = 'user-signature-from-wallet';
      
      const verified = await verifySignature(address, signature, message);
      if (!verified) {
        setError('Signature verification failed');
      }
    } catch (err) {
      setError('Connection failed');
      console.error(err);
    }
  }, [address, isConnected, verifySignature]);

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const response = await axios.get('https://cheetahx.onrender.com/wallet-connect/user-info/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Session check failed', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    };
    checkSession();
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    handleWalletConnect,
    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };
};