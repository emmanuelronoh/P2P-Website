
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

// Advertisement component
const AdvertisementBar = () => {
  const ads = [
    "🔥 Limited Time Offer: 0% Trading Fees This Week!",
    "🚀 New Crypto Pairs Added: BTC/ETH, SOL/ADA",
    "💎 Exclusive VIP Benefits - Join Now!"
  ];

  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

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
          {ads[currentAd]}
        </motion.div>
      </AnimatePresence>
      <button className="ad-close-btn">×</button>
    </div>
  );
};

// Dropdown menu component
const DropdownMenu = ({ title, items, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const { user, isAuthenticated, loading: authLoading } = useAuth();


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button
        className="dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={!isMobile ? () => setIsOpen(true) : undefined}
      >
        {Icon && <Icon className="dropdown-icon" />}
        {title}
        <FaChevronDown className={`dropdown-arrow ${isOpen ? "rotate" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isMobile ? 0 : -10 }}
            transition={{ duration: 0.2 }}
            className="dropdown-content"
            onMouseLeave={!isMobile ? () => setIsOpen(false) : undefined}
          >
            {items.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="dropdown-item"
                onClick={() => {
                  setIsOpen(false);
                  if (item.action) item.action();
                }}
              >
                {item.icon && <item.icon className="dropdown-item-icon" />}
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Navbar component
const Navbar = ({ toggleTheme, theme }) => {
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
  const [key, setKey] = useState(0);


  const handleWalletConnect = async (walletType) => {
    try {
      let provider;

      switch (walletType) {
        case 'metamask':
          if (!window.ethereum) {
            window.open('https://metamask.io/download.html', '_blank');
            throw new Error('MetaMask not installed');
          }
          provider = window.ethereum;
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          break;

        case 'trustwallet':
          if (!window.ethereum) {
            throw new Error('Trust Wallet not detected');
          }
          provider = window.ethereum;
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          break;

        case 'binance':
          if (!window.BinanceChain) {
            throw new Error('Binance Chain Wallet not detected');
          }
          provider = window.BinanceChain;
          await window.BinanceChain.request({ method: 'eth_requestAccounts' });
          break;

        default:
          throw new Error('Unsupported wallet type');
      }

      const accounts = await provider.request({ method: 'eth_accounts' });
      const address = accounts[0];

      if (!address) throw new Error('No accounts found');

      handleWalletConnected(address);
      setShowWalletModal(false);

    } catch (error) {
      console.error('Wallet connection error:', error);
      // You can add error state and display it in the modal if you want
    }
  };

  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [isAuthenticated, location.pathname]);


  // Fetch user balance
  const fetchBalance = async (address) => {
    try {
      // Simulate balance fetch
      setTimeout(() => {
        setBalance((Math.random() * 10).toFixed(4));
      }, 1000);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Handle wallet connection
  const handleWalletConnected = useCallback((address) => {
    setWalletAddress(address);
    localStorage.setItem("walletAddress", address);
    fetchBalance(address);
  }, []);

  // Handle logout using context
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [logout, navigate]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // This will force a re-render when the route changes
  }, [location.pathname]);

  // Menu items configuration
  const marketItems = [
    { label: "Crypto Pairs", path: "/market/crypto", icon: FaCoins },
    { label: "Stocks", path: "/market/stocks", icon: FaChartLine },
    { label: "Become a Vendor", path: "/become-vendor", icon: FaGlobe },
    { label: "P2P Trading", path: "/p2p", icon: GiTrade }
  ];

  const helpItems = [
    { label: "FAQ", path: "/fiat-p2p", icon: FaQuestionCircle },
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


  return (
    <>
      <AdvertisementBar />

      <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          {/* Logo */}
          <motion.div
            className="logo-container"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/">
              <img src={logo} alt="Cheetah P2P Logo" className="logo" />
              <span className="logo-contain">Cheetah P2P</span>
            </Link>
          </motion.div>

          {/* Mobile menu button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Navigation */}
          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            <DropdownMenu
              title="Market"
              items={marketItems}
              icon={FaChartLine}
            />

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

            <DropdownMenu
              title="Help"
              items={helpItems}
              icon={FaQuestionCircle}
            />
          </nav>

          {/* User actions */}
          <div className="user-actions">
            {isAuthenticated ? (
              <>
                <button
                  className="notification-button"
                  onClick={() => navigate('/amount')}
                >
                  <FaBell />
                </button>


                {/* Messages */}
                <div
                  className="message-icon"
                  onClick={() => navigate("/messages")}
                >
                  <IoMdChatbubbles />
                  {unreadMessages > 0 && (
                    <motion.span
                      className="message-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={unreadMessages}
                    >
                      {unreadMessages}
                    </motion.span>
                  )}
                </div>

                {/* Wallet */}
                {walletAddress ? (
                  <div className="wallet-info">
                    <span className="wallet-balance">
                      {balance} ETH
                    </span>
                    <button
                      className="wallet-address"
                      onClick={() => navigate("/wallet")}
                    >
                      {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                    </button>
                  </div>
                ) : (

                  <button
                    className="connect-wallet-btn"
                    onClick={() => setShowWalletModal(true)}
                  >
                    <FaWallet />
                    Connect Wallet
                  </button>
                )}

                {/* Profile dropdown */}
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

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>
          </div>
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