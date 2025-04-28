import React, { useState, useEffect, useContext } from 'react';
import { FiCreditCard, FiArrowUp, FiArrowDown, FiLink, FiCopy, FiShield } from 'react-icons/fi';
import { FaBitcoin, FaEthereum, FaSpinner } from 'react-icons/fa';
import { SiLitecoin, SiDogecoin, SiTether } from 'react-icons/si';
import { useAuth } from '../contexts/AuthContext';
import { ethers } from 'ethers';
import ConnectWalletModal from '../components/WalletConnectModal'; 
import "../styles/wallet.css"

const API_BASE_URL = 'https://cheetahx.onrender.com/wallet-connect';

const WalletPage = () => {
  const { 
    user, 
    walletAddress, 
    provider, 
    signer, 
    chainId, 
    balance, 
    disconnectWallet,
    connectWallet 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('crypto');
  const [connectedWallets, setConnectedWallets] = useState([]);
  const [fiatAccounts, setFiatAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

useEffect(() => {
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Fetch crypto wallets from backend
      const cryptoResponse = await fetch(`${API_BASE_URL}/wallets/crypto/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!cryptoResponse.ok) throw new Error('Failed to fetch crypto wallets');
      let cryptoWallets = await cryptoResponse.json();
      
      // Ensure the currently connected wallet is included
      if (walletAddress) {
        const isWalletInList = cryptoWallets.some(
          w => w.address.toLowerCase() === walletAddress.toLowerCase()
        );
        
        if (!isWalletInList) {
          cryptoWallets = [{
            id: `temp_${walletAddress}`,
            currency: 'ETH',
            name: 'Connected Wallet',
            balance: parseFloat(ethers.utils.formatEther(balance || '0')).toFixed(4),
            address: walletAddress,
            connected: true,
            chainId: chainId,
            isTemporary: true
          }, ...cryptoWallets];
        }
      }
      
      setConnectedWallets(cryptoWallets);
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
      setError('Failed to load wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  fetchWalletData();
}, [walletAddress, provider, balance, chainId]);

const handleConnectWallet = async (connectionData) => {
  try {
    const { walletType, address, provider, chainId } = connectionData;
    
    // Connect wallet in the UI
    setWalletAddress(address);
    setProvider(provider);
    setChainId(chainId);
    
    // Save the wallet to backend
    const response = await fetch(`${API_BASE_URL}/wallets/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({
        address: address,
        wallet_type: walletType,
        currency: 'ETH',
        name: `${walletType} Wallet`,
        chain_id: chainId
      })
    });
    
    if (!response.ok) throw new Error('Failed to save wallet to backend');
    
    const newWallet = await response.json();
    setConnectedWallets(prev => [newWallet, ...prev]);
    
    setShowConnectModal(false);
  } catch (error) {
    console.error('Wallet connection error:', error);
    setError(error.message || 'Failed to connect wallet. Please try again.');
  }
};

  const handleDisconnect = async (walletId, type) => {
    try {
      if (type === 'crypto') {
        // For temporary wallets (not saved to backend yet), just remove locally
        const wallet = connectedWallets.find(w => w.id === walletId);
        if (wallet?.isTemporary) {
          setConnectedWallets(connectedWallets.filter(w => w.id !== walletId));
          disconnectWallet();
          return;
        }
        
        // For backend-saved wallets, call API to disconnect
        const response = await fetch(`${API_BASE_URL}/wallets/crypto/${walletId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to disconnect wallet');
        
        disconnectWallet();
        setConnectedWallets(connectedWallets.filter(w => w.id !== walletId));
      } else {
        // For fiat accounts, call API to disconnect
        const response = await fetch(`${API_BASE_URL}/wallets/fiat/${walletId}/disconnect`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to disconnect fiat account');
        
        setFiatAccounts(fiatAccounts.map(acc => 
          acc.id === walletId ? {...acc, connected: false} : acc
        ));
      }
    } catch (err) {
      console.error('Disconnect error:', err);
      setError('Failed to disconnect. Please try again.');
    }
  };

  const connectFiatAccount = async () => {
    try {
      // This would open a connection flow (like Plaid for banks)
      // For now, we'll mock adding a new fiat account
      const response = await fetch(`${API_BASE_URL}/wallets/fiat/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          // In a real app, this would include auth details from the connection flow
          institution: 'Bank of America',
          last4: Math.floor(1000 + Math.random() * 9000).toString()
        })
      });
      
      if (!response.ok) throw new Error('Failed to connect fiat account');
      
      const newAccount = await response.json();
      setFiatAccounts([...fiatAccounts, newAccount]);
    } catch (err) {
      console.error('Fiat connection error:', err);
      setError('Failed to connect fiat account. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getNetworkName = (chainId) => {
    switch(chainId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 56: return 'Binance Smart Chain';
      case 137: return 'Polygon';
      default: return `Chain ID: ${chainId}`;
    }
  };

  const getCurrencyIcon = (currency) => {
    switch(currency) {
      case 'BTC': return <FaBitcoin className="currency-icon btc" />;
      case 'ETH': return <FaEthereum className="currency-icon eth" />;
      case 'USDT': return <SiTether className="currency-icon usdt" />;
      case 'LTC': return <SiLitecoin className="currency-icon ltc" />;
      case 'DOGE': return <SiDogecoin className="currency-icon doge" />;
      default: return <div className="currency-icon fiat">{currency}</div>;
    }
  };

  if (loading) {
    return (
      <div className="wallet-container loading">
        <FaSpinner className="spinner" />
        <p>Loading wallet data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-container error">
        <h1><FiCreditCard className="icon" /> Wallet Management</h1>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h1><FiCreditCard className="icon" /> Wallet Management</h1>
        <p className="disclaimer">
          <FiShield className="icon" /> <strong>Important:</strong> This platform never holds your funds.
          We only facilitate P2P transactions between connected wallets.
        </p>
      </div>

      <div className="wallet-tabs">
        <button
          className={`tab-btn ${activeTab === 'crypto' ? 'active' : ''}`}
          onClick={() => setActiveTab('crypto')}
        >
          Cryptocurrencies
        </button>
        <button
          className={`tab-btn ${activeTab === 'fiat' ? 'active' : ''}`}
          onClick={() => setActiveTab('fiat')}
        >
          Fiat Currencies
        </button>
      </div>

      {activeTab === 'crypto' ? (
        <div className="crypto-wallets">
          <div className="section-header">
            <h2>Connected Crypto Wallets</h2>
            <button
              className="connect-btn"
              onClick={() => setShowConnectModal(true)}
            >
              <FiLink /> Connect New Wallet
            </button>
          </div>

          {connectedWallets.length > 0 ? (
            <div className="wallet-grid">
              {connectedWallets.map(wallet => (
                <div key={wallet.id} className="wallet-card">
                  <div className="wallet-header">
                    {getCurrencyIcon(wallet.currency)}
                    <h3>{wallet.name}</h3>
                    <span className="balance">
                      {wallet.address.toLowerCase() === walletAddress?.toLowerCase() ? 
                        parseFloat(ethers.utils.formatEther(balance || '0')).toFixed(4) : 
                        wallet.balance} {wallet.currency}
                    </span>
                  </div>

                  <div className="wallet-meta">
                    <span className="network-badge">
                      {getNetworkName(wallet.chainId)}
                    </span>
                  </div>

                  <div className="wallet-address">
                    <span>{wallet.address.substring(0, 12)}...{wallet.address.substring(wallet.address.length - 4)}</span>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(wallet.address)}
                    >
                      <FiCopy />
                    </button>
                  </div>

                  <div className="wallet-actions">
                    <button 
                      className="action-btn send"
                      onClick={() => alert('Send functionality would be implemented here')}
                    >
                      <FiArrowUp /> Send
                    </button>
                    <button 
                      className="action-btn receive"
                      onClick={() => alert('Receive functionality would be implemented here')}
                    >
                      <FiArrowDown /> Receive
                    </button>
                    <button
                      className="action-btn disconnect"
                      onClick={() => handleDisconnect(wallet.id, 'crypto')}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiCreditCard className="empty-icon" />
              <h3>No crypto wallets connected</h3>
              <p>Connect your external crypto wallets to start trading</p>
              <button
                className="connect-btn primary"
                onClick={() => setShowConnectModal(true)}
              >
                <FiLink /> Connect Wallet
              </button>
            </div>
          )}

          <div className="instructions">
            <h3>How P2P Transactions Work</h3>
            <ol>
              <li>Connect your external wallet (we never hold your funds)</li>
              <li>Find a trading partner in our P2P marketplace</li>
              <li>Agree on terms and exchange wallet addresses</li>
              <li>Send/receive funds directly between wallets</li>
              <li>Mark transaction as complete in our escrow system</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="fiat-wallets">
          <div className="section-header">
            <h2>Connected Fiat Accounts</h2>
            <button
              className="connect-btn"
              onClick={connectFiatAccount}
            >
              <FiLink /> Connect New Account
            </button>
          </div>

          {fiatAccounts.filter(w => w.connected).length > 0 ? (
            <div className="wallet-grid">
              {fiatAccounts.filter(w => w.connected).map(wallet => (
                <div key={wallet.id} className="wallet-card">
                  <div className="wallet-header">
                    {getCurrencyIcon(wallet.currency)}
                    <h3>{wallet.name}</h3>
                    <span className="balance">{wallet.currency} {wallet.balance.toFixed(2)}</span>
                  </div>

                  <div className="wallet-details">
                    <span>•••• •••• •••• {wallet.last4}</span>
                  </div>

                  <div className="wallet-actions">
                    <button className="action-btn send">
                      <FiArrowUp /> Send
                    </button>
                    <button className="action-btn receive">
                      <FiArrowDown /> Receive
                    </button>
                    <button
                      className="action-btn disconnect"
                      onClick={() => handleDisconnect(wallet.id, 'fiat')}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiCreditCard className="empty-icon" />
              <h3>No fiat accounts connected</h3>
              <p>Connect your bank or payment method to start trading</p>
              <button
                className="connect-btn primary"
                onClick={connectFiatAccount}
              >
                <FiLink /> Connect Account
              </button>
            </div>
          )}

          <div className="instructions">
            <h3>Fiat P2P Transactions</h3>
            <ol>
              <li>Connect your bank account or payment method</li>
              <li>We verify ownership but never hold funds</li>
              <li>Find a trading partner in our P2P marketplace</li>
              <li>Agree on terms and exchange payment details</li>
              <li>Send/receive funds directly between accounts</li>
            </ol>
          </div>
        </div>
      )}

      {showConnectModal && (
        <ConnectWalletModal
          onClose={() => setShowConnectModal(false)}
          onConnect={handleConnectWallet}
        />
      )}
    </div>
  );
};

export default WalletPage;