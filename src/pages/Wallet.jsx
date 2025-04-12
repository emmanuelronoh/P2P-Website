import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiArrowUp, FiArrowDown, FiLink, FiCopy, FiShield } from 'react-icons/fi';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiLitecoin, SiDogecoin, SiTether } from 'react-icons/si';
import "../styles/wallet.css"

const WalletPage = () => {
  const [activeTab, setActiveTab] = useState('crypto');
  const [connectedWallets, setConnectedWallets] = useState([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [walletToConnect, setWalletToConnect] = useState('');

  // Mock data - in real app this would come from API
  const cryptoWallets = [
    { id: 1, currency: 'BTC', name: 'Bitcoin', balance: 0.42, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', connected: true },
    { id: 2, currency: 'ETH', name: 'Ethereum', balance: 1.8, address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', connected: true },
    { id: 3, currency: 'USDT', name: 'Tether', balance: 1500, address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', connected: true },
  ];

  const fiatWallets = [
    { id: 1, currency: 'USD', name: 'Bank of America', last4: '4582', balance: 1250.42, connected: true },
    { id: 2, currency: 'EUR', name: 'Revolut', last4: '7821', balance: 850.00, connected: false },
  ];

  const connectWallet = (walletType) => {
    setWalletToConnect(walletType);
    setShowConnectModal(true);
    // In real app, this would trigger wallet connection flow
  };

  const handleDisconnect = (walletId, type) => {
    // In real app, this would call API to disconnect
    alert(`Disconnected wallet ${walletId} (${type})`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h1><FiCreditCard
          className="icon" /> Wallet Management</h1>
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
              onClick={() => connectWallet('crypto')}
            >
              <FiLink /> Connect New Wallet
            </button>
          </div>

          {cryptoWallets.filter(w => w.connected).length > 0 ? (
            <div className="wallet-grid">
              {cryptoWallets.filter(w => w.connected).map(wallet => (
                <div key={wallet.id} className="wallet-card">
                  <div className="wallet-header">
                    {wallet.currency === 'BTC' && <FaBitcoin className="currency-icon btc" />}
                    {wallet.currency === 'ETH' && <FaEthereum className="currency-icon eth" />}
                    {wallet.currency === 'USDT' && <SiTether className="currency-icon USDT" />}
                    <h3>{wallet.name}</h3>
                    <span className="balance">{wallet.balance} {wallet.currency}</span>
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
                    <button className="action-btn send">
                      <FiArrowUp /> Send
                    </button>
                    <button className="action-btn receive">
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
                onClick={() => connectWallet('crypto')}
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
              onClick={() => connectWallet('fiat')}
            >
              <FiLink /> Connect New Account
            </button>
          </div>

          {fiatWallets.filter(w => w.connected).length > 0 ? (
            <div className="wallet-grid">
              {fiatWallets.filter(w => w.connected).map(wallet => (
                <div key={wallet.id} className="wallet-card">
                  <div className="wallet-header">
                    <div className="currency-icon fiat">{wallet.currency}</div>
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
                onClick={() => connectWallet('fiat')}
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
        <div className="modal-overlay">
          <div className="connect-modal">
            <h2>Connect {walletToConnect === 'crypto' ? 'Crypto Wallet' : 'Fiat Account'}</h2>
            <p>
              Select how you want to connect your {walletToConnect === 'crypto' ?
                'cryptocurrency wallet' : 'bank or payment method'}:
            </p>

            {walletToConnect === 'crypto' ? (
              <div className="connection-options">
                <button className="option-btn">
                  <FaBitcoin className="icon" /> Bitcoin Wallet
                </button>
                <button className="option-btn">
                  <FaEthereum className="icon" /> Ethereum Wallet
                </button>
                <button className="option-btn">
                  <SiTether className="icon" /> Tether Wallet
                </button>
                <button className="option-btn">
                  <SiLitecoin className="icon" /> Litecoin Wallet
                </button>
                <button className="option-btn">
                  <SiDogecoin className="icon" /> Dogecoin Wallet
                </button>
              </div>
            ) : (
              <div className="connection-options">
                <button className="option-btn">Bank Account (ACH)</button>
                <button className="option-btn">Credit/Debit Card</button>
                <button className="option-btn">PayPal</button>
                <button className="option-btn">Revolut</button>
                <button className="option-btn">Wise</button>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowConnectModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;