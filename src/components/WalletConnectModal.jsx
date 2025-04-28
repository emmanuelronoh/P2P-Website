
import React, { useState, useEffect } from 'react';
import { FaWallet, FaChevronRight, FaTimes, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { MetaMaskIcon, TrustWalletIcon, BinanceChainIcon, WalletConnectIcon, CoinbaseIcon } from './WalletIcons';
import WalletLink from 'walletlink';
import { QRCodeCanvas } from 'qrcode.react';
import { BrowserProvider } from 'ethers';
import WalletConnect from '@walletconnect/client';
import WalletConnectProvider from '@walletconnect/web3-provider';
import axios from 'axios';
import '../styles/ConnectWalletModal.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cheetahx.onrender.com/';
const WALLET_CONNECT_ENDPOINT = `${API_BASE_URL}wallet-connect/connect/`;
const WALLET_TRACK_ENDPOINT = `${API_BASE_URL}wallet-connect/track/`;

const ConnectWalletModal = ({ onClose, onConnect }) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [connectionState, setConnectionState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uri, setUri] = useState('');
  const [connector, setConnector] = useState(null);
  const [provider, setProvider] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const wallets = [
    { id: 'metamask', name: 'MetaMask', icon: <MetaMaskIcon />, recommended: true, mobile: true, desktop: true, injected: true },
    { id: 'trustwallet', name: 'Trust Wallet', icon: <TrustWalletIcon />, recommended: true, mobile: true, desktop: false, injected: true },
    { id: 'binance', name: 'Binance Chain', icon: <BinanceChainIcon />, recommended: true, mobile: true, desktop: true, injected: true },
    { id: 'walletconnect', name: 'WalletConnect', icon: <WalletConnectIcon />, recommended: true, mobile: true, desktop: true, injected: false },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: <CoinbaseIcon />, recommended: true, mobile: true, desktop: true, injected: true },
  ];

  // Track wallet connection in backend
  const trackWalletConnection = async (walletData) => {
    try {
      const response = await axios.post(WALLET_TRACK_ENDPOINT, walletData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking wallet connection:', error);
    }
  };

  const verifyWalletConnection = async (address, signature, message) => {
    try {
      const response = await axios.post(WALLET_CONNECT_ENDPOINT, {
        wallet_address: address,
        signature,
        message
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying wallet connection:', error.response?.data || error);
      throw new Error(error.response?.data?.error || 'Failed to verify wallet connection with server');
    }
  };

  const requestSignature = async (provider, address) => {
    try {
      const signer = await provider.getSigner();
      const message = `Please sign this message to verify your wallet connection. Nonce: ${Date.now()}`;
      const signature = await signer.signMessage(message);
      return { 
        address,
        message, 
        signature 
      };
    } catch (error) {
      console.error('Error requesting signature:', error);
      throw new Error('User denied message signature');
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (connector) {
        connector.killSession();
      }
      if (provider?.disconnect) {
        provider.disconnect();
      }
    };
  }, [connector, provider]);

  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  };

  const isBinanceInstalled = () => {
    return typeof window.BinanceChain !== 'undefined';
  };

  const isCoinbaseInstalled = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet;
  };

  const isTrustWalletInstalled = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isTrust;
  };

  const detectInjectedWallet = () => {
    if (isMetaMaskInstalled()) return 'metamask';
    if (isTrustWalletInstalled()) return 'trustwallet';
    if (isBinanceInstalled()) return 'binance';
    if (isCoinbaseInstalled()) return 'coinbase';
    return null;
  };

  const handleWalletSelect = (walletId) => {
    setSelectedWallet(walletId);
    setConnectionState('connecting');
    setErrorMessage('');
    handleWalletConnect(walletId);
  };

  const handleWalletConnect = async (walletId) => {
    try {
      let connectionData;
      
      switch (walletId) {
        case 'metamask':
          connectionData = await connectMetaMask();
          break;
        case 'trustwallet':
          connectionData = await connectTrustWallet();
          break;
        case 'binance':
          connectionData = await connectBinanceChain();
          break;
        case 'coinbase':
          connectionData = await connectCoinbaseWallet();
          break;
        case 'walletconnect':
          connectionData = await connectWithWalletConnect();
          break;
        default:
          connectionData = await connectInjectedWallet();
      }

      // Request signature and verify
      const { address, message, signature } = await requestSignature(
        connectionData.provider,
        connectionData.address
      );

      const verification = await verifyWalletConnection(address, signature, message);
      
      await trackWalletConnection({
        walletType: walletId,
        address: address,
        chainId: connectionData.chainId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        verificationData: verification
      });
      
      if (verification.user) {
        setUserInfo(verification.user);
      }
      
      setConnectionState('connected');
      onConnect({
        walletType: walletId,
        address,
        provider: connectionData.provider,
        chainId: connectionData.chainId,
        verification,
        userInfo: verification.user
      });
    } catch (error) {
      console.error('Wallet connection error:', error);
      setConnectionState('error');
      setErrorMessage(error.message || error.reason || 'Failed to connect wallet. Please try again or use a different wallet.');
    }
  };

  const getEthereumProvider = async (walletId) => {
    if (walletId === 'binance' && window.BinanceChain) {
      return window.BinanceChain;
    }
    
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(accounts);
        return window.ethereum;
      } catch (error) {
        throw new Error('User denied account access');
      }
    }
    
    throw new Error('No Ethereum provider found');
  };

  const connectMetaMask = async () => {
    // First check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Handle mobile case - MetaMask mobile deep linking
    if (isMobile) {
      try {
        // Try to connect directly via MetaMask mobile deep link
        window.location.href = `https://metamask.app.link/dapp/${window.location.hostname}`;
        
        // Fallback if deep link fails
        setTimeout(() => {
          window.open('https://metamask.io/download.html', '_blank');
        }, 500);
        
        // Wait for connection
        const ethereum = await getEthereumProvider('metamask');
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        
        setProvider(provider);
        
        return {
          wallet: 'metamask',
          address,
          provider,
          chainId: Number(network.chainId)
        };
      } catch (error) {
        throw new Error('Failed to connect to MetaMask. Please make sure it is installed.');
      }
    }
    
    // Desktop case
    if (!isMetaMaskInstalled()) {
      // Show a modal or instructions instead of immediately redirecting
      const shouldInstall = window.confirm(
        'MetaMask extension not detected. Would you like to install it?'
      );
      
      if (shouldInstall) {
        window.open('https://metamask.io/download.html', '_blank');
      }
      throw new Error('MetaMask extension required');
    }
    
    // If we get here, MetaMask is installed on desktop
    try {
      const ethereum = await getEthereumProvider('metamask');
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      
      return {
        wallet: 'metamask',
        address,
        provider,
        chainId: Number(network.chainId)
      };
    } catch (error) {
      console.error('MetaMask connection error:', error);
      
      // Handle specific error cases
      if (error.code === 4001) {
        throw new Error('Please connect your MetaMask account to continue.');
      } else if (error.code === -32002) {
        throw new Error('MetaMask is already processing a request. Please check your extension.');
      } else {
        throw new Error('Failed to connect to MetaMask. Please try again.');
      }
    }
  };

  const connectTrustWallet = async () => {
    // First check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Handle mobile case - Trust Wallet should be deep linked
    if (isMobile) {
      try {
        // Try to connect directly via deep link
        window.location.href = `trust://`;
        
        // Fallback if deep link fails
        setTimeout(() => {
          window.open('https://trustwallet.com/', '_blank');
        }, 500);
        
        // Wait for connection
        const ethereum = await getEthereumProvider('trustwallet');
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        
        setProvider(provider);
        
        return {
          wallet: 'trustwallet',
          address,
          provider,
          chainId: Number(network.chainId)
        };
      } catch (error) {
        throw new Error('Failed to connect to Trust Wallet. Please make sure it is installed.');
      }
    }
    
    // Desktop case
    if (!isTrustWalletInstalled()) {
      // Show a modal or instructions instead of immediately redirecting
      const shouldInstall = window.confirm(
        'Trust Wallet extension not detected. Would you like to install it?'
      );
      
      if (shouldInstall) {
        window.open('https://trustwallet.com/browser-extension', '_blank');
      }
      throw new Error('Trust Wallet extension required');
    }
    
    // If we get here, Trust Wallet is installed on desktop
    try {
      const ethereum = await getEthereumProvider('trustwallet');
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      
      return {
        wallet: 'trustwallet',
        address,
        provider,
        chainId: Number(network.chainId)
      };
    } catch (error) {
      console.error('Trust Wallet connection error:', error);
      throw new Error('Failed to connect to Trust Wallet. Please try again.');
    }
  };

  const connectBinanceChain = async () => {
    // First check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
    // Handle mobile case - Binance Chain Wallet mobile app
    if (isMobile) {
      try {
        // Try to connect via WalletConnect (Binance Chain Wallet mobile supports this)
        const walletConnectProvider = new WalletConnectProvider({
          rpc: {
            56: "https://bsc-dataseed.binance.org/",
            97: "https://data-seed-prebsc-1-s1.binance.org:8545/"
          },
          chainId: 56, // Default to BSC mainnet
          bridge: "https://bridge.walletconnect.org"
        });
  
        await walletConnectProvider.enable();
        const provider = new BrowserProvider(walletConnectProvider);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
  
        setProvider(provider);
        setAccounts([address]);
  
        return {
          wallet: 'binance',
          address,
          provider,
          chainId: Number(network.chainId),
          walletConnectProvider
        };
      } catch (error) {
        console.error('Binance Chain Wallet mobile connection error:', error);
        throw new Error('Failed to connect via WalletConnect. Please try again.');
      }
    }
  
    // Desktop case
    if (!isBinanceInstalled()) {
      // Show a modal or instructions instead of immediately redirecting
      const shouldInstall = window.confirm(
        'Binance Chain Wallet extension not detected. Would you like to install it?'
      );
  
      if (shouldInstall) {
        window.open('https://www.binance.org/en/download', '_blank');
      }
      throw new Error('Binance Chain Wallet extension required');
    }
  
    // If we get here, Binance Chain Wallet is installed on desktop
    try {
      const binanceChain = window.BinanceChain;
      
      // Request account access
      await binanceChain.request({ method: 'eth_requestAccounts' });
      
      // Get accounts
      const accounts = await binanceChain.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }
  
      // Get chain ID
      const chainId = await binanceChain.request({ method: 'eth_chainId' });
      const provider = new BrowserProvider(binanceChain);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
  
      setProvider(provider);
      setAccounts(accounts);
  
      // Handle chain changed event
      binanceChain.on('chainChanged', (newChainId) => {
        console.log('Chain changed:', newChainId);
        // You might want to refresh the page or update state
        window.location.reload();
      });
  
      // Handle accounts changed event
      binanceChain.on('accountsChanged', (newAccounts) => {
        console.log('Accounts changed:', newAccounts);
        setAccounts(newAccounts);
        if (newAccounts.length === 0) {
          console.log('Please connect your Binance Chain Wallet again.');
        }
      });
  
      return {
        wallet: 'binance',
        address: accounts[0],
        provider,
        chainId: parseInt(chainId)
      };
    } catch (error) {
      console.error('Binance Chain Wallet connection error:', error);
      
      // Handle specific error cases
      if (error.code === 4001) {
        throw new Error('Please connect your Binance Chain Wallet account to continue.');
      } else if (error.code === -32002) {
        throw new Error('Binance Chain Wallet is already processing a request. Please check your extension.');
      } else if (error.message.includes('User denied account authorization')) {
        throw new Error('Connection canceled. Please approve the connection request in your wallet.');
      } else {
        throw new Error(error.message || 'Failed to connect Binance Chain Wallet. Please try again.');
      }
    }
  };

  const connectCoinbaseWallet = async () => {
    // First check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
    // Handle mobile case - Coinbase Wallet mobile app
    if (isMobile) {
      try {
        // Try to connect via WalletLink (Coinbase Wallet's preferred method)
        const walletLink = new WalletLink({
          appName: "Your App Name",
          appLogoUrl: "https://your-app-logo.png",
          darkMode: false
        });
  
        const ethereum = walletLink.makeWeb3Provider(
          "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID", 
          1
        );
  
        // Request accounts
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }
  
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
  
        setProvider(provider);
        setAccounts(accounts);
  
        // Handle account changes
        ethereum.on('accountsChanged', (newAccounts) => {
          setAccounts(newAccounts);
          if (newAccounts.length === 0) {
            console.log('Please connect your Coinbase Wallet again.');
          }
        });
  
        return {
          wallet: 'coinbase',
          address,
          provider,
          chainId: Number(network.chainId),
          walletLink
        };
      } catch (error) {
        console.error('Coinbase Wallet mobile connection error:', error);
        throw new Error('Failed to connect via Coinbase Wallet. Please try again.');
      }
    }
  
    // Desktop case
    if (!isCoinbaseInstalled()) {
      // Show a modal or instructions instead of immediately redirecting
      const shouldInstall = window.confirm(
        'Coinbase Wallet extension not detected. Would you like to install it?'
      );
  
      if (shouldInstall) {
        window.open('https://www.coinbase.com/wallet/downloads', '_blank');
      }
      throw new Error('Coinbase Wallet extension required');
    }
  
    // If we get here, Coinbase Wallet is installed on desktop
    try {
      const ethereum = await getEthereumProvider('coinbase');
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
  
      setProvider(provider);
      setAccounts([address]);
  
      // Handle chain changed event
      ethereum.on('chainChanged', (newChainId) => {
        console.log('Chain changed:', newChainId);
        window.location.reload();
      });
  
      // Handle accounts changed event
      ethereum.on('accountsChanged', (newAccounts) => {
        setAccounts(newAccounts);
        if (newAccounts.length === 0) {
          console.log('Please connect your Coinbase Wallet again.');
        }
      });
  
      return {
        wallet: 'coinbase',
        address,
        provider,
        chainId: Number(network.chainId)
      };
    } catch (error) {
      console.error('Coinbase Wallet connection error:', error);
      
      // Handle specific error cases
      if (error.code === 4001) {
        throw new Error('Please connect your Coinbase Wallet account to continue.');
      } else if (error.code === -32002) {
        throw new Error('Coinbase Wallet is already processing a request. Please check your extension.');
      } else if (error.message.includes('User denied account authorization')) {
        throw new Error('Connection canceled. Please approve the connection request in your wallet.');
      } else if (error.message.includes('Already processing eth_requestAccounts')) {
        throw new Error('Please complete the pending connection request in your wallet first.');
      } else {
        throw new Error(error.message || 'Failed to connect Coinbase Wallet. Please try again.');
      }
    }
  };

  const connectWithWalletConnect = async () => {
    try {
      const walletConnectProvider = new WalletConnectProvider({
        rpc: {
          1: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
          56: "https://bsc-dataseed.binance.org/",
        },
        qrcode: true,
      });
      
      await walletConnectProvider.enable();
      const provider = new BrowserProvider(walletConnectProvider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      
      return {
        wallet: 'walletconnect',
        address,
        provider,
        chainId: Number(network.chainId),
        walletConnectProvider
      };
    } catch (error) {
      console.error('WalletConnect error:', error);
      throw new Error('Failed to connect via WalletConnect');
    }
  };

  const connectInjectedWallet = async () => {
    const walletType = detectInjectedWallet();
    if (!walletType) {
      throw new Error('No injected wallet detected. Please install a wallet like MetaMask.');
    }
    return await handleWalletConnect(walletType);
  };

  const resetConnection = () => {
    if (connector) {
      connector.killSession();
    }
    if (provider?.disconnect) {
      provider.disconnect();
    }
    setSelectedWallet(null);
    setConnectionState('idle');
    setUri('');
    setErrorMessage('');
    setProvider(null);
    setUserInfo(null);
    setAccounts([]);
  };

  const getWalletById = (id) => wallets.find(w => w.id === id);

  return (
    <div className="wallet-modal-overlay">
      <div className="wallet-modal">
        {connectionState === 'idle' ? (
          <>
            <div className="wallet-modal-header">
              <h3>Connect Wallet</h3>
              <button onClick={onClose} className="wallet-modal-close">
                <FaTimes />
              </button>
            </div>
            
            <div className="wallet-modal-body">
              <div className="wallet-section">
                <h4 className="wallet-section-title">Choose your wallet</h4>
                <div className="wallet-grid">
                  {wallets.map(wallet => (
                    <button 
                      key={wallet.id}
                      className="wallet-option"
                      onClick={() => handleWalletSelect(wallet.id)}
                    >
                      <div className="wallet-icon">{wallet.icon}</div>
                      <span>{wallet.name}</span>
                      <FaChevronRight className="wallet-arrow" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="wallet-modal-footer">
              <p>New to crypto wallets? <a href="https://ethereum.org/en/wallets/" target="_blank" rel="noopener noreferrer">Learn More</a></p>
            </div>
          </>
        ) : (
          <div className="wallet-connection-view">
            <button onClick={resetConnection} className="wallet-modal-back">
              &larr; Back to wallets
            </button>
            
            <div className="connection-content">
              <div className="connection-icon">
                {getWalletById(selectedWallet)?.icon || <FaWallet />}
                {connectionState === 'connecting' && <div className="connection-pulse"></div>}
              </div>
              
              <h3>{getWalletById(selectedWallet)?.name}</h3>
              
              {connectionState === 'connecting' && (
                <>
                  <p>Waiting for connection...</p>
                  <div className="connection-status">
                    <FaSpinner className="spinner" />
                    <span>Initializing connection</span>
                  </div>
                  
                  {selectedWallet === 'walletconnect' && (
                    <div className="walletconnect-qr">
                      <p>Scan with your wallet app</p>
                      {uri && <QRCodeCanvas value={uri} size={180} />}
                      <p className="walletconnect-hint">
                        Or open your wallet app and look for connection requests
                      </p>
                    </div>
                  )}
                  
                  {selectedWallet !== 'walletconnect' && (
                    <div className="wallet-connection-hint">
                      <p>Check your wallet extension or mobile app to approve the connection</p>
                    </div>
                  )}
                </>
              )}
              
              {connectionState === 'connected' && (
                <div className="connection-success">
                  <FaCheck className="success-icon" />
                  <p>Wallet connected successfully!</p>
                  {accounts.length > 0 && (
                    <p className="connection-address">
                      {accounts[0]}
                    </p>
                  )}
                  {userInfo && (
                    <div className="user-info">
                      <p>Welcome back, {userInfo.username || 'user'}!</p>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      onClose();
                      resetConnection();
                    }} 
                    className="continue-button"
                  >
                    Continue
                  </button>
                </div>
              )}
              
              {connectionState === 'error' && (
                <div className="connection-error">
                  <FaExclamationTriangle className="error-icon" />
                  <p>{errorMessage}</p>
                  <button onClick={() => handleWalletConnect(selectedWallet)} className="retry-button">
                    Try Again
                  </button>
                  <button onClick={resetConnection} className="secondary-button">
                    Choose Different Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectWalletModal;
