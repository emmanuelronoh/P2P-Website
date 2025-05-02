// import React, { useState, useEffect, useCallback } from 'react';
// import { FaWallet, FaChevronRight, FaTimes, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
// import { MetaMaskIcon, TrustWalletIcon, BinanceChainIcon, WalletConnectIcon, CoinbaseIcon } from './WalletIcons';
// import WalletLink from "@coinbase/wallet-sdk";
// import { QRCodeCanvas } from 'qrcode.react';
// import { BrowserProvider } from 'ethers';
// import WalletConnect from '@walletconnect/client';
// import WalletConnectProvider from "@walletconnect/ethereum-provider";
// import axios from 'axios';
// import '../styles/ConnectWalletModal.css';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cheetahx.onrender.com/';
// const WALLET_CONNECT_ENDPOINT = `${API_BASE_URL}wallet-connect/connect/`;
// const WALLET_TRACK_ENDPOINT = `${API_BASE_URL}wallet-connect/track/`;

// const ConnectWalletModal = ({ onClose, onConnect, setWalletAddress }) => {
//   const [selectedWallet, setSelectedWallet] = useState(null);
//   const [connectionState, setConnectionState] = useState('idle');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [uri, setUri] = useState('');
//   const [connector, setConnector] = useState(null);
//   const [provider, setProvider] = useState(null);
//   const [userInfo, setUserInfo] = useState(null);
//   const [accounts, setAccounts] = useState([]);
//   const [pendingRequest, setPendingRequest] = useState(false);

//   const wallets = [
//     { id: 'metamask', name: 'MetaMask', icon: <MetaMaskIcon />, recommended: true, mobile: true, desktop: true, injected: true },
//     { id: 'trustwallet', name: 'Trust Wallet', icon: <TrustWalletIcon />, recommended: true, mobile: true, desktop: false, injected: true },
//     { id: 'binance', name: 'Binance Chain', icon: <BinanceChainIcon />, recommended: true, mobile: true, desktop: true, injected: true },
//     { id: 'walletconnect', name: 'WalletConnect', icon: <WalletConnectIcon />, recommended: true, mobile: true, desktop: true, injected: false },
//     { id: 'coinbase', name: 'Coinbase Wallet', icon: <CoinbaseIcon />, recommended: true, mobile: true, desktop: true, injected: true },
//   ];

//   // Safe provider initialization with enhanced error handling
//   const getProvider = useCallback((ethereum) => {
//     try {
//       if (!ethereum) {
//         throw new Error('Ethereum provider not found');
//       }
//       return new BrowserProvider(ethereum);
//     } catch (error) {
//       console.error('Error creating provider:', error);
//       throw new Error('Failed to initialize wallet provider');
//     }
//   }, []);

//   // Track wallet connection in backend with retry logic
//   const trackWalletConnection = useCallback(async (walletData) => {
//     try {
//       const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
//       if (!token) {
//         throw new Error('No authentication token found');
//       }

//       const response = await axios.post(WALLET_TRACK_ENDPOINT, walletData, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         timeout: 10000 // 10 second timeout
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error tracking wallet connection:', error);
//       // Retry once if network error
//       if (axios.isAxiosError(error)) {
//         try {
//           const retryResponse = await axios.post(WALLET_TRACK_ENDPOINT, walletData, {
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`
//             }
//           });
//           return retryResponse.data;
//         } catch (retryError) {
//           throw new Error('Failed to track wallet connection after retry');
//         }
//       }
//       throw error;
//     }
//   }, []);

//   // Enhanced verification with timeout and error handling
//   const verifyWalletConnection = useCallback(async (address, signature, message) => {
//     try {
//       const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
//       if (!token) {
//         throw new Error('No authentication token found');
//       }

//       const response = await axios.post(WALLET_CONNECT_ENDPOINT, {
//         wallet_address: address,
//         signature,
//         message
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         timeout: 15000 // 15 second timeout
//       });

//       if (!response.data) {
//         throw new Error('Invalid response from server');
//       }
//       return response.data;
//     } catch (error) {
//       console.error('Error verifying wallet connection:', error.response?.data || error);
//       if (error.response?.status === 400) {
//         throw new Error('Invalid connection data. Please try again.');
//       }
//       throw new Error(error.response?.data?.error || 'Failed to verify wallet connection with server');
//     }
//   }, []);

//   // Improved signature request with concurrency handling
//   const requestSignature = useCallback(async (provider, address) => {
//     if (pendingRequest) {
//       throw new Error('Please complete the pending request in your wallet first.');
//     }

//     try {
//       if (!provider) {
//         throw new Error('Provider not initialized');
//       }

//       setPendingRequest(true);
//       const signer = await provider.getSigner();
//       const nonce = Date.now();
//       const message = `Please sign this message to verify your wallet connection. Nonce: ${nonce}`;

//       // Add a small delay to prevent request flooding
//       await new Promise(resolve => setTimeout(resolve, 300));

//       const signature = await signer.signMessage(message);

//       return {
//         address,
//         message,
//         signature
//       };
//     } catch (error) {
//       console.error('Error requesting signature:', error);
//       if (error.code === -32002) {
//         throw new Error('A signature request is already pending. Please check your wallet.');
//       } else if (error.code === 4001) {
//         throw new Error('User denied message signature');
//       }
//       throw new Error('Failed to request signature. Please try again.');
//     } finally {
//       setPendingRequest(false);
//     }
//   }, [pendingRequest]);

//   // Cleanup effect for wallet connections
//   useEffect(() => {
//     return () => {
//       if (connector) {
//         try {
//           connector.killSession();
//         } catch (error) {
//           console.error('Error killing WalletConnect session:', error);
//         }
//       }
//       if (provider?.disconnect) {
//         try {
//           provider.disconnect();
//         } catch (error) {
//           console.error('Error disconnecting provider:', error);
//         }
//       }
//     };
//   }, [connector, provider]);

//   // Wallet detection utilities
//   const isMetaMaskInstalled = useCallback(() => {
//     return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
//   }, []);

//   const isBinanceInstalled = useCallback(() => {
//     return typeof window.BinanceChain !== 'undefined';
//   }, []);

//   const isCoinbaseInstalled = useCallback(() => {
//     return typeof window.ethereum !== 'undefined' && (window.ethereum.isCoinbaseWallet || window.ethereum.providers?.some(p => p.isCoinbaseWallet));
//   }, []);

//   const isTrustWalletInstalled = useCallback(() => {
//     return typeof window.ethereum !== 'undefined' && window.ethereum.isTrust;
//   }, []);

//   const detectInjectedWallet = useCallback(() => {
//     if (isMetaMaskInstalled()) return 'metamask';
//     if (isTrustWalletInstalled()) return 'trustwallet';
//     if (isBinanceInstalled()) return 'binance';
//     if (isCoinbaseInstalled()) return 'coinbase';
//     return null;
//   }, [isMetaMaskInstalled, isTrustWalletInstalled, isBinanceInstalled, isCoinbaseInstalled]);

//   // Enhanced Ethereum provider detection
//   const getEthereumProvider = useCallback(async (walletId) => {
//     if (walletId === 'binance' && window.BinanceChain) {
//       return window.BinanceChain;
//     }

//     let ethereum = window.ethereum;

//     // Handle cases where multiple providers are injected (like Coinbase + MetaMask)
//     if (ethereum?.providers?.length > 0) {
//       if (walletId === 'metamask') {
//         ethereum = ethereum.providers.find(p => p.isMetaMask);
//       } else if (walletId === 'coinbase') {
//         ethereum = ethereum.providers.find(p => p.isCoinbaseWallet);
//       } else if (walletId === 'trustwallet') {
//         ethereum = ethereum.providers.find(p => p.isTrust);
//       }
//     }

//     if (!ethereum) {
//       throw new Error('No Ethereum provider found');
//     }

//     try {
//       const accounts = await ethereum.request({
//         method: 'eth_requestAccounts',
//         params: [] // Some wallets require empty params
//       });

//       if (!accounts || accounts.length === 0) {
//         throw new Error('No accounts found');
//       }

//       setAccounts(accounts);
//       return ethereum;
//     } catch (error) {
//       console.error('Error requesting accounts:', error);
//       if (error.code === 4001) {
//         throw new Error('User denied account access');
//       } else if (error.code === -32002) {
//         throw new Error('A request is already pending. Please check your wallet.');
//       }
//       throw new Error('Failed to connect to wallet');
//     }
//   }, []);

//   // Wallet-specific connection handlers
//   const connectMetaMask = useCallback(async () => {
//     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//     if (isMobile) {
//       try {
//         // Try deep linking
//         window.location.href = `https://metamask.app.link/dapp/${window.location.hostname}`;

//         // Fallback if deep linking fails
//         setTimeout(() => {
//           window.open('https://metamask.io/download.html', '_blank');
//         }, 500);

//         // Wait for provider to be injected
//         await new Promise(resolve => {
//           const checkProvider = () => {
//             if (isMetaMaskInstalled()) {
//               resolve();
//             } else {
//               setTimeout(checkProvider, 200);
//             }
//           };
//           checkProvider();
//         });

//         const ethereum = await getEthereumProvider('metamask');
//         const provider = getProvider(ethereum);
//         const signer = await provider.getSigner();
//         const address = await signer.getAddress();
//         const network = await provider.getNetwork();

//         setProvider(provider);

//         return {
//           wallet: 'metamask',
//           address,
//           provider,
//           chainId: Number(network.chainId)
//         };
//       } catch (error) {
//         console.error('MetaMask mobile connection error:', error);
//         throw new Error('Failed to connect to MetaMask. Please make sure it is installed and try again.');
//       }
//     }

//     if (!isMetaMaskInstalled()) {
//       const shouldInstall = window.confirm(
//         'MetaMask extension not detected. Would you like to be redirected to install it?'
//       );
//       if (shouldInstall) {
//         window.open('https://metamask.io/download.html', '_blank');
//       }
//       throw new Error('MetaMask extension required');
//     }

//     try {
//       const ethereum = await getEthereumProvider('metamask');
//       const provider = getProvider(ethereum);
//       const signer = await provider.getSigner();
//       const address = await signer.getAddress();
//       const network = await provider.getNetwork();

//       setProvider(provider);

//       // Set up event listeners
//       ethereum.on('chainChanged', (chainId) => {
//         window.location.reload();
//       });

//       ethereum.on('accountsChanged', (newAccounts) => {
//         setAccounts(newAccounts);
//         if (newAccounts.length === 0) {
//           console.log('MetaMask account disconnected');
//         }
//       });

//       return {
//         wallet: 'metamask',
//         address,
//         provider,
//         chainId: Number(network.chainId)
//       };
//     } catch (error) {
//       console.error('MetaMask connection error:', error);
//       if (error.code === 4001) {
//         throw new Error('Please connect your MetaMask account to continue.');
//       } else if (error.code === -32002) {
//         throw new Error('MetaMask is already processing a request. Please check your extension.');
//       } else {
//         throw new Error('Failed to connect to MetaMask. Please try again.');
//       }
//     }
//   }, [getEthereumProvider, getProvider, isMetaMaskInstalled]);

//   const connectTrustWallet = useCallback(async () => {
//     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//     if (isMobile) {
//       try {
//         // Try deep linking
//         window.location.href = `trust://`;

//         // Fallback if deep linking fails
//         setTimeout(() => {
//           window.open('https://trustwallet.com/', '_blank');
//         }, 500);

//         // Wait for provider to be injected
//         await new Promise(resolve => {
//           const checkProvider = () => {
//             if (isTrustWalletInstalled()) {
//               resolve();
//             } else {
//               setTimeout(checkProvider, 200);
//             }
//           };
//           checkProvider();
//         });

//         const ethereum = await getEthereumProvider('trustwallet');
//         const provider = getProvider(ethereum);
//         const signer = await provider.getSigner();
//         const address = await signer.getAddress();
//         const network = await provider.getNetwork();

//         setProvider(provider);

//         return {
//           wallet: 'trustwallet',
//           address,
//           provider,
//           chainId: Number(network.chainId)
//         };
//       } catch (error) {
//         console.error('Trust Wallet mobile connection error:', error);
//         throw new Error('Failed to connect to Trust Wallet. Please make sure it is installed and try again.');
//       }
//     }

//     if (!isTrustWalletInstalled()) {
//       const shouldInstall = window.confirm(
//         'Trust Wallet extension not detected. Would you like to be redirected to install it?'
//       );
//       if (shouldInstall) {
//         window.open('https://trustwallet.com/browser-extension', '_blank');
//       }
//       throw new Error('Trust Wallet extension required');
//     }

//     try {
//       const ethereum = await getEthereumProvider('trustwallet');
//       const provider = getProvider(ethereum);
//       const signer = await provider.getSigner();
//       const address = await signer.getAddress();
//       const network = await provider.getNetwork();

//       setProvider(provider);

//       // Set up event listeners
//       ethereum.on('chainChanged', (chainId) => {
//         window.location.reload();
//       });

//       ethereum.on('accountsChanged', (newAccounts) => {
//         setAccounts(newAccounts);
//         if (newAccounts.length === 0) {
//           console.log('Trust Wallet account disconnected');
//         }
//       });

//       return {
//         wallet: 'trustwallet',
//         address,
//         provider,
//         chainId: Number(network.chainId)
//       };
//     } catch (error) {
//       console.error('Trust Wallet connection error:', error);
//       if (error.code === 4001) {
//         throw new Error('Please connect your Trust Wallet account to continue.');
//       } else if (error.code === -32002) {
//         throw new Error('Trust Wallet is already processing a request. Please check your extension.');
//       } else {
//         throw new Error('Failed to connect to Trust Wallet. Please try again.');
//       }
//     }
//   }, [getEthereumProvider, getProvider, isTrustWalletInstalled]);

//   const connectBinanceChain = useCallback(async () => {
//     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//     if (isMobile) {
//       try {
//         const walletConnectProvider = new WalletConnectProvider({
//           rpc: {
//             56: "https://bsc-dataseed.binance.org/",
//             97: "https://data-seed-prebsc-1-s1.binance.org:8545/"
//           },
//           chainId: 56,
//           bridge: "https://bridge.walletconnect.org",
//           qrcodeModalOptions: {
//             mobileLinks: ['trust', 'metamask', 'binance']
//           }
//         });

//         walletConnectProvider.connector.on("display_uri", (err, payload) => {
//           const uri = payload.params[0];
//           setUri(uri);
//         });

//         await walletConnectProvider.enable();
//         const provider = getProvider(walletConnectProvider);
//         const signer = await provider.getSigner();
//         const address = await signer.getAddress();
//         const network = await provider.getNetwork();

//         setProvider(provider);
//         setAccounts([address]);
//         setConnector(walletConnectProvider.connector);

//         return {
//           wallet: 'binance',
//           address,
//           provider,
//           chainId: Number(network.chainId),
//           walletConnectProvider
//         };
//       } catch (error) {
//         console.error('Binance Chain Wallet mobile connection error:', error);
//         throw new Error('Failed to connect via WalletConnect. Please try again.');
//       }
//     }

//     if (!isBinanceInstalled()) {
//       const shouldInstall = window.confirm(
//         'Binance Chain Wallet extension not detected. Would you like to be redirected to install it?'
//       );
//       if (shouldInstall) {
//         window.open('https://www.binance.org/en/download', '_blank');
//       }
//       throw new Error('Binance Chain Wallet extension required');
//     }

//     try {
//       const binanceChain = window.BinanceChain;
//       await binanceChain.request({ method: 'eth_requestAccounts' });
//       const accounts = await binanceChain.request({ method: 'eth_accounts' });
//       if (accounts.length === 0) {
//         throw new Error('No accounts found. Please unlock your wallet.');
//       }

//       const chainId = await binanceChain.request({ method: 'eth_chainId' });
//       const provider = getProvider(binanceChain);
//       const signer = await provider.getSigner();
//       const address = await signer.getAddress();

//       setProvider(provider);
//       setAccounts(accounts);

//       binanceChain.on('chainChanged', (newChainId) => {
//         window.location.reload();
//       });

//       binanceChain.on('accountsChanged', (newAccounts) => {
//         setAccounts(newAccounts);
//         if (newAccounts.length === 0) {
//           console.log('Binance Chain Wallet account disconnected');
//         }
//       });

//       return {
//         wallet: 'binance',
//         address: accounts[0],
//         provider,
//         chainId: parseInt(chainId)
//       };
//     } catch (error) {
//       console.error('Binance Chain Wallet connection error:', error);
//       if (error.code === 4001) {
//         throw new Error('Please connect your Binance Chain Wallet account to continue.');
//       } else if (error.code === -32002) {
//         throw new Error('Binance Chain Wallet is already processing a request. Please check your extension.');
//       } else if (error.message.includes('User denied account authorization')) {
//         throw new Error('Connection canceled. Please approve the connection request in your wallet.');
//       } else {
//         throw new Error(error.message || 'Failed to connect Binance Chain Wallet. Please try again.');
//       }
//     }
//   }, [getProvider, isBinanceInstalled]);

//   const connectCoinbaseWallet = useCallback(async () => {
//     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//     if (isMobile) {
//       try {
//         const walletLink = new WalletLink({
//           appName: "Your App Name",
//           appLogoUrl: "https://your-app-logo.png",
//           darkMode: false
//         });

//         const ethereum = walletLink.makeWeb3Provider(
//           "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
//           1
//         );

//         const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
//         if (!accounts || accounts.length === 0) {
//           throw new Error('No accounts found');
//         }

//         const provider = getProvider(ethereum);
//         const signer = await provider.getSigner();
//         const address = await signer.getAddress();
//         const network = await provider.getNetwork();

//         setProvider(provider);
//         setAccounts(accounts);

//         ethereum.on('accountsChanged', (newAccounts) => {
//           setAccounts(newAccounts);
//           if (newAccounts.length === 0) {
//             console.log('Coinbase Wallet account disconnected');
//           }
//         });

//         return {
//           wallet: 'coinbase',
//           address,
//           provider,
//           chainId: Number(network.chainId),
//           walletLink
//         };
//       } catch (error) {
//         console.error('Coinbase Wallet mobile connection error:', error);
//         throw new Error('Failed to connect via Coinbase Wallet. Please try again.');
//       }
//     }

//     if (!isCoinbaseInstalled()) {
//       const shouldInstall = window.confirm(
//         'Coinbase Wallet extension not detected. Would you like to be redirected to install it?'
//       );
//       if (shouldInstall) {
//         window.open('https://www.coinbase.com/wallet/downloads', '_blank');
//       }
//       throw new Error('Coinbase Wallet extension required');
//     }

//     try {
//       const ethereum = await getEthereumProvider('coinbase');
//       const provider = getProvider(ethereum);
//       const signer = await provider.getSigner();
//       const address = await signer.getAddress();
//       const network = await provider.getNetwork();

//       setProvider(provider);
//       setAccounts([address]);

//       ethereum.on('chainChanged', (newChainId) => {
//         window.location.reload();
//       });

//       ethereum.on('accountsChanged', (newAccounts) => {
//         setAccounts(newAccounts);
//         if (newAccounts.length === 0) {
//           console.log('Coinbase Wallet account disconnected');
//         }
//       });

//       return {
//         wallet: 'coinbase',
//         address,
//         provider,
//         chainId: Number(network.chainId)
//       };
//     } catch (error) {
//       console.error('Coinbase Wallet connection error:', error);
//       if (error.code === 4001) {
//         throw new Error('Please connect your Coinbase Wallet account to continue.');
//       } else if (error.code === -32002) {
//         throw new Error('Coinbase Wallet is already processing a request. Please check your extension.');
//       } else if (error.message.includes('User denied account authorization')) {
//         throw new Error('Connection canceled. Please approve the connection request in your wallet.');
//       } else if (error.message.includes('Already processing eth_requestAccounts')) {
//         throw new Error('Please complete the pending connection request in your wallet first.');
//       } else {
//         throw new Error(error.message || 'Failed to connect Coinbase Wallet. Please try again.');
//       }
//     }
//   }, [getEthereumProvider, getProvider, isCoinbaseInstalled]);

//   const connectWithWalletConnect = useCallback(async () => {
//     try {
//       const walletConnectProvider = new WalletConnectProvider({
//         rpc: {
//           1: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
//           56: "https://bsc-dataseed.binance.org/",
//           137: "https://polygon-rpc.com/"
//         },
//         qrcode: false,
//         chainId: 1, // Default to Ethereum mainnet
//         bridge: "https://bridge.walletconnect.org",
//         qrcodeModalOptions: {
//           mobileLinks: ['metamask', 'trust', 'rainbow', 'argent', 'imtoken']
//         }
//       });

//       walletConnectProvider.connector.on("display_uri", (err, payload) => {
//         const uri = payload.params[0];
//         setUri(uri);
//       });

//       await walletConnectProvider.enable();
//       const provider = getProvider(walletConnectProvider);
//       const signer = await provider.getSigner();
//       const address = await signer.getAddress();
//       const network = await provider.getNetwork();

//       setProvider(provider);
//       setConnector(walletConnectProvider.connector);
//       setAccounts([address]);

//       // Set up event listeners
//       walletConnectProvider.on("accountsChanged", (accounts) => {
//         setAccounts(accounts);
//       });

//       walletConnectProvider.on("chainChanged", (chainId) => {
//         window.location.reload();
//       });

//       walletConnectProvider.on("disconnect", (code, reason) => {
//         console.log(`WalletConnect disconnected: ${reason} (code: ${code})`);
//         resetConnection();
//       });

//       return {
//         wallet: 'walletconnect',
//         address,
//         provider,
//         chainId: Number(network.chainId),
//         walletConnectProvider
//       };
//     } catch (error) {
//       console.error('WalletConnect error:', error);
//       if (error.message.includes('User closed modal')) {
//         throw new Error('Connection canceled by user');
//       } else if (error.message.includes('Session disconnected')) {
//         throw new Error('Session disconnected. Please try again.');
//       }
//       throw new Error('Failed to connect via WalletConnect. Please try again.');
//     }
//   }, [getProvider]);

//   // First, define connectInjectedWallet independently
//   const connectInjectedWallet = useCallback(async () => {
//     const walletType = detectInjectedWallet();
//     if (!walletType) {
//       throw new Error('No injected wallet detected. Please install a wallet like MetaMask.');
//     }

//     // Directly use the specific connection functions instead of going through handleWalletConnect
//     switch (walletType) {
//       case 'metamask':
//         return await connectMetaMask();
//       case 'trustwallet':
//         return await connectTrustWallet();
//       case 'binance':
//         return await connectBinanceChain();
//       case 'coinbase':
//         return await connectCoinbaseWallet();
//       default:
//         throw new Error('Unsupported injected wallet');
//     }
//   }, [detectInjectedWallet, connectMetaMask, connectTrustWallet, connectBinanceChain, connectCoinbaseWallet]);

//   // Then define handleWalletConnect without depending on connectInjectedWallet
//   const handleWalletConnect = useCallback(async (walletId) => {
//     if (connectionState === 'connecting') return;

//     try {
//       setConnectionState('connecting');
//       setErrorMessage('');

//       let connectionData;
//       let effectiveWalletId = walletId;

//       // If no specific wallet is selected, try injected wallet
//       if (!walletId) {
//         connectionData = await connectInjectedWallet();
//         effectiveWalletId = detectInjectedWallet();
//       } else {
//         switch (walletId) {
//           case 'metamask':
//             connectionData = await connectMetaMask();
//             break;
//           case 'trustwallet':
//             connectionData = await connectTrustWallet();
//             break;
//           case 'binance':
//             connectionData = await connectBinanceChain();
//             break;
//           case 'coinbase':
//             connectionData = await connectCoinbaseWallet();
//             break;
//           case 'walletconnect':
//             connectionData = await connectWithWalletConnect();
//             break;
//           default:
//             throw new Error('Unsupported wallet type');
//         }
//       }

//       if (!connectionData || !connectionData.address) {
//         throw new Error('Failed to get wallet address');
//       }

//       if (setWalletAddress) {
//         setWalletAddress(connectionData.address);
//       }

//       // Request signature with timeout
//       const signatureData = await Promise.race([
//         requestSignature(connectionData.provider, connectionData.address),
//         new Promise((_, reject) =>
//           setTimeout(() => reject(new Error('Signature request timed out')), 30000)
//         )
//       ]);

//       // Verify connection with backend
//       const verification = await verifyWalletConnection(
//         signatureData.address,
//         signatureData.signature,
//         signatureData.message
//       );

//       // Track successful connection
//       await trackWalletConnection({
//         walletType: effectiveWalletId,
//         address: signatureData.address,
//         chainId: connectionData.chainId,
//         timestamp: new Date().toISOString(),
//         userAgent: navigator.userAgent,
//         verificationData: verification
//       });

//       if (verification.user) {
//         setUserInfo(verification.user);
//       }

//       setConnectionState('connected');

//       // Notify parent component
//       onConnect({
//         walletType: effectiveWalletId,
//         address: signatureData.address,
//         provider: connectionData.provider,
//         chainId: connectionData.chainId,
//         verification,
//         userInfo: verification.user
//       });

//       return true;
//     } catch (error) {
//       console.error('Wallet connection error:', error);
//       setConnectionState('error');

//       let errorMsg = error.message || error.reason || 'Failed to connect wallet.';

//       // Handle specific error cases
//       if (error.code === -32002) {
//         errorMsg = 'A request is already pending in your wallet. Please check your wallet extension.';
//       } else if (error.code === 4001) {
//         errorMsg = 'User denied the request. Please approve the connection in your wallet.';
//       } else if (error.message.includes('timeout')) {
//         errorMsg = 'Connection timed out. Please try again.';
//       }

//       setErrorMessage(errorMsg);
//       return false;
//     }
//   }, [
//     connectMetaMask,
//     connectTrustWallet,
//     connectBinanceChain,
//     connectCoinbaseWallet,
//     connectWithWalletConnect,
//     connectInjectedWallet,
//     connectionState,
//     onConnect,
//     requestSignature,
//     setWalletAddress,
//     trackWalletConnection,
//     verifyWalletConnection,
//     detectInjectedWallet
//   ]);

//   const handleWalletSelect = useCallback((walletId) => {
//     setSelectedWallet(walletId);
//     handleWalletConnect(walletId);
//   }, [handleWalletConnect]);

//   const resetConnection = useCallback(() => {
//     if (connector) {
//       try {
//         connector.killSession();
//       } catch (error) {
//         console.error('Error killing WalletConnect session:', error);
//       }
//     }
//     if (provider?.disconnect) {
//       try {
//         provider.disconnect();
//       } catch (error) {
//         console.error('Error disconnecting provider:', error);
//       }
//     }
//     setSelectedWallet(null);
//     setConnectionState('idle');
//     setUri('');
//     setErrorMessage('');
//     setProvider(null);
//     setUserInfo(null);
//     setAccounts([]);
//     setPendingRequest(false);
//   }, [connector, provider]);

//   const getWalletById = useCallback((id) => wallets.find(w => w.id === id), [wallets]);

//   return (
//     <div className="wallet-modal-overlay">
//       <div className="wallet-modal">
//         {connectionState === 'idle' ? (
//           <>
//             <div className="wallet-modal-header">
//               <h3>Connect Wallet</h3>
//               <button onClick={onClose} className="wallet-modal-close">
//                 <FaTimes />
//               </button>
//             </div>

//             <div className="wallet-modal-body">
//               <div className="wallet-section">
//                 <h4 className="wallet-section-title">Choose your wallet</h4>
//                 <div className="wallet-grid">
//                   {wallets.map(wallet => (
//                     <button
//                       key={wallet.id}
//                       className={`wallet-option ${wallet.recommended ? 'recommended' : ''}`}
//                       onClick={() => handleWalletSelect(wallet.id)}
//                       disabled={connectionState === 'connecting'}
//                     >
//                       <div className="wallet-icon">{wallet.icon}</div>
//                       <span>{wallet.name}</span>
//                       {wallet.recommended && <span className="recommended-badge">Recommended</span>}
//                       <FaChevronRight className="wallet-arrow" />
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="wallet-modal-footer">
//               <p>New to crypto wallets? <a href="https://ethereum.org/en/wallets/" target="_blank" rel="noopener noreferrer">Learn More</a></p>
//             </div>
//           </>
//         ) : (
//           <div className="wallet-connection-view">
//             <button onClick={resetConnection} className="wallet-modal-back">
//               &larr; Back to wallets
//             </button>

//             <div className="connection-content">
//               <div className="connection-icon">
//                 {getWalletById(selectedWallet)?.icon || <FaWallet />}
//                 {connectionState === 'connecting' && <div className="connection-pulse"></div>}
//               </div>

//               <h3>{getWalletById(selectedWallet)?.name}</h3>

//               {connectionState === 'connecting' && (
//                 <>
//                   <p>Waiting for connection...</p>
//                   <div className="connection-status">
//                     <FaSpinner className="spinner" />
//                     <span>Initializing connection</span>
//                   </div>

//                   {selectedWallet === 'walletconnect' && (
//                     <div className="walletconnect-qr">
//                       <p>Scan with your wallet app</p>
//                       {uri && <QRCodeCanvas value={uri} size={180} level="H" />}
//                       <p className="walletconnect-hint">
//                         Or open your wallet app and look for connection requests
//                       </p>
//                       <a
//                         href={`https://walletconnect.com/wallets?uri=${encodeURIComponent(uri)}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="walletconnect-app-link"
//                       >
//                         Don't have a wallet? Get one here
//                       </a>
//                     </div>
//                   )}

//                   {selectedWallet !== 'walletconnect' && (
//                     <div className="wallet-connection-hint">
//                       <p>Check your wallet extension or mobile app to approve the connection</p>
//                       {pendingRequest && (
//                         <p className="pending-request-note">
//                           <FaExclamationTriangle /> A request is pending in your wallet
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </>
//               )}

//               {connectionState === 'connected' && (
//                 <div className="connection-success">
//                   <FaCheck className="success-icon" />
//                   <p>Wallet connected successfully!</p>
//                   {accounts.length > 0 && (
//                     <p className="connection-address">
//                       {`${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`}
//                     </p>
//                   )}
//                   {userInfo && (
//                     <div className="user-info">
//                       <p>Welcome back, {userInfo.username || 'user'}!</p>
//                     </div>
//                   )}
          
//                   <button
//                     onClick={() => {
//                       onClose();
//                       // Don't reset connection here - let the parent handle it
//                     }}
//                     className="continue-button"
//                   >
//                     Continue
//                   </button>
//                 </div>
//               )}

//               {connectionState === 'error' && (
//                 <div className="connection-error">
//                   <FaExclamationTriangle className="error-icon" />
//                   <p>{errorMessage}</p>
//                   <div className="error-actions">
//                     <button
//                       onClick={() => handleWalletConnect(selectedWallet)}
//                       className="retry-button"
//                       disabled={connectionState === 'connecting'}
//                     >
//                       Try Again
//                     </button>
//                     <button
//                       onClick={resetConnection}
//                       className="secondary-button"
//                       disabled={connectionState === 'connecting'}
//                     >
//                       Choose Different Wallet
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ConnectWalletModal;


import React, { useState, useEffect, useCallback } from 'react';
import { FaWallet, FaChevronRight, FaTimes, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { MetaMaskIcon, TrustWalletIcon, BinanceChainIcon, WalletConnectIcon, CoinbaseIcon } from './WalletIcons';
import WalletLink from "@coinbase/wallet-sdk";
import { QRCodeCanvas } from 'qrcode.react';
import { BrowserProvider } from 'ethers';
import WalletConnect from '@walletconnect/client';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
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
  const [connectionData, setConnectionData] = useState(null);

  const wallets = [
    { id: 'metamask', name: 'MetaMask', icon: <MetaMaskIcon />, recommended: true, mobile: true, desktop: true, injected: true },
    { id: 'trustwallet', name: 'Trust Wallet', icon: <TrustWalletIcon />, recommended: true, mobile: true, desktop: false, injected: true },
    { id: 'binance', name: 'Binance Chain', icon: <BinanceChainIcon />, recommended: true, mobile: true, desktop: true, injected: true },
    { id: 'walletconnect', name: 'WalletConnect', icon: <WalletConnectIcon />, recommended: true, mobile: true, desktop: true, injected: false },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: <CoinbaseIcon />, recommended: true, mobile: true, desktop: true, injected: true },
  ];


  // Add these to your wallet connection handlers
const connectBinanceChain = async () => {
  if (!isBinanceInstalled()) {
    window.open('https://www.bnbchain.org/en/binance-wallet', '_blank');
    throw new Error('Binance Chain Wallet not installed');
  }
  
  try {
    const accounts = await window.BinanceChain.request({ method: 'eth_requestAccounts' });
    const chainId = await window.BinanceChain.request({ method: 'eth_chainId' });
    
    return {
      wallet: 'binance',
      address: accounts[0],
      chainId: parseInt(chainId),
      provider: window.BinanceChain
    };
  } catch (error) {
    console.error('Binance Chain error:', error);
    throw new Error(error.message || 'Failed to connect Binance Chain');
  }
};

const connectCoinbaseWallet = async () => {
  const walletLink = new WalletLink({
    appName: "Your App",
    appLogoUrl: "logo.png"
  });
  
  const provider = walletLink.makeWeb3Provider(
    "https://mainnet.infura.io/v3/YOUR_INFURA_KEY", 
    1
  );
  
  try {
    await provider.enable();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    
    return {
      wallet: 'coinbase',
      address,
      provider: ethersProvider,
      chainId: 1 // Mainnet
    };
  } catch (error) {
    console.error('Coinbase Wallet error:', error);
    throw new Error('Failed to connect Coinbase Wallet');
  }
};

  // Safe provider initialization with enhanced error handling
  const getProvider = useCallback((ethereum) => {
    try {
      if (!ethereum) {
        throw new Error('Ethereum provider not found');
      }
      return new BrowserProvider(ethereum);
    } catch (error) {
      console.error('Error creating provider:', error);
      throw new Error('Failed to initialize wallet provider');
    }
  }, []);

  // Track wallet connection in backend with retry logic
  const trackWalletConnection = useCallback(async (walletData) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(WALLET_TRACK_ENDPOINT, walletData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 // 10 second timeout
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking wallet connection:', error);
      // Retry once if network error
      if (axios.isAxiosError(error) && !error.response) {
        try {
          const retryResponse = await axios.post(WALLET_TRACK_ENDPOINT, walletData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`
            }
          });
          return retryResponse.data;
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      }
      throw error;
    }
  }, []);

  // Enhanced verification with timeout and error handling
  const verifyWalletConnection = useCallback(async (address, signature, message) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
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
        timeout: 15000 // 15 second timeout
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

  // Improved signature request with concurrency handling
  const requestSignature = useCallback(async (provider, address) => {
    if (pendingRequest) {
      throw new Error('Please complete the pending request in your wallet first.');
    }

    try {
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      setPendingRequest(true);
      const signer = await provider.getSigner();
      const nonce = Date.now();
      const message = `Please sign this message to verify your wallet connection. Nonce: ${nonce}`;

      // Add a small delay to prevent request flooding
      await new Promise(resolve => setTimeout(resolve, 300));

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

  // Cleanup effect for wallet connections
  useEffect(() => {
    return () => {
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
    };
  }, [connector, provider]);

  const connectTrustWallet = useCallback(async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
    if (isMobile) {
      try {
        // Try deep linking
        window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(window.location.href)}`;
  
        // Fallback if deep linking fails
        setTimeout(() => {
          window.open('https://trustwallet.com/', '_blank');
        }, 500);
  
        // Wait for provider to be injected
        await new Promise((resolve, reject) => {
          const checkProvider = () => {
            if (isTrustWalletInstalled()) {
              resolve();
            } else {
              setTimeout(checkProvider, 200);
            }
          };
          setTimeout(() => reject(new Error('Timeout waiting for Trust Wallet')), 10000);
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
      } catch (error) {
        console.error('Trust Wallet mobile connection error:', error);
        throw new Error('Failed to connect to Trust Wallet. Please make sure it is installed and try again.');
      }
    }
  
    if (!isTrustWalletInstalled()) {
      const shouldInstall = window.confirm(
        'Trust Wallet extension not detected. Would you like to be redirected to install it?'
      );
      if (shouldInstall) {
        window.open('https://trustwallet.com/browser-extension', '_blank');
      }
      throw new Error('Trust Wallet extension required');
    }
  
    try {
      const ethereum = await getEthereumProvider('trustwallet');
      const provider = getProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
  
      setProvider(provider);
  
      // Set up event listeners
      ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
  
      ethereum.on('accountsChanged', (newAccounts) => {
        setAccounts(newAccounts);
        if (newAccounts.length === 0) {
          console.log('Trust Wallet account disconnected');
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
      if (error.code === 4001) {
        throw new Error('Please connect your Trust Wallet account to continue.');
      } else if (error.code === -32002) {
        throw new Error('Trust Wallet is already processing a request. Please check your extension.');
      } else {
        throw new Error('Failed to connect to Trust Wallet. Please try again.');
      }
    }
  }, [getEthereumProvider, getProvider, isTrustWalletInstalled]);

  // Wallet detection utilities
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  }, []);

  const isBinanceInstalled = useCallback(() => {
    return typeof window.BinanceChain !== 'undefined';
  }, []);

  const isCoinbaseInstalled = useCallback(() => {
    return typeof window.ethereum !== 'undefined' && (window.ethereum.isCoinbaseWallet || window.ethereum.providers?.some(p => p.isCoinbaseWallet));
  }, []);

  const isTrustWalletInstalled = useCallback(() => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isTrust;
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

    // Handle cases where multiple providers are injected (like Coinbase + MetaMask)
    if (ethereum?.providers?.length > 0) {
      if (walletId === 'metamask') {
        ethereum = ethereum.providers.find(p => p.isMetaMask);
      } else if (walletId === 'coinbase') {
        ethereum = ethereum.providers.find(p => p.isCoinbaseWallet);
      } else if (walletId === 'trustwallet') {
        ethereum = ethereum.providers.find(p => p.isTrust);
      }
    }

    if (!ethereum) {
      throw new Error('No Ethereum provider found');
    }

    try {
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
        params: [] // Some wallets require empty params
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

  const connectWithWalletConnect = async () => {
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org",
      qrcodeModal: {
        open: (uri) => setUri(uri),
        close: () => setUri('')
      }
    });
  
    try {
      // Create session
      if (!connector.connected) {
        await connector.createSession();
      }
  
      // Subscribe to events
      connector.on("connect", (error, payload) => {
        if (error) throw error;
        const { accounts, chainId } = payload.params[0];
        return {
          wallet: 'walletconnect',
          address: accounts[0],
          chainId,
          connector
        };
      });
  
      connector.on("session_update", (error) => {
        if (error) throw error;
      });
  
      connector.on("disconnect", (error) => {
        if (error) throw error;
        resetConnection();
      });
  
    } catch (error) {
      console.error('WalletConnect error:', error);
      throw new Error('WalletConnect failed');
    }
  };

  // Add to your connection handlers
const connectionTimeout = setTimeout(() => {
  throw new Error('Connection timed out after 30 seconds');
}, 30000);

// Clear timeout on success/error
clearTimeout(connectionTimeout);

  // Wallet-specific connection handlers
  const connectMetaMask = useCallback(async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      try {
        // Try deep linking
        window.location.href = `https://metamask.app.link/dapp/${window.location.hostname}`;

        // Fallback if deep linking fails
        setTimeout(() => {
          window.open('https://metamask.io/download.html', '_blank');
        }, 500);

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
      ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });

      ethereum.on('accountsChanged', (newAccounts) => {
        setAccounts(newAccounts);
        if (newAccounts.length === 0) {
          console.log('MetaMask account disconnected');
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
      if (error.code === 4001) {
        throw new Error('Please connect your MetaMask account to continue.');
      } else if (error.code === -32002) {
        throw new Error('MetaMask is already processing a request. Please check your extension.');
      } else {
        throw new Error('Failed to connect to MetaMask. Please try again.');
      }
    }
  }, [getEthereumProvider, getProvider, isMetaMaskInstalled]);

  // ... (other wallet connection handlers remain the same as in your original code)

  const handleWalletConnect = useCallback(async (walletId) => {
    if (connectionState === 'connecting') return;

    try {
      setConnectionState('connecting');
      setErrorMessage('');
      setConnectionData(null);

      let connectionResult;
      let effectiveWalletId = walletId;

      // If no specific wallet is selected, try injected wallet
      if (!walletId) {
        connectionResult = await connectInjectedWallet();
        effectiveWalletId = detectInjectedWallet();
      } else {
        switch (walletId) {
          case 'metamask':
            connectionResult = await connectMetaMask();
            break;
          case 'trustwallet':
            connectionResult = await connectTrustWallet();
            break;
          case 'binance':
            connectionResult = await connectBinanceChain();
            break;
          case 'coinbase':
            connectionResult = await connectCoinbaseWallet();
            break;
          case 'walletconnect':
            connectionResult = await connectWithWalletConnect();
            break;
          default:
            throw new Error('Unsupported wallet type');
        }
      }

      if (!connectionResult || !connectionResult.address) {
        throw new Error('Failed to get wallet address');
      }

      // Store connection data for later use
      setConnectionData(connectionResult);

      if (setWalletAddress) {
        setWalletAddress(connectionResult.address);
      }

      // Request signature with timeout
      const signatureData = await Promise.race([
        requestSignature(connectionResult.provider, connectionResult.address),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Signature request timed out')), 30000)
        )
      ]);

      // Verify connection with backend
      const verification = await verifyWalletConnection(
        signatureData.address,
        signatureData.signature,
        signatureData.message
      );

      // Track successful connection
      await trackWalletConnection({
        walletType: effectiveWalletId,
        address: signatureData.address,
        chainId: connectionResult.chainId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        verificationData: verification
      });

      if (verification.user) {
        setUserInfo(verification.user);
      }

      setConnectionState('connected');

      // Notify parent component
      if (onConnect) {
        onConnect({
          walletType: effectiveWalletId,
          address: signatureData.address,
          provider: connectionResult.provider,
          chainId: connectionResult.chainId,
          verification,
          userInfo: verification.user
        });
      }

      return true;
    } catch (error) {
      console.error('Wallet connection error:', error);
      setConnectionState('error');

      let errorMsg = error.message || error.reason || 'Failed to connect wallet.';

      // Handle specific error cases
      if (error.code === -32002) {
        errorMsg = 'A request is already pending in your wallet. Please check your wallet extension.';
      } else if (error.code === 4001) {
        errorMsg = 'User denied the request. Please approve the connection in your wallet.';
      } else if (error.message.includes('timeout')) {
        errorMsg = 'Connection timed out. Please try again.';
      }

      setErrorMessage(errorMsg);
      return false;
    }
  }, [
    connectMetaMask,
    connectTrustWallet,
    connectBinanceChain,
    connectCoinbaseWallet,
    connectWithWalletConnect,
    connectInjectedWallet,
    connectionState,
    onConnect,
    requestSignature,
    setWalletAddress,
    trackWalletConnection,
    verifyWalletConnection,
    detectInjectedWallet
  ]);

  const handleWalletSelect = useCallback((walletId) => {
    setSelectedWallet(walletId);
    handleWalletConnect(walletId);
  }, [handleWalletConnect]);

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
    setConnectionData(null);
  }, [connector, provider]);

  const handleContinue = useCallback(() => {
    if (connectionData && connectionState === 'connected') {
      // Ensure we pass all connection data to parent before closing
      if (onConnect) {
        onConnect({
          walletType: selectedWallet,
          address: accounts[0],
          provider,
          chainId: connectionData.chainId,
          userInfo
        });
      }
    }
    onClose();
  }, [connectionData, connectionState, onConnect, selectedWallet, accounts, provider, userInfo, onClose]);

  const getWalletById = useCallback((id) => wallets.find(w => w.id === id), [wallets]);

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
                    onClick={handleContinue}
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