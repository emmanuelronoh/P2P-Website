import React, { useState, useEffect, useCallback } from 'react';
import { FaWallet, FaChevronRight, FaTimes, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { MetaMaskIcon, TrustWalletIcon, BinanceChainIcon, WalletConnectIcon, CoinbaseIcon } from './WalletIcons';
import WalletLink from "@coinbase/wallet-sdk";
import { QRCodeCanvas } from 'qrcode.react';
import { BrowserProvider } from 'ethers';
import WalletConnect from '@walletconnect/client';
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import axios from 'axios';
import '../styles/ConnectWalletModal.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cheetahx.onrender.com/';
const WALLET_CONNECT_ENDPOINT = `${API_BASE_URL}wallet-connect/connect/`;
const WALLET_TRACK_ENDPOINT = `${API_BASE_URL}wallet-connect/track/`;

const ConnectWalletModal = ({ onClose, onConnect, setWalletAddress }) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [connectionState, setConnectionState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uri, setUri] = useState('');
  const [connector, setConnector] = useState(null);
  const [provider, setProvider] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [pendingRequest, setPendingRequest] = useState(false);

  const wallets = [
    { id: 'metamask', name: 'MetaMask', icon: <MetaMaskIcon />, recommended: true, mobile: true, desktop: true, injected: true },
    { id: 'trustwallet', name: 'Trust Wallet', icon: <TrustWalletIcon />, recommended: true, mobile: true, desktop: false, injected: true },
    { id: 'binance', name: 'Binance Chain', icon: <BinanceChainIcon />, recommended: true, mobile: true, desktop: true, injected: true },
    { id: 'walletconnect', name: 'WalletConnect', icon: <WalletConnectIcon />, recommended: true, mobile: true, desktop: true, injected: false },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: <CoinbaseIcon />, recommended: true, mobile: true, desktop: true, injected: true },
  ];

  // Cleanup function
  const resetConnection = useCallback(() => {
    if (connector) {
      try {
        connector.killSession();
      } catch (error) {
        console.error('Error killing WalletConnect session:', error);
      }
    }
    if (provider?.disconnect) {
      try {
        provider.disconnect();
      } catch (error) {
        console.error('Error disconnecting provider:', error);
      }
    }
    setSelectedWallet(null);
    setConnectionState('idle');
    setUri('');
    setErrorMessage('');
    setProvider(null);
    setUserInfo(null);
    setAccounts([]);
    setPendingRequest(false);
  }, [connector, provider]);

  // Enhanced provider detection with multiple provider support
  const getProvider = useCallback((ethereum) => {
    try {
      if (!ethereum) {
        throw new Error('Ethereum provider not found');
      }
      
      // Handle multiple providers case (like Coinbase + MetaMask)
      if (ethereum.providers?.length > 0) {
        // Try to find the specific provider we want
        const targetProvider = ethereum.providers.find(p => 
          p.isMetaMask || p.isTrust || p.isCoinbaseWallet || p.isBinance
        ) || ethereum.providers[0];
        return new BrowserProvider(targetProvider);
      }
      
      return new BrowserProvider(ethereum);
    } catch (error) {
      console.error('Error creating provider:', error);
      throw new Error('Failed to initialize wallet provider');
    }
  }, []);

  const trackWalletConnection = useCallback(async (walletData) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Login Again');
      }
  
      const response = await axios.post(WALLET_TRACK_ENDPOINT, walletData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });
  
      // Handle successful response (200 or 201)
      if (response.status === 200 || response.status === 201) {
        return response.data;
      }
  
      throw new Error('Unexpected response from server');
    } catch (error) {
      // Handle 200 status with "already connected" message
      if (error.response?.status === 200 && 
          error.response?.data?.detail?.includes('already connected')) {
        return { alreadyConnected: true };
      }
      
      // Handle 400 validation error
      if (error.response?.status === 400 && 
          error.response?.data?.wallet_address?.includes('already connected')) {
        return { alreadyConnected: true };
      }
      
      console.error('Error tracking wallet connection:', error);
      throw error;
    }
  }, []);

  // Enhanced wallet verification
  const verifyWalletConnection = useCallback(async (address, signature, message) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Oops Please login');
      }

      const response = await axios.post(WALLET_CONNECT_ENDPOINT, {
        wallet_address: address,
        signature,
        message
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 15000
      });

      if (!response.data) {
        throw new Error('Invalid response from server');
      }
      return response.data;
    } catch (error) {
      console.error('Error verifying wallet connection:', error.response?.data || error);
      if (error.response?.status === 400) {
        throw new Error('Invalid connection data. Please try again.');
      }
      throw new Error(error.response?.data?.error || 'Failed to verify wallet connection with server');
    }
  }, []);

  // Improved signature request
  const requestSignature = useCallback(async (provider, address) => {
    if (pendingRequest) {
      throw new Error('Please complete the pending request in your wallet first.');
    }

    try {
      setPendingRequest(true);
      const signer = await provider.getSigner();
      const nonce = Date.now();
      const message = `Please sign this message to verify your wallet connection. Nonce: ${nonce}`;

      const signature = await signer.signMessage(message);

      return {
        address,
        message,
        signature
      };
    } catch (error) {
      console.error('Error requesting signature:', error);
      if (error.code === -32002) {
        throw new Error('A signature request is already pending. Please check your wallet.');
      } else if (error.code === 4001) {
        throw new Error('User denied message signature');
      }
      throw new Error('Failed to request signature. Please try again.');
    } finally {
      setPendingRequest(false);
    }
  }, [pendingRequest]);

  // Wallet detection utilities
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window.ethereum !== 'undefined' && (window.ethereum.isMetaMask || window.ethereum.providers?.some(p => p.isMetaMask));
  }, []);

  const isBinanceInstalled = useCallback(() => {
    return typeof window.BinanceChain !== 'undefined';
  }, []);

  const isCoinbaseInstalled = useCallback(() => {
    return typeof window.ethereum !== 'undefined' && (window.ethereum.isCoinbaseWallet || window.ethereum.providers?.some(p => p.isCoinbaseWallet));
  }, []);

  const isTrustWalletInstalled = useCallback(() => {
    return typeof window.ethereum !== 'undefined' && (window.ethereum.isTrust || window.ethereum.providers?.some(p => p.isTrust));
  }, []);

  const detectInjectedWallet = useCallback(() => {
    if (isMetaMaskInstalled()) return 'metamask';
    if (isTrustWalletInstalled()) return 'trustwallet';
    if (isBinanceInstalled()) return 'binance';
    if (isCoinbaseInstalled()) return 'coinbase';
    return null;
  }, [isMetaMaskInstalled, isTrustWalletInstalled, isBinanceInstalled, isCoinbaseInstalled]);

  // Enhanced Ethereum provider detection
  const getEthereumProvider = useCallback(async (walletId) => {
    if (walletId === 'binance' && window.BinanceChain) {
      return window.BinanceChain;
    }

    let ethereum = window.ethereum;

    // Handle cases where multiple providers are injected
    if (ethereum?.providers?.length > 0) {
      if (walletId === 'metamask') {
        ethereum = ethereum.providers.find(p => p.isMetaMask) || ethereum;
      } else if (walletId === 'coinbase') {
        ethereum = ethereum.providers.find(p => p.isCoinbaseWallet) || ethereum;
      } else if (walletId === 'trustwallet') {
        ethereum = ethereum.providers.find(p => p.isTrust) || ethereum;
      }
    }

    if (!ethereum) {
      throw new Error('No Ethereum provider found');
    }

    try {
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      setAccounts(accounts);
      return ethereum;
    } catch (error) {
      console.error('Error requesting accounts:', error);
      if (error.code === 4001) {
        throw new Error('User denied account access');
      } else if (error.code === -32002) {
        throw new Error('A request is already pending. Please check your wallet.');
      }
      throw new Error('Failed to connect to wallet');
    }
  }, []);

  // Wallet-specific connection handlers
  const connectMetaMask = useCallback(async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      try {
        // Try deep linking
        window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;

        // Wait for provider to be injected
        await new Promise((resolve, reject) => {
          const checkProvider = () => {
            if (isMetaMaskInstalled()) {
              resolve();
            } else {
              setTimeout(checkProvider, 200);
            }
          };
          setTimeout(() => reject(new Error('Timeout waiting for MetaMask')), 10000);
          checkProvider();
        });

        const ethereum = await getEthereumProvider('metamask');
        const provider = getProvider(ethereum);
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
        console.error('MetaMask mobile connection error:', error);
        throw new Error('Failed to connect to MetaMask. Please make sure it is installed and try again.');
      }
    }

    if (!isMetaMaskInstalled()) {
      const shouldInstall = window.confirm(
        'MetaMask extension not detected. Would you like to be redirected to install it?'
      );
      if (shouldInstall) {
        window.open('https://metamask.io/download.html', '_blank');
      }
      throw new Error('MetaMask extension required');
    }

    try {
      const ethereum = await getEthereumProvider('metamask');
      const provider = getProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);

      // Set up event listeners
      ethereum.on('chainChanged', () => window.location.reload());
      ethereum.on('accountsChanged', (newAccounts) => {
        setAccounts(newAccounts);
        if (newAccounts.length === 0) {
          resetConnection();
        }
      });

      return {
        wallet: 'metamask',
        address,
        provider,
        chainId: Number(network.chainId)
      };
    } catch (error) {
      console.error('MetaMask connection error:', error);
      throw new Error(error.message || 'Failed to connect to MetaMask');
    }
  }, [getEthereumProvider, getProvider, isMetaMaskInstalled, resetConnection]);

  // Similar improvements for other wallet connection functions (TrustWallet, Binance, Coinbase)
  // [Previous implementations were good, just ensure consistent error handling]

  // Enhanced WalletConnect implementation
  const connectWithWalletConnect = useCallback(async () => {
    try {
      const walletConnectProvider = new WalletConnectProvider({
        rpc: {
          1: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
          56: "https://bsc-dataseed.binance.org/",
          137: "https://polygon-rpc.com/"
        },
        chainId: 1, // Default to Ethereum mainnet
        bridge: "https://bridge.walletconnect.org",
        qrcodeModalOptions: {
          mobileLinks: ['metamask', 'trust', 'rainbow', 'argent', 'imtoken']
        }
      });

      walletConnectProvider.connector.on("display_uri", (err, payload) => {
        const uri = payload.params[0];
        setUri(uri);
      });

      await walletConnectProvider.enable();
      const provider = getProvider(walletConnectProvider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setConnector(walletConnectProvider.connector);
      setAccounts([address]);

      // Set up event listeners
      walletConnectProvider.on("accountsChanged", (accounts) => {
        setAccounts(accounts);
      });

      walletConnectProvider.on("chainChanged", () => {
        window.location.reload();
      });

      walletConnectProvider.on("disconnect", () => {
        resetConnection();
      });

      return {
        wallet: 'walletconnect',
        address,
        provider,
        chainId: Number(network.chainId),
        walletConnectProvider
      };
    } catch (error) {
      console.error('WalletConnect error:', error);
      throw new Error(error.message || 'Failed to connect via WalletConnect');
    }
  }, [getProvider, resetConnection]);

  // Add these wallet connection functions before handleWalletConnect
  const connectTrustWallet = useCallback(async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
    if (isMobile) {
      try {
        // First check if we can detect Trust Wallet
        const trustWalletDetected = isTrustWalletInstalled();
        
        // If we can't detect it, offer alternatives
        if (!trustWalletDetected) {
          const useWalletConnect = window.confirm(
            'Trust Wallet not detected. Would you like to connect via WalletConnect instead?'
          );
          if (useWalletConnect) {
            return await connectWithWalletConnect();
          }
          throw new Error('Trust Wallet not detected on your device');
        }
  
        // Try to open Trust Wallet with fallback
        try {
          // Create a hidden iframe to test the deep link
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = 'trust://';
          document.body.appendChild(iframe);
          
          // Remove the iframe after a short delay
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 100);
          
          // If we get here, the deep link probably worked
          await new Promise((resolve, reject) => {
            const checkProvider = () => {
              if (isTrustWalletInstalled()) {
                resolve();
              } else {
                setTimeout(checkProvider, 200);
              }
            };
            setTimeout(() => reject(new Error('Timeout waiting for Trust Wallet response')), 10000);
            checkProvider();
          });
  
          const ethereum = await getEthereumProvider('trustwallet');
          const provider = getProvider(ethereum);
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
        } catch (deepLinkError) {
          console.warn('Deep link failed, falling back to WalletConnect:', deepLinkError);
          return await connectWithWalletConnect();
        }
      } catch (error) {
        console.error('Trust Wallet mobile connection error:', error);
        throw new Error('Failed to connect to Trust Wallet. ' + 
          (error.message.includes('not detected') ? '' : 'Please make sure it is installed and try again.'));
      }
    }
  
    // Desktop browser handling
    if (!isTrustWalletInstalled()) {
      const shouldInstall = window.confirm(
        'Trust Wallet extension not detected. Would you like to be redirected to install it?'
      );
      if (shouldInstall) {
        window.open('https://trustwallet.com/browser-extension', '_blank');
      }
      throw new Error('Trust Wallet extension required. Please install it to continue.');
    }
  
    try {
      const ethereum = await getEthereumProvider('trustwallet');
      const provider = getProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
  
      setProvider(provider);
  
      // Set up event listeners
      ethereum.on('chainChanged', () => window.location.reload());
      ethereum.on('accountsChanged', (newAccounts) => {
        setAccounts(newAccounts);
        if (newAccounts.length === 0) {
          resetConnection();
        }
      });
  
      return {
        wallet: 'trustwallet',
        address,
        provider,
        chainId: Number(network.chainId)
      };
    } catch (error) {
      console.error('Trust Wallet connection error:', error);
      
      // Enhanced error messages
      let errorMessage = 'Failed to connect to Trust Wallet';
      if (error.code === 4001) {
        errorMessage = 'Connection rejected. Please approve the request in Trust Wallet.';
      } else if (error.code === -32002) {
        errorMessage = 'Trust Wallet is already processing a request. Please check your extension.';
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      throw new Error(errorMessage);
    }
  }, [getEthereumProvider, getProvider, isTrustWalletInstalled, resetConnection, connectWithWalletConnect]);

  
const connectBinanceChain = useCallback(async () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    try {
      const walletConnectProvider = new WalletConnectProvider({
        rpc: {
          56: "https://bsc-dataseed.binance.org/",
          97: "https://data-seed-prebsc-1-s1.binance.org:8545/"
        },
        chainId: 56,
        bridge: "https://bridge.walletconnect.org",
        qrcodeModalOptions: {
          mobileLinks: ['trust', 'metamask', 'binance']
        }
      });

      walletConnectProvider.connector.on("display_uri", (err, payload) => {
        const uri = payload.params[0];
        setUri(uri);
      });

      await walletConnectProvider.enable();
      const provider = getProvider(walletConnectProvider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setAccounts([address]);
      setConnector(walletConnectProvider.connector);

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

  if (!isBinanceInstalled()) {
    const shouldInstall = window.confirm(
      'Binance Chain Wallet extension not detected. Would you like to be redirected to install it?'
    );
    if (shouldInstall) {
      window.open('https://www.binance.org/en/download', '_blank');
    }
    throw new Error('Binance Chain Wallet extension required');
  }

  try {
    const binanceChain = window.BinanceChain;
    await binanceChain.request({ method: 'eth_requestAccounts' });
    const accounts = await binanceChain.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }

    const chainId = await binanceChain.request({ method: 'eth_chainId' });
    const provider = getProvider(binanceChain);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    setProvider(provider);
    setAccounts(accounts);

    binanceChain.on('chainChanged', (newChainId) => {
      window.location.reload();
    });

    binanceChain.on('accountsChanged', (newAccounts) => {
      setAccounts(newAccounts);
      if (newAccounts.length === 0) {
        console.log('Binance Chain Wallet account disconnected');
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
}, [getProvider, isBinanceInstalled]);

const connectCoinbaseWallet = useCallback(async () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    try {
      const walletLink = new WalletLink({
        appName: "Your App Name",
        appLogoUrl: "https://your-app-logo.png",
        darkMode: false
      });

      const ethereum = walletLink.makeWeb3Provider(
        "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
        1
      );

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = getProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setAccounts(accounts);

      ethereum.on('accountsChanged', (newAccounts) => {
        setAccounts(newAccounts);
        if (newAccounts.length === 0) {
          console.log('Coinbase Wallet account disconnected');
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

  if (!isCoinbaseInstalled()) {
    const shouldInstall = window.confirm(
      'Coinbase Wallet extension not detected. Would you like to be redirected to install it?'
    );
    if (shouldInstall) {
      window.open('https://www.coinbase.com/wallet/downloads', '_blank');
    }
    throw new Error('Coinbase Wallet extension required');
  }

  try {
    const ethereum = await getEthereumProvider('coinbase');
    const provider = getProvider(ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    setProvider(provider);
    setAccounts([address]);

    ethereum.on('chainChanged', (newChainId) => {
      window.location.reload();
    });

    ethereum.on('accountsChanged', (newAccounts) => {
      setAccounts(newAccounts);
      if (newAccounts.length === 0) {
        console.log('Coinbase Wallet account disconnected');
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
}, [getEthereumProvider, getProvider, isCoinbaseInstalled]);

const connectInjectedWallet = useCallback(async () => {
  const walletType = detectInjectedWallet();
  if (!walletType) {
    throw new Error('No injected wallet detected. Please install a wallet like MetaMask.');
  }

  switch (walletType) {
    case 'metamask':
      return await connectMetaMask();
    case 'trustwallet':
      return await connectTrustWallet();
    case 'binance':
      return await connectBinanceChain();
    case 'coinbase':
      return await connectCoinbaseWallet();
    default:
      throw new Error('Unsupported injected wallet');
  }
}, [detectInjectedWallet, connectMetaMask, connectTrustWallet, connectBinanceChain, connectCoinbaseWallet]);

const handleWalletConnect = useCallback(async (walletId) => {
  if (connectionState === 'connecting') return;

  try {
    setConnectionState('connecting');
    setErrorMessage('');

    let connectionData;
    let effectiveWalletId = walletId;

    // Connect to wallet
    if (!walletId) {
      connectionData = await connectInjectedWallet();
      effectiveWalletId = detectInjectedWallet();
    } else {
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
          throw new Error('Unsupported wallet type');
      }
    }

    if (!connectionData?.address) {
      throw new Error('Failed to get wallet address');
    }

    if (setWalletAddress) {
      setWalletAddress(connectionData.address);
    }

    // Get signature for verification
    const signatureData = await Promise.race([
      requestSignature(connectionData.provider, connectionData.address),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signature request timed out')), 30000)
      )
    ]);
    

    // Verify wallet connection with backend
    const verification = await verifyWalletConnection(
      signatureData.address,
      signatureData.signature,
      signatureData.message
    );

    // Track wallet connection (handles already connected case gracefully)
    try {
      const trackingResult = await trackWalletConnection({
        walletType: effectiveWalletId,
        address: signatureData.address,
        chainId: connectionData.chainId,
        timestamp: new Date().toISOString()
      });

      // If wallet was already connected, we still consider this a success
      if (trackingResult.alreadyConnected) {
        console.log('Wallet already connected to account');
      }
    } catch (trackingError) {
      console.log('Wallet tracking completed with message:', trackingError.message);
      // We don't throw here because the connection itself was successful
      // even if tracking reported the wallet was already connected
    }

    if (verification.user) {
      setUserInfo(verification.user);
    }

    setConnectionState('connected');

    onConnect({
      walletType: effectiveWalletId,
      address: signatureData.address,
      provider: connectionData.provider,
      chainId: connectionData.chainId,
      verification,
      userInfo: verification.user
    });

    return true;
  } catch (error) {
    console.error('Wallet connection error:', error);
    setConnectionState('error');
    
    let errorMsg = error.message;
    
    // Handle specific error cases
    if (error.code === -32002) {
      errorMsg = 'A request is already pending in your wallet. Please check your wallet extension.';
    } else if (error.code === 4001) {
      errorMsg = 'User denied the request. Please approve the connection in your wallet.';
    } else if (error.message.includes('timeout')) {
      errorMsg = 'Connection timed out. Please try again.';
    } else if (error.response?.status === 400 && 
               error.response?.data?.wallet_address?.includes('already connected')) {
      // Special case for already connected wallets
      errorMsg = 'This wallet is already connected to your account.';
      setConnectionState('connected');
      return true;
    }

    setErrorMessage(errorMsg);
    return false;
  }
}, [
  connectionState,
  connectMetaMask,
  connectTrustWallet,
  connectBinanceChain,
  connectCoinbaseWallet,
  connectWithWalletConnect,
  connectInjectedWallet,
  detectInjectedWallet,
  onConnect,
  requestSignature,
  setWalletAddress,
  trackWalletConnection,
  verifyWalletConnection
]);

// Helper function to get wallet by ID
const getWalletById = useCallback((id) => {
  return wallets.find(w => w.id === id);
}, [wallets]);

// Handler for wallet selection
const handleWalletSelect = useCallback((walletId) => {
  setSelectedWallet(walletId);
  handleWalletConnect(walletId);
}, [handleWalletConnect]);


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
                      className={`wallet-option ${wallet.recommended ? 'recommended' : ''}`}
                      onClick={() => handleWalletSelect(wallet.id)}
                      disabled={connectionState === 'connecting'}
                    >
                      <div className="wallet-icon">{wallet.icon}</div>
                      <span>{wallet.name}</span>
                      {wallet.recommended && <span className="recommended-badge">Recommended</span>}
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
                      {uri && <QRCodeCanvas value={uri} size={180} level="H" />}
                      <p className="walletconnect-hint">
                        Or open your wallet app and look for connection requests
                      </p>
                      <a
                        href={`https://walletconnect.com/wallets?uri=${encodeURIComponent(uri)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="walletconnect-app-link"
                      >
                        Don't have a wallet? Get one here
                      </a>
                    </div>
                  )}

                  {selectedWallet !== 'walletconnect' && (
                    <div className="wallet-connection-hint">
                      <p>Check your wallet extension or mobile app to approve the connection</p>
                      {pendingRequest && (
                        <p className="pending-request-note">
                          <FaExclamationTriangle /> A request is pending in your wallet
                        </p>
                      )}
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
                      {`${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`}
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
                      // Don't reset connection here - let the parent handle it
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
                  <div className="error-actions">
                    <button
                      onClick={() => handleWalletConnect(selectedWallet)}
                      className="retry-button"
                      disabled={connectionState === 'connecting'}
                    >
                      Try Again
                    </button>
                    <button
                      onClick={resetConnection}
                      className="secondary-button"
                      disabled={connectionState === 'connecting'}
                    >
                      Choose Different Wallet
                    </button>
                  </div>
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