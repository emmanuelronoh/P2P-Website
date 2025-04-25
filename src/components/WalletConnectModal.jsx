import React, { useState, useEffect } from 'react';
import { FaWallet, FaChevronRight, FaTimes, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { MetaMaskIcon, TrustWalletIcon, BinanceChainIcon, WalletConnectIcon, CoinbaseIcon } from './WalletIcons';
import { QRCodeCanvas } from 'qrcode.react';
import { ethers } from 'ethers';
import WalletConnect from '@walletconnect/client';
import WalletConnectProvider from '@walletconnect/web3-provider';
import '../styles/ConnectWalletModal.css';

const ConnectWalletModal = ({ onClose, onConnect }) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [connectionState, setConnectionState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uri, setUri] = useState('');
  const [connector, setConnector] = useState(null);
  const [provider, setProvider] = useState(null);

  const wallets = [
    { id: 'metamask', name: 'MetaMask', icon: <MetaMaskIcon />, recommended: true, mobile: true, desktop: true, injected: true },
    { id: 'trustwallet', name: 'Trust Wallet', icon: <TrustWalletIcon />, recommended: true, mobile: true, desktop: false, injected: true },
    { id: 'binance', name: 'Binance Chain', icon: <BinanceChainIcon />, recommended: true, mobile: true, desktop: true, injected: true },
    { id: 'walletconnect', name: 'WalletConnect', icon: <WalletConnectIcon />, recommended: true, mobile: true, desktop: true, injected: false },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: <CoinbaseIcon />, recommended: true, mobile: true, desktop: true, injected: true },
  ];

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

  const handleWalletConnect = async (walletId) => {
    setSelectedWallet(walletId);
    setConnectionState('connecting');
    setErrorMessage('');

    try {
      switch (walletId) {
        case 'metamask':
          await connectMetaMask();
          break;
        case 'trustwallet':
          await connectTrustWallet();
          break;
        case 'binance':
          await connectBinanceChain();
          break;
        case 'coinbase':
          await connectCoinbaseWallet();
          break;
        case 'walletconnect':
          await connectWithWalletConnect();
          break;
        default:
          await connectInjectedWallet();
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setConnectionState('error');
      setErrorMessage(
        error.message || 
        error.reason || 
        'Failed to connect wallet. Please try again or use a different wallet.'
      );
    }
  };

  const getEthereumProvider = async (walletId) => {
    if (walletId === 'binance' && window.BinanceChain) {
      return window.BinanceChain;
    }
    
    if (window.ethereum) {
      // Handle cases where multiple wallets might be injected
      try {
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        return window.ethereum;
      } catch (error) {
        throw new Error('User denied account access');
      }
    }
    
    throw new Error('No Ethereum provider found');
  };

  // Inside ConnectWalletModal's connection handlers (like connectMetaMask):
const connectMetaMask = async () => {
  if (!isMetaMaskInstalled()) {
    window.open('https://metamask.io/download.html', '_blank');
    throw new Error('MetaMask not installed');
  }
  
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (accounts.length > 0) {
    setConnectionState('connected');
    onConnect('metamask', accounts[0], window.ethereum);
  } else {
    throw new Error('No accounts found');
  }
};

  const connectTrustWallet = async () => {
    if (!isTrustWalletInstalled()) {
      window.open('https://trustwallet.com/', '_blank');
      throw new Error('Trust Wallet not installed');
    }
    
    const ethereum = await getEthereumProvider('trustwallet');
    const provider = new ethers.providers.Web3Provider(ethereum);
    
    const network = await provider.getNetwork();
    const accounts = await provider.listAccounts();
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    setProvider(provider);
    setConnectionState('connected');
    onConnect({
      wallet: 'trustwallet',
      address: accounts[0],
      provider,
      chainId: network.chainId
    });
  };

  const connectBinanceChain = async () => {
    if (!isBinanceInstalled()) {
      window.open('https://www.binance.org/en', '_blank');
      throw new Error('Binance Chain Wallet not installed');
    }
    
    const binanceChain = window.BinanceChain;
    try {
      await binanceChain.request({ method: 'eth_requestAccounts' });
      const accounts = await binanceChain.request({ method: 'eth_accounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const chainId = await binanceChain.request({ method: 'eth_chainId' });
      const provider = new ethers.providers.Web3Provider(binanceChain);
      
      setProvider(provider);
      setConnectionState('connected');
      onConnect({
        wallet: 'binance',
        address: accounts[0],
        provider,
        chainId: parseInt(chainId)
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to connect Binance Chain Wallet');
    }
  };

  const connectCoinbaseWallet = async () => {
    if (!isCoinbaseInstalled()) {
      window.open('https://www.coinbase.com/wallet', '_blank');
      throw new Error('Coinbase Wallet not installed');
    }
    
    const ethereum = await getEthereumProvider('coinbase');
    const provider = new ethers.providers.Web3Provider(ethereum);
    
    const network = await provider.getNetwork();
    const accounts = await provider.listAccounts();
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    setProvider(provider);
    setConnectionState('connected');
    onConnect({
      wallet: 'coinbase',
      address: accounts[0],
      provider,
      chainId: network.chainId
    });
  };

  const connectWithWalletConnect = async () => {
    try {
      // WalletConnect v2 provider
      const walletConnectProvider = new WalletConnectProvider({
        rpc: {
          1: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
          56: "https://bsc-dataseed.binance.org/",
          // Add other chain IDs as needed
        },
        qrcode: true,
      });
      
      // Enable session (triggers QR Code modal)
      await walletConnectProvider.enable();
      
      const ethersProvider = new ethers.providers.Web3Provider(walletConnectProvider);
      const signer = ethersProvider.getSigner();
      const address = await signer.getAddress();
      const network = await ethersProvider.getNetwork();
      
      setProvider(ethersProvider);
      setConnectionState('connected');
      
      onConnect({
        wallet: 'walletconnect',
        address,
        provider: ethersProvider,
        chainId: network.chainId,
        walletConnectProvider
      });
      
      // Handle disconnection
      walletConnectProvider.on("disconnect", (code, reason) => {
        console.log(`WalletConnect disconnected: ${reason} (${code})`);
        resetConnection();
      });
      
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
    await handleWalletConnect(walletType);
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
  };

  const getWalletById = (id) => wallets.find(w => w.id === id);

  return (
    <div className="wallet-modal-overlay">
      <div className="wallet-modal">
        {connectionState === 'idle' ? (
          <>
            <div className="wallet-modal-header">
              <h3>Connect a Wallet</h3>
              <button onClick={onClose} className="wallet-modal-close">
                <FaTimes />
              </button>
            </div>
            
            <div className="wallet-modal-body">
              <div className="wallet-section">
                <h4 className="wallet-section-title">Popular</h4>
                <div className="wallet-grid">
                  {wallets.filter(w => w.recommended).map(wallet => (
                    <button 
                      key={wallet.id}
                      className="wallet-option"
                      onClick={() => handleWalletConnect(wallet.id)}
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
                    <span>Initializing</span>
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
                  <p className="connection-address">
                    {provider?.provider?.selectedAddress || ''}
                  </p>
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