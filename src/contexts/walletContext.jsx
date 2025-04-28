
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Create context with proper typing
const WalletContext = createContext({
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  balance: "0.00",
  connectedWallets: [],
  connectWallet: () => {},
  disconnectWallet: () => {},
  fetchBalance: () => {}
});

export const WalletProvider = ({ children }) => {
  // Initialize state with localStorage values
  const [state, setState] = useState(() => {
    try {
      return {
        address: localStorage.getItem('walletAddress') || null,
        provider: null,
        signer: null,
        chainId: null,
        balance: "0.00",
        connectedWallets: JSON.parse(localStorage.getItem('connectedWallets') || '[]')
      };
    } catch (error) {
      console.error('Error parsing localStorage:', error);
      return {
        address: null,
        provider: null,
        signer: null,
        chainId: null,
        balance: "0.00",
        connectedWallets: []
      };
    }
  });

  // Memoized provider instance
  const getProvider = (provider) => {
    return new ethers.providers.Web3Provider(provider);
  };

  const fetchBalance = async (address, provider) => {
    if (!address || !provider) return "0.00";
    
    try {
      const ethersProvider = getProvider(provider);
      const balance = await ethersProvider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return "0.00";
    }
  };

  const connectWallet = async (walletType, address, provider) => {
    if (!address || !provider) return false;

    try {
      const ethersProvider = getProvider(provider);
      const signer = ethersProvider.getSigner();
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
        provider,
        signer,
        chainId: network.chainId,
        balance,
        connectedWallets: [...state.connectedWallets, newWallet]
      };

      setState(updatedState);
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('connectedWallets', JSON.stringify(updatedState.connectedWallets));
      
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  };

  const disconnectWallet = () => {
    setState({
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      balance: "0.00",
      connectedWallets: []
    });
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('connectedWallets');
  };

  // Initialize wallet connection on mount
  useEffect(() => {
    const initializeWallet = async () => {
      if (state.address && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0 && accounts[0] === state.address) {
            const balance = await fetchBalance(state.address, window.ethereum);
            setState(prev => ({
              ...prev,
              balance,
              provider: window.ethereum
            }));
          }
        } catch (error) {
          console.error('Wallet initialization error:', error);
        }
      }
    };

    initializeWallet();

    // Cleanup on unmount
    return () => {
      // Add any necessary cleanup
    };
  }, []);

  // Handle account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== state.address) {
        connectWallet('metamask', accounts[0], window.ethereum);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [state.address]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connectWallet,
        disconnectWallet,
        fetchBalance: (address) => fetchBalance(address, state.provider)
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
