// walletContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletState, setWalletState] = useState(() => {
    // Initialize from localStorage
    const savedAddress = localStorage.getItem('walletAddress');
    const savedWallets = JSON.parse(localStorage.getItem('connectedWallets') || '[]');
    const savedChainId = localStorage.getItem('chainId');
    
    return {
      address: savedAddress,
      provider: null,
      signer: null,
      chainId: savedChainId ? parseInt(savedChainId) : null,
      balance: "0.00",
      connectedWallets: savedWallets,
      isConnected: !!savedAddress,
    };
  });

  // Add event listeners for wallet changes
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== walletState.address) {
        setWalletState(prev => ({
          ...prev,
          address: accounts[0],
          isConnected: true
        }));
      }
    };

    const handleChainChanged = (chainId) => {
      const parsedChainId = parseInt(chainId, 16);
      setWalletState(prev => ({
        ...prev,
        chainId: parsedChainId
      }));
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    if (walletState.provider?.provider?.on) {
      const provider = walletState.provider.provider;
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      return () => {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
        provider.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [walletState.provider, walletState.address]);

  // Sync localStorage with state changes
  useEffect(() => {
    if (walletState.address) {
      localStorage.setItem('walletAddress', walletState.address);
      localStorage.setItem('chainId', walletState.chainId?.toString() || '');
    } else {
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('chainId');
    }
    localStorage.setItem('connectedWallets', JSON.stringify(walletState.connectedWallets));
  }, [walletState.address, walletState.chainId, walletState.connectedWallets]);

  const getProvider = useCallback((provider) => {
    try {
      if (!provider) return null;
      return new ethers.BrowserProvider(provider);
    } catch (error) {
      console.error('Error creating provider:', error);
      return null;
    }
  }, []);

  const fetchBalance = useCallback(async (address, provider) => {
    if (!address || !provider) return "0.00";
    try {
      const ethersProvider = getProvider(provider);
      const balance = await ethersProvider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      setWalletState(prev => ({ ...prev, balance: formattedBalance }));
      return formattedBalance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return "0.00";
    }
  }, [getProvider]);

  const connectWallet = useCallback(async (connectionData) => {
    const { walletType, address, provider, chainId } = connectionData;
    
    if (!address) return false;

    try {
      const ethersProvider = getProvider(provider);
      if (!ethersProvider) throw new Error('Failed to initialize provider');

      const signer = await ethersProvider.getSigner();
      const network = await ethersProvider.getNetwork();
      const balance = await fetchBalance(address, provider);

      const newWallet = {
        id: `${walletType}-${address}`,
        type: walletType,
        address,
        chainId: network.chainId,
        connectedAt: new Date().toISOString()
      };

      const updatedState = {
        address,
        provider: ethersProvider,
        signer,
        chainId: network.chainId,
        balance,
        connectedWallets: [...walletState.connectedWallets, newWallet],
        isConnected: true
      };

      setWalletState(updatedState);
      
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }, [fetchBalance, getProvider, walletState.connectedWallets]);

  const disconnectWallet = useCallback(() => {
    // Try to disconnect provider if possible
    if (walletState.provider?.provider?.disconnect) {
      walletState.provider.provider.disconnect();
    }

    setWalletState({
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      balance: "0.00",
      connectedWallets: [],
      isConnected: false
    });
  }, [walletState.provider]);

  // Auto-fetch balance when address or provider changes
  useEffect(() => {
    if (walletState.address && walletState.provider) {
      fetchBalance(walletState.address, walletState.provider.provider);
    }
  }, [walletState.address, walletState.provider, fetchBalance]);

  return (
    <WalletContext.Provider
      value={{
        ...walletState,
        connectWallet,
        disconnectWallet,
        fetchBalance,
        getProvider
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

