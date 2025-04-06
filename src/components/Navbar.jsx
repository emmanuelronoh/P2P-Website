import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";
import { 
  FaMoon, 
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
  FaGlobe
} from "react-icons/fa";
import { IoMdChatbubbles } from "react-icons/io";
import { GiTrade } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/cheetah-logo.png";
import "../styles/navbar.css";

// Advertisement component (can be controlled by admin)
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  
  // Check auth status
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
    
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setWalletAddress(storedAddress);
      fetchBalance(storedAddress);
    }
    
    // Simulate fetching unread messages
    setUnreadMessages(Math.floor(Math.random() * 5));
    
    // Scroll event listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);
  
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
  
  const handleWalletConnected = (address) => {
    setWalletAddress(address);
    localStorage.setItem("walletAddress", address);
    fetchBalance(address);
  };
  
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      
      await axios.post(
        "http://127.0.0.1:8000/api/auth/logout/",
        { refresh_token: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("walletAddress");
      
      setIsLoggedIn(false);
      setWalletAddress(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const sendCrypto = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }
    
    navigate("/send-crypto");
  };
  
  // Menu items configuration
  const marketItems = [
    { label: "Crypto Pairs", path: "/market/crypto", icon: FaCoins },
    { label: "Stocks", path: "/market/stocks", icon: FaChartLine },
    { label: "Forex", path: "/market/forex", icon: FaGlobe },
    { label: "P2P Trading", path: "/market/p2p", icon: GiTrade }
  ];
  
  const helpItems = [
    { label: "FAQ", path: "/faq", icon: FaQuestionCircle },
    { label: "Tutorials", path: "/tutorials", icon: FaQuestionCircle },
    { label: "Contact Support", path: "/support", icon: FaHeadset }
  ];
  
  const accountItems = isLoggedIn
    ? [
        { label: "Dashboard", path: "/dashboard", icon: FaChartLine },
        { label: "Wallet", path: "/wallet", icon: FaWallet },
        { label: "Profile", path: `/profile/${userId}`, icon: FaUserCircle },
        { label: "Messages", path: "/messages", icon: IoMdChatbubbles },
        { label: "Logout", path: "#", icon: FaUserCircle, action: handleLogout }
      ]
    : [
        { label: "Sign In", path: "/login", icon: FaUserCircle },
        { label: "Register", path: "/register", icon: FaUserCircle }
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
              <span className="logo-text">Cheetah P2P</span>
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
            
            {isLoggedIn && (
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
            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <div className="notification-icon">
                  <FaBell />
                  {notifications > 0 && (
                    <motion.span 
                      className="notification-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={notifications}
                    >
                      {notifications}
                    </motion.span>
                  )}
                </div>
                
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
                    onClick={() => document.getElementById("wallet-connect").click()}
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
        
        {/* Wallet connect component (hidden) */}
        <ConnectWallet 
          id="wallet-connect"
          onWalletConnected={handleWalletConnected}
          style={{ display: "none" }}
        />
      </header>
    </>
  );
};

// Wallet connect component
const ConnectWallet = ({ onWalletConnected, id, style }) => {
  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal();
      const provider = await web3Modal.connect();
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const address = await signer.getAddress();
      
      onWalletConnected(address);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };
  
  return (
    <button id={id} style={style} onClick={connectWallet}>
      Connect Wallet
    </button>
  );
};

export default Navbar;