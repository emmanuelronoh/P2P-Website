import React from "react";
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
import "../styles/navbar-p2p.css";
import TutorialModal from './TutorialModal';

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

const DropdownMenu = ({ title, items, icon: Icon, onMobileClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const [isHovering, setIsHovering] = useState(false);
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    // Enhanced mobile detection with debounce
    useEffect(() => {
        let timeoutId = null;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsMobile(window.innerWidth < 992);
            }, 100);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    // Improved click outside detection
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsHovering(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Enhanced toggle handler
    const handleToggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    // Improved item click handler
    const handleItemClick = useCallback(() => {
        setIsOpen(false);
        setIsHovering(false);
        if (isMobile && onMobileClose) onMobileClose();
    }, [isMobile, onMobileClose]);

    // Handle mouse enter for desktop
    const handleMouseEnter = useCallback(() => {
        if (!isMobile) {
            setIsOpen(true);
            setIsHovering(true);
        }
    }, [isMobile]);

    // Handle mouse leave for desktop with delay
    const handleMouseLeave = useCallback(() => {
        if (!isMobile) {
            setTimeout(() => {
                if (!isHovering) {
                    setIsOpen(false);
                }
            }, 300); // Small delay to allow moving to dropdown
        }
    }, [isMobile, isHovering]);

    // Track if mouse is over dropdown content
    const handleContentMouseEnter = useCallback(() => {
        if (!isMobile) {
            setIsHovering(true);
        }
    }, [isMobile]);

    const handleContentMouseLeave = useCallback(() => {
        if (!isMobile) {
            setIsHovering(false);
            setIsOpen(false);
        }
    }, [isMobile]);

    return (
        <div 
            className={`p2p-dropdown-container ${isOpen ? 'p2p-open' : ''}`} 
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className="p2p-dropdown-btn"
                onClick={handleToggle}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label={typeof title === 'string' ? title : 'Menu'}
            >
                {Icon && <Icon className="p2p-dropdown-icon" />}
                {typeof title === 'string' ? title : null}
                <FaChevronDown className={`p2p-dropdown-arrow ${isOpen ? "p2p-rotate" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="p2p-dropdown-content"
                        style={{ overflow: 'hidden' }}
                        onMouseEnter={handleContentMouseEnter}
                        onMouseLeave={handleContentMouseLeave}
                    >
                        <div className="p2p-dropdown-inner">
                            {items.map((item, index) => (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className="p2p-dropdown-item"
                                    onClick={() => {
                                        if (item.action) {
                                            item.action();
                                        }
                                        handleItemClick();
                                    }}
                                    aria-label={item.label}
                                >
                                    {item.icon && <item.icon className="p2p-dropdown-item-icon" />}
                                    <span className="p2p-dropdown-item-text">{item.label}</span>
                                </Link>
                            ))}
                        </div>
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

    const [unreadMessages, setUnreadMessages] = useState(0);
    const [notifications, setNotifications] = useState(3);
    const [menuOpen, setMenuOpen] = useState(false);
    const [balance, setBalance] = useState("0.00");
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [key, setKey] = useState(0);
    const [showTutorial, setShowTutorial] = useState(false);
    const navbarRef = useRef(null);

    useEffect(() => {
        setKey(prevKey => prevKey + 1);
    }, [isAuthenticated, location.pathname]);

    // Close menu when route changes
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

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

    const startTutorial = () => {
        setShowTutorial(true);
        setMenuOpen(false);
    };

    // Handle logout using context
    const handleLogout = useCallback(async () => {
        try {
            await logout();
            navigate("/");
            setMenuOpen(false);
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

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    // Menu items configuration
    const marketItems = [
        { label: "Stocks", path: "/market/stocks", icon: FaChartLine },
    ];

    const helpItems = [
        { label: "FAQ", path: "/cryptolisting", icon: FaQuestionCircle },
        { label: "Tutorials", path: "/tutorials-fiat", icon: FaQuestionCircle },
        { label: "Contact Support", path: "/support-fiat", icon: FaHeadset }
    ];

    const accountItems = isAuthenticated
        ? [
            { label: "Dashboard", path: "/dashboard-fiat", icon: FaChartLine },
            { label: "Profile", path: `/profile-fiat/${user?.id}`, icon: FaUserCircle },
            {
                label: `Messages ${unreadMessages > 0 ? `(${unreadMessages})` : ""}`,
                path: "/messages-p2p",
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

            <header className={`p2p-navbar ${isScrolled ? "p2p-scrolled" : ""} ${menuOpen ? "p2p-menu-open" : ""}`} ref={navbarRef}>
                <div className="p2p-navbar-container">
                    {/* Logo and mobile menu button */}
                    <div className="p2p-logo-mobile-container">
                        <motion.div
                            className="p2p-logo-container"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <Link to="/" className="p2p-no-hover-line">
                                <img src={logo} alt="Cheetah P2P Logo" className="p2p-logo" />
                                <span className="p2p-logo-text">CHEETAH P2P</span>
                            </Link>
                        </motion.div>

                        <button
                            className="p2p-mobile-menu-btn"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className={`p2p-nav-links ${menuOpen ? "p2p-open" : ""}`}>
                        <DropdownMenu
                            title="Market"
                            items={marketItems}
                            icon={FaChartLine}
                            onMobileClose={() => setMenuOpen(false)}
                        />

                        {isAuthenticated && (
                            <Link
                                to="/fiat-p2p"
                                className="p2p-nav-link"
                                onClick={() => setMenuOpen(false)}
                            >
                                <FaExchangeAlt className="p2p-nav-icon" />
                                <span className="p2p-nav-link-text">Trade</span>
                            </Link>
                        )}

                        <DropdownMenu
                            title="Help"
                            items={helpItems}
                            icon={FaQuestionCircle}
                            onMobileClose={() => setMenuOpen(false)}
                        />

                        {/* Mobile-only auth links */}
                        {!isAuthenticated && (
                            <div className="p2p-mobile-auth-links">
                                <Link
                                    to="/login"
                                    className="p2p-auth-btn p2p-login-btn p2p-mobile-auth-btn"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="p2p-auth-btn p2p-register-btn p2p-mobile-auth-btn"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* User actions */}
                    <div className={`p2p-user-actions ${menuOpen ? "p2p-open" : ""}`}>
                        {isAuthenticated ? (
                            <>
                                {/* Notifications */}
                                <button
                                    className="p2p-notification-button"
                                    onClick={() => {
                                        navigate('/notifications-p2p');
                                        setMenuOpen(false);
                                    }}
                                    aria-label="Notifications"
                                >
                                    <FaBell />
                                </button>

                                {/* Messages */}
                                <div
                                    className="p2p-message-icon"
                                    onClick={() => {
                                        navigate("/messages-p2p");
                                        setMenuOpen(false);
                                    }}
                                    aria-label="Messages"
                                >
                                    <IoMdChatbubbles />
                                    {unreadMessages > 0 && (
                                        <motion.span
                                            className="p2p-message-badge"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            key={unreadMessages}
                                        >
                                            {unreadMessages}
                                        </motion.span>
                                    )}
                                </div>

                                <button
                                    className="p2p-tutorial-btn"
                                    onClick={startTutorial}
                                >
                                    How It Works
                                </button>

                                {/* Profile dropdown */}
                                <DropdownMenu
                                    title={<FaUserCircle className="p2p-profile-icon" />}
                                    items={accountItems}
                                    onMobileClose={() => setMenuOpen(false)}
                                />
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="p2p-auth-btn p2p-login-btn p2p-desktop-auth-btn">
                                    Sign In
                                </Link>
                                <Link to="/register" className="p2p-auth-btn p2p-register-btn p2p-desktop-auth-btn">
                                    Register
                                </Link>
                            </>
                        )}

                        {/* Theme toggle */}
                        <button
                            className="p2p-theme-toggle"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {theme === "light" ? <FaMoon /> : <FaSun />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Overlay for mobile menu */}
            {menuOpen && (
                <div
                    className="p2p-mobile-menu-overlay"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <TutorialModal
                showTutorial={showTutorial}
                closeTutorial={() => setShowTutorial(false)}
            />
        </>
    );
};

export default Navbar;