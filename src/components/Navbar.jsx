import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ethers } from 'ethers';
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { useAuth } from '../contexts/AuthContext';
import {
  FaMoon,
  FaUserPlus,
  FaSignInAlt,
  FaSun,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaBell,
  FaUserCircle,
  FaWallet,
  FaExchangeAlt,
  FaQuestionCircle,
  FaHeadset,
  FaChartLine,
  FaCoins,
  FaGlobe,
  FaSignOutAlt
} from "react-icons/fa";
import { IoMdChatbubbles } from "react-icons/io";
import { GiTrade } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/cheetah-logo.png";
import "../styles/navbar.css";
import ConnectWalletModal from './WalletConnectModal';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};


const AdvertisementBar = () => {
  const [ads, setAds] = useState([]);
  const [currentAd, setCurrentAd] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('https://cheetahx.onrender.com/api/auth/advertisements/'); // Your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch advertisements');
        }
        const data = await response.json();
        setAds(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length > 0) {
      const interval = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % ads.length);
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [ads]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;
  if (isLoading) return <div className="advertisement-bar">Loading ads...</div>;
  if (error) return <div className="advertisement-bar">Error: {error}</div>;
  if (ads.length === 0) return null;

  return (
    <div className="advertisement-bar">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="ad-content"
        >
          {ads[currentAd].text}
        </motion.div>
      </AnimatePresence>
      <button 
        className="ad-close-btn" 
        onClick={handleClose}
        aria-label="Close advertisement"
      >
        × 
      </button>
    </div>
  );
};

const DropdownMenu = ({ title, items, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { width } = useWindowSize();
  const isMobile = width < 992;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const location = useLocation();
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  if (isMobile) {
    return (
      <div className="mobile-dropdown-container" ref={dropdownRef}>
        <button
          className="mobile-dropdown-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleDropdown();
          }}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {Icon && <Icon className="mobile-dropdown-icon" />}
          <span>{title}</span>
          <FaChevronDown className={`mobile-dropdown-arrow ${isOpen ? "rotate" : ""}`} />
        </button>

        <div
          className="mobile-dropdown-content"
          style={{
            maxHeight: isOpen ? `${items.length * 50}px` : '0',
            transition: 'max-height 0.3s ease',
            overflow: 'hidden'
          }}
        >
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="mobile-dropdown-item"
              onClick={() => {
                setIsOpen(false);
                if (item.action) item.action();
              }}
              aria-label={item.label}
            >
              {item.icon && <item.icon className="mobile-dropdown-item-icon" />}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="desktop-dropdown-container" ref={dropdownRef}>
      <button
        className="desktop-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {Icon && <Icon className="desktop-dropdown-icon" />}
        {title}
        <FaChevronDown className={`desktop-dropdown-arrow ${isOpen ? "rotate" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="desktop-dropdown-content"
          >
            {items.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="desktop-dropdown-item"
                onClick={() => {
                  setIsOpen(false);
                  if (item.action) item.action();
                }}
                aria-label={item.label}
              >
                {item.icon && <item.icon className="desktop-dropdown-item-icon" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = ({ theme, toggleTheme }) => {
  const { width } = useWindowSize();
  const isMobile = width < 992;

  const {
    user,
    isAuthenticated,
    logout,
    loading: authLoading
  } = useAuth();

  const [walletAddress, setWalletAddress] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);

  // In Navbar.jsx, update the handleWalletConnect function:
  const handleWalletConnect = useCallback((connectionData) => {
    const { walletType, address, provider, chainId } = connectionData;

    if (!address) return;

    setWalletAddress(address);
    localStorage.setItem("walletAddress", address);

    if (provider) {
      setProvider(provider);
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      setSigner(signer);
      setChainId(chainId);

      // Set up event listeners
      provider.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          handleWalletDisconnect();
        } else {
          setWalletAddress(accounts[0]);
          localStorage.setItem("walletAddress", accounts[0]);
        }
      });

      provider.on('chainChanged', (chainId) => {
        setChainId(parseInt(chainId, 16));
        window.location.reload();
      });

      provider.on('disconnect', () => {
        handleWalletDisconnect();
      });
    }

    setShowWalletModal(false);
  }, []);

  const handleWalletDisconnect = () => {
    setWalletAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    localStorage.removeItem("walletAddress");
    setBalance("0.00");
  };

  const fetchBalance = async (address) => {
    if (!provider || !address) return;

    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const balance = await ethersProvider.getBalance(address);
      setBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("0.00");
    }
  };

  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [logout, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const marketItems = [
    { label: "Become a Vendor", path: "/become-vendor", icon: FaGlobe },
  ];

  const helpItems = [
    { label: "FAQ", path: "/faq", icon: FaQuestionCircle },
    { label: "Tutorials", path: "/tutorials", icon: FaQuestionCircle },
    { label: "Contact Support", path: "/support", icon: FaHeadset }
  ];

  const accountItems = isAuthenticated
    ? [
      { label: "Dashboard", path: "/dashboard", icon: FaChartLine },
      { label: "Wallet", path: "/wallet", icon: FaWallet },
      { label: "Profile", path: `/profile/${user?.id}`, icon: FaUserCircle },
      {
        label: `Messages ${unreadMessages > 0 ? `(${unreadMessages})` : ""}`,
        path: "/messages",
        icon: IoMdChatbubbles
      },
      { label: "Logout", path: "#", icon: FaSignOutAlt, action: handleLogout }
    ]
    : [
      { label: "Sign In", path: "/login", icon: FaSignInAlt },
      { label: "Register", path: "/register", icon: FaUserPlus }
    ];

  const WalletInfo = () => {
    const [localWalletAddress, setLocalWalletAddress] = useState(
      localStorage.getItem("walletAddress") || null
    );

    useEffect(() => {
      const handleStorageChange = () => {
        setLocalWalletAddress(localStorage.getItem("walletAddress"));
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    if (!localWalletAddress && !walletAddress) {
      return (
        <button
          className="connect-wallet-btn"
          onClick={() => setShowWalletModal(true)}
        >
          <FaWallet className="wallet-icon" />
          {!isMobile ? "Connect Wallet" : "Connect"}
        </button>
      );
    }

    const displayAddress = walletAddress || localWalletAddress;

    return (
      <div className="wallet-connected-container">
        {!isMobile && (
          <>
            <div className="network-indicator">
              {chainId === 1 ? (
                <span className="mainnet">Mainnet</span>
              ) : chainId === 5 ? (
                <span className="testnet">Goerli</span>
              ) : chainId === 56 ? (
                <span className="bsc">BSC</span>
              ) : chainId ? (
                <span className="custom-chain">Chain {chainId}</span>
              ) : (
                <span className="unknown-network">Unknown</span>
              )}
            </div>
            <div className="wallet-balance" onClick={() => navigate('/wallet')}>
              {parseFloat(balance).toFixed(4)} ETH
            </div>
          </>
        )}

        <div className="wallet-address-dropdown">
          <button
            className="wallet-address-btn"
            onClick={() => navigate('/wallet')}
            aria-label="Wallet address"
          >
            <FaWallet className="wallet-icon" />
            <span className="address-short">
              {`${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`}
            </span>
            {!isMobile && <FaChevronDown className="dropdown-chevron" />}
          </button>

          {!isMobile && (
            <div className="wallet-dropdown-menu">
              <div className="wallet-dropdown-header">
                <span className="full-address" title={walletAddress}>
                  {walletAddress}
                </span>
                <span className="network-badge">
                  {chainId === 1 ? 'Mainnet' :
                    chainId === 5 ? 'Goerli' :
                      chainId === 56 ? 'BSC' :
                        chainId ? `Chain ${chainId}` : 'Unknown'}
                </span>
              </div>
              <button
                className="wallet-dropdown-item"
                onClick={() => navigate('/wallet')}
              >
                <FaWallet /> Wallet Dashboard
              </button>
              <button
                className="wallet-dropdown-item"
                onClick={() => navigate('/dashboard')}
              >
                <FaExchangeAlt /> Transactions
              </button>
              <button
                className="wallet-dropdown-item disconnect"
                onClick={handleWalletDisconnect}
              >
                <FaSignOutAlt /> Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <AdvertisementBar />

      <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <motion.div
            className="logo-container"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/" className="no-hover-line">
              <img src={logo} alt="Cheetah P2P Logo" className="logo" />
              <span className="logo-text">CHEETAH P2P</span>
            </Link>
          </motion.div>

          {!isMobile ? (
            <>
              <nav className="nav-links">
                <DropdownMenu title="Market" items={marketItems} icon={FaChartLine} />

                {isAuthenticated && (
                  <>
                    <Link to="/market" className="nav-link">
                      <FaExchangeAlt className="nav-icon" />
                      Trade
                    </Link>
                    <Link to="/wallet" className="nav-link">
                      <FaWallet className="nav-icon" />
                      Wallet
                    </Link>
                  </>
                )}

                <DropdownMenu title="Help" items={helpItems} icon={FaQuestionCircle} />
              </nav>

              <div className="user-actions">
                {isAuthenticated ? (
                  <>
                    <button
                      className="notification-button"
                      onClick={() => navigate('/notifications')}
                    >
                      <FaBell />
                    </button>

                    <div
                      className="message-icon"
                      onClick={() => navigate("/messages")}
                    >
                      <IoMdChatbubbles />
                      {unreadMessages > 0 && (
                        <span className="message-badge">{unreadMessages}</span>
                      )}
                    </div>

                    <WalletInfo />

                    <DropdownMenu
                      title={<FaUserCircle className="profile-icon" />}
                      items={accountItems}
                    />
                  </>
                ) : (
                  <>
                    <Link to="/login" className="auth-btn login-btn">
                      Sign In
                    </Link>
                    <Link to="/register" className="auth-btn register-btn">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                className="mobile-menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <FaTimes /> : <FaBars />}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <motion.div
                      className="mobile-menu-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setMenuOpen(false)}
                    />

                    <motion.div
                      className="mobile-menu"
                      initial={{ x: '100%' }}
                      animate={{ x: menuOpen ? 0 : '100%' }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'tween' }}
                    >
                      <div className="mobile-menu-header">
                        {isAuthenticated && walletAddress && (
                          <div className="mobile-wallet-info">
                            <span className="mobile-wallet-balance">{balance} ETH</span>
                            <span className="mobile-wallet-address">
                              {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mobile-menu-content">
                        <DropdownMenu title="Market" items={marketItems} icon={FaChartLine} />

                        {isAuthenticated && (
                          <>
                            <Link
                              to="/market"
                              className="mobile-nav-link"
                              onClick={() => setMenuOpen(false)}
                            >
                              <FaExchangeAlt className="nav-icon" />
                              Trade
                            </Link>
                            <Link
                              to="/wallet"
                              className="mobile-nav-link"
                              onClick={() => setMenuOpen(false)}
                            >
                              <FaWallet className="nav-icon" />
                              Wallet
                            </Link>
                          </>
                        )}

                        <DropdownMenu title="Help" items={helpItems} icon={FaQuestionCircle} />

                        {isAuthenticated && (
                          <DropdownMenu
                            title="Account"
                            items={accountItems}
                            icon={FaUserCircle}
                          />
                        )}
                      </div>

                      <div className="mobile-menu-footer">
                        <WalletInfo />


                        {!isAuthenticated && (
                          <div className="mobile-auth-buttons">
                            <Link
                              to="/login"
                              className="auth-btn mobile-login-btn"
                              onClick={() => setMenuOpen(false)}
                            >
                              Sign In
                            </Link>
                            <Link
                              to="/register"
                              className="auth-btn mobile-register-btn"
                              onClick={() => setMenuOpen(false)}
                            >
                              Register
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </header>

      {showWalletModal && (
        <ConnectWalletModal
          onClose={() => setShowWalletModal(false)}
          onConnect={handleWalletConnect}
        />
      )}
    </>
  );
};

export default Navbar;
