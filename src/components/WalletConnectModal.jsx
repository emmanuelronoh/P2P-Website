import React, { useState, useEffect } from 'react';
import { FaWallet, FaChevronRight, FaTimes, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { MetaMaskIcon, TrustWalletIcon, BinanceChainIcon, WalletConnectIcon, CoinbaseIcon } from './WalletIcons';
import { QRCodeCanvas } from 'qrcode.react';
import '../styles/ConnectWalletModal.css';

const ConnectWalletModal = ({ onClose, onConnect }) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [connectionState, setConnectionState] = useState('idle'); // 'idle', 'connecting', 'connected', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [uri, setUri] = useState(''); // For WalletConnect URI

  const wallets = [
    { id: 'metamask', name: 'MetaMask', icon: <MetaMaskIcon />, recommended: true, mobile: true, desktop: true, injected: true },
    { id: 'trustwallet', name: 'Trust Wallet', icon: <TrustWalletIcon />, recommended: true, mobile: true, desktop: false, injected: true },
    { id: 'binance', name: 'Binance Chain', icon: <BinanceChainIcon />, recommended: true, mobile: true, desktop: true, injected: true },
    { id: 'walletconnect', name: 'WalletConnect', icon: <WalletConnectIcon />, recommended: true, mobile: true, desktop: true, injected: false },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: <CoinbaseIcon />, recommended: true, mobile: true, desktop: true, injected: true },
    { id: 'opera', name: 'Opera Wallet', icon: <FaWallet />, suggested: true, mobile: true, desktop: true, injected: true },
    { id: 'brave', name: 'Brave Wallet', icon: <FaWallet />, suggested: true, mobile: false, desktop: true, injected: true },
    { id: 'phantom', name: 'Phantom', icon: <FaWallet />, suggested: true, mobile: false, desktop: true, injected: true },
  ];

  // Detect if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  };

  // Detect if Binance Chain is installed
  const isBinanceInstalled = () => {
    return typeof window.BinanceChain !== 'undefined';
  };

  // Detect if Coinbase Wallet is installed
  const isCoinbaseInstalled = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet;
  };

  // Handle wallet connection
  const handleWalletConnect = async (walletId) => {
    setSelectedWallet(walletId);
    setConnectionState('connecting');
    setErrorMessage('');

    try {
      // Simulate different connection methods
      switch (walletId) {
        case 'metamask':
          if (!isMetaMaskInstalled()) {
            window.open('https://metamask.io/download.html', '_blank');
            throw new Error('MetaMask not installed');
          }
          await connectInjectedWallet('metamask');
          break;
        case 'trustwallet':
          await connectInjectedWallet('trustwallet');
          break;
        case 'binance':
          if (!isBinanceInstalled()) {
            window.open('https://www.binance.org/en', '_blank');
            throw new Error('Binance Chain Wallet not installed');
          }
          await connectInjectedWallet('binance');
          break;
        case 'coinbase':
          if (!isCoinbaseInstalled()) {
            window.open('https://www.coinbase.com/wallet', '_blank');
            throw new Error('Coinbase Wallet not installed');
          }
          await connectInjectedWallet('coinbase');
          break;
        case 'walletconnect':
          // In a real app, you would initialize WalletConnect here
          setUri('wc:8a5e5bdc-a0e4-47...'); // Sample URI
          // Simulate successful connection after delay
          setTimeout(() => {
            setConnectionState('connected');
            setTimeout(() => onConnect(walletId), 1000);
          }, 2000);
          return;
        default:
          await connectInjectedWallet(walletId);
      }

      setConnectionState('connected');
      setTimeout(() => onConnect(walletId), 1000);
    } catch (error) {
      setConnectionState('error');
      setErrorMessage(error.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', error);
    }
  };

  // Simulate injected wallet connection
  const connectInjectedWallet = async (walletId) => {
    // In a real app, you would interact with window.ethereum here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 10% chance of error for demonstration
        if (Math.random() > 0.9) {
          reject(new Error('User rejected the request'));
        } else {
          resolve();
        }
      }, 1500);
    });
  };

  const resetConnection = () => {
    setSelectedWallet(null);
    setConnectionState('idle');
    setUri('');
    setErrorMessage('');
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
                <h4 className="wallet-section-title">Recommended</h4>
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
              
              <div className="wallet-section">
                <h4 className="wallet-section-title">More Options</h4>
                <div className="wallet-grid">
                  {wallets.filter(w => !w.recommended).map(wallet => (
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
              <p>New to Ethereum wallets? <a href="https://ethereum.org/en/wallets/" target="_blank" rel="noopener noreferrer">Learn More</a></p>
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
                  
                  {selectedWallet === 'walletconnect' && uri && (
                    <div className="walletconnect-qr">
                      <QRCode value={uri} size={180} />
                      <p>Scan with your wallet app</p>
                    </div>
                  )}
                </>
              )}
              
              {connectionState === 'connected' && (
                <div className="connection-success">
                  <FaCheck className="success-icon" />
                  <p>Wallet connected successfully!</p>
                </div>
              )}
              
              {connectionState === 'error' && (
                <div className="connection-error">
                  <FaExclamationTriangle className="error-icon" />
                  <p>{errorMessage}</p>
                  <button onClick={resetConnection} className="retry-button">
                    Try Again
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