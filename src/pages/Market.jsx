import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaRegCheckCircle,
  FaStar,
  FaUserShield,
  FaShieldAlt,
  FaExchangeAlt
} from "react-icons/fa";
import { IoMdFlash, IoMdTime } from "react-icons/io";
import { MdOutlineArrowForwardIos, MdPayment, MdLocationOn } from "react-icons/md";
import { RiExchangeDollarFill } from "react-icons/ri";
import debounce from "lodash.debounce";
import "../styles/market.css";

const API_BASE_URL = "http://localhost:8000/crypto";

// Default trader object to prevent undefined errors
const DEFAULT_TRADER = {
  id: '',
  name: '',
  online: false,
  lastActive: '',
  kycVerified: false,
  premium: false,
  rating: 0,
  trades: 0,
  completionRate: 0,
  paymentMethod: '',
  location: '',
  terms: '',
  price: '0',
  priceIncrease: '',
  minLimit: '0',
  maxLimit: '0',
  cryptoAmount: '0',
  crypto: 'ETH'
};

// API service for real backend calls
const TradingService = {
  fetchTraders: async (filters) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams(filters).toString();

      const response = await fetch(`${API_BASE_URL}/trade-offers/?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching traders:", error);
      return []; // Return empty array instead of throwing error
    }
  },

  fetchTraderDetails: async (traderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/trader/${traderId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || DEFAULT_TRADER;
    } catch (error) {
      console.error("Error fetching trader details:", error);
      return DEFAULT_TRADER;
    }
  }
};

const Market = () => {
  const [filters, setFilters] = useState({
    tradeType: "Sell",
    crypto: "ETH",
    paymentMethod: "Any",
    location: "Kenya",
    sortBy: "bestPrice"
  });
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Safely parse price string to number
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    try {
      return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
    } catch {
      return 0;
    }
  };

  // Fetch traders with debouncing
  const fetchTraders = useCallback(
    debounce(async (filters) => {
      try {
        setLoading(true);
        setError(null);
        const data = await TradingService.fetchTraders(filters);
        setTraders(data);
      } catch (err) {
        setError("Failed to load traders. Please try again later.");
        console.error("Error fetching traders:", err);
        setTraders([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchTraders(filters);
    return () => fetchTraders.cancel(); // Cancel debounce on unmount
  }, [filters, fetchTraders]);

  // Filter traders based on search query
  const filteredTraders = useMemo(() => {
    if (!searchQuery) return traders;
    const query = searchQuery.toLowerCase();
    return traders.filter(trader => {
      const safeTrader = { ...DEFAULT_TRADER, ...trader };
      return (
        safeTrader.name?.toLowerCase().includes(query) ||
        safeTrader.paymentMethod?.toLowerCase().includes(query)
      );
    });
  }, [traders, searchQuery]);

  // Sort traders based on selected criteria
  const sortedTraders = useMemo(() => {
    const tradersCopy = [...filteredTraders];
    switch (filters.sortBy) {
      case "bestPrice":
        return tradersCopy.sort((a, b) => {
          const safeA = { ...DEFAULT_TRADER, ...a };
          const safeB = { ...DEFAULT_TRADER, ...b };
          const priceA = parsePrice(safeA.price);
          const priceB = parsePrice(safeB.price);
          return filters.tradeType === "Buy" ? priceA - priceB : priceB - priceA;
        });
      case "mostTrades":
        return tradersCopy.sort((a, b) => {
          const safeA = { ...DEFAULT_TRADER, ...a };
          const safeB = { ...DEFAULT_TRADER, ...b };
          return (safeB.trades || 0) - (safeA.trades || 0);
        });
      case "highestRating":
        return tradersCopy.sort((a, b) => {
          const safeA = { ...DEFAULT_TRADER, ...a };
          const safeB = { ...DEFAULT_TRADER, ...b };
          return (safeB.rating || 0) - (safeA.rating || 0);
        });
      case "newest":
        return tradersCopy.sort((a, b) => {
          const safeA = { ...DEFAULT_TRADER, ...a };
          const safeB = { ...DEFAULT_TRADER, ...b };
          const dateA = safeA.createdAt ? new Date(safeA.createdAt) : new Date(0);
          const dateB = safeB.createdAt ? new Date(safeB.createdAt) : new Date(0);
          return dateB - dateA;
        });
      default:
        return tradersCopy;
    }
  }, [filteredTraders, filters.sortBy, filters.tradeType]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTradeClick = (trader) => {
    const safeTrader = { ...DEFAULT_TRADER, ...trader };
    navigate("/amount", {
      state: {
        trader: safeTrader,
        tradeType: filters.tradeType,
        crypto: filters.crypto
      }
    });
  };

  const renderRatingStars = (rating) => {
    const safeRating = typeof rating === 'number' ? rating : 0;
    const stars = [];
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star full-star" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="star half-star" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="star empty-star" />);
    }

    return stars;
  };

  // Safely extract crypto symbol
  const getCryptoSymbol = (crypto) => {
    if (!crypto) return 'ETH';
    if (typeof crypto !== 'string') return 'ETH';
    const parts = crypto.split(" - ");
    return parts.length > 1 ? parts[1] : parts[0];
  };

  return (
    <div className="market-container">
      <div className="market-header">
        <h1>P2P Crypto Trading Marketplace</h1>
        <p className="market-subtitle">
          Trade directly with other users with escrow protection
        </p>
      </div>

      <div className="filters-container">
        <div className="filters">
          <div className="filter-group">
            <label>I want to</label>
            <div className="filter-toggle">
              <button
                className={`toggle-btn ${filters.tradeType === "Buy" ? "active" : ""}`}
                onClick={() => handleFilterChange("tradeType", "Buy")}
              >
                Buy
              </button>
              <button
                className={`toggle-btn ${filters.tradeType === "Sell" ? "active" : ""}`}
                onClick={() => handleFilterChange("tradeType", "Sell")}
              >
                Sell
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label>Cryptocurrency</label>
            <select
              value={filters.crypto}
              onChange={(e) => handleFilterChange("crypto", e.target.value)}
              className="market-select"
            >
              <option value="ETH">Ethereum (ETH)</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="BNB">Binance Coin (BNB)</option>
              <option value="SOL">Solana (SOL)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
              className="market-select"
            >
              <option value="Any">Any Payment Method</option>
              <option value="M-PESA">M-PESA</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="PayPal">PayPal</option>
              <option value="Cash">Cash</option>
              <option value="Wise">Wise</option>
              <option value="Revolut">Revolut</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="market-select"
            >
              <option value="Kenya">🇰🇪 Kenya</option>
              <option value="USA">🇺🇸 United States</option>
              <option value="UK">🇬🇧 United Kingdom</option>
              <option value="Germany">🇩🇪 Germany</option>
              <option value="Nigeria">🇳🇬 Nigeria</option>
              <option value="South Africa">🇿🇦 South Africa</option>
            </select>
          </div>
        </div>

        <div className="search-sort-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search traders or payment methods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="sort-options">
            <label>Sort by:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="sort-select"
            >
              <option value="bestPrice">Best Price</option>
              <option value="mostTrades">Most Trades</option>
              <option value="highestRating">Highest Rating</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading traders...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchTraders(filters)}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="market-content">
          <div className="market-stats">
            <p>
              Showing {sortedTraders.length} {filters.tradeType.toLowerCase()} offers for {filters.crypto.split(" - ")[0]} in {filters.location}
            </p>
          </div>

          <div className="trader-list">
            {sortedTraders.length > 0 ? (
              sortedTraders.map((trader) => {
                const safeTrader = { ...DEFAULT_TRADER, ...trader };
                const cryptoSymbol = getCryptoSymbol(safeTrader.crypto);

                return (
                  <div key={safeTrader.id || Math.random().toString(36).substr(2, 9)} className={`trader-card ${safeTrader.premium ? "premium" : ""}`}>
                    <div className="trader-main-info">
                      <div className="trader-avatar">
                        <div className={`avatar-market ${safeTrader.online ? "online" : "offline"}`}>
                          {safeTrader.name?.charAt(0) || '?'}
                        </div>
                        <div className="trader-status">
                          {safeTrader.online ? (
                            <span className="online-status">Online</span>
                          ) : (
                            <span className="offline-status">Offline ({safeTrader.lastActive || 'unknown'})</span>
                          )}
                        </div>
                      </div>

                      <div className="trader-details">
                        <div className="trader-name-verification">
                          <h3>
                            <Link to={`/profile/${safeTrader.id}`} className="trader-link">
                              {safeTrader.name || 'Anonymous'}
                            </Link>
                            {safeTrader.kycVerified && <FaUserShield className="kyc-icon" title="KYC Verified" />}
                            {safeTrader.premium && <FaShieldAlt className="premium-icon" title="Premium Trader" />}
                          </h3>
                          <div className="trader-rating">
                            <div className="stars">{renderRatingStars(safeTrader.rating)}</div>
                            <span className="rating-value">{typeof safeTrader.rating === 'number' ? safeTrader.rating.toFixed(2) : '0.00'}</span>
                          </div>
                        </div>

                        <div className="trader-stats">
                          <div className="stat-item">
                            <IoMdFlash className="stat-icon" />
                            <span>{(safeTrader.trades || 0).toLocaleString()} trades</span>
                          </div>
                          <div className="stat-item">
                            <FaExchangeAlt className="stat-icon" />
                            <span>{safeTrader.completionRate || 0}% completion</span>
                          </div>
                          <div className="stat-item">
                            <MdPayment className="stat-icon" />
                            <span>{safeTrader.paymentMethod || 'Unknown'}</span>
                          </div>
                          <div className="stat-item">
                            <MdLocationOn className="stat-icon" />
                            <span>{safeTrader.location || 'Unknown'}</span>
                          </div>
                        </div>

                        <div className="trader-terms">
                          <p>
                            <IoMdTime className="terms-icon" />
                            {safeTrader.terms || 'No terms specified'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="trader-offer">
                      <div className="price-info">
                        <div className="price-section">
                          <p className="price">{safeTrader.price || '0'}</p>
                          <p className="price-increase">
                            {safeTrader.priceIncrease?.includes("above") ? (
                              <span className="above-market">
                                <RiExchangeDollarFill /> {safeTrader.priceIncrease || ''}
                              </span>
                            ) : (
                              <span className="below-market">
                                <RiExchangeDollarFill /> {safeTrader.priceIncrease || ''}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="limit-info">
                          <p className="limits">
                            <span>Min:</span> {safeTrader.minLimit || '0'}
                          </p>
                          <p className="limits">
                            <span>Max:</span> {safeTrader.maxLimit || '0'}
                          </p>
                          <p className="crypto-amount">
                            <span>Available:</span> {safeTrader.cryptoAmount || '0'} {cryptoSymbol}
                          </p>
                        </div>
                      </div>

                      <button
                        className={`trade-button ${filters.tradeType.toLowerCase()}`}
                        onClick={() => handleTradeClick(safeTrader)}
                      >
                        {filters.tradeType} {cryptoSymbol}
                        <MdOutlineArrowForwardIos className="button-arrow" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-results">
                <img src="https://i.ibb.co/XcQMF4q/9170826.jpg" alt="No results" />
                <h3>No traders found for your selection</h3>
                <p>Try adjusting your filters or check back later</p>
              </div>
            )}
          </div>
        </div>
      )}


      <div className="how-to-buy-section">
        <div className="buy-crypto-header">
          <h2>How to buy Crypto on CheetahX</h2>
          <p className="subtitle">Fast, secure, and beginner-friendly in just 3 simple steps</p>
        </div>

        <div className="steps-roadmap">
          <div className="step-track"></div>

          <div className="step-card" data-aos="fade-up" data-aos-delay="100">
            <div className="step-icon">
              <svg className="icon-circle" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" />
                <path d="M70,35 L45,60 L30,45" />
              </svg>
            </div>
            <div className="step-content">
              <h3>Create Account</h3>
              <p>Instant sign-up takes 30 seconds. Get your free crypto wallet immediately after registration.</p>
            </div>
            <div className="step-arrow">
              <svg viewBox="0 0 24 24">
                <path d="M8 4L16 12L8 20" />
              </svg>
            </div>
          </div>

          <div className="step-card" data-aos="fade-up" data-aos-delay="200">
            <div className="step-icon">
              <svg className="icon-circle" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" />
                <path d="M30,30 L70,30 L70,45 L45,45 L45,70 L30,70 Z" />
              </svg>
            </div>
            <div className="step-content">
              <h3>Find Best Offers</h3>
              <p>Use our smart filters to discover perfect deals from trusted sellers worldwide.</p>
            </div>
            <div className="step-arrow">
              <svg viewBox="0 0 24 24">
                <path d="M8 4L16 12L8 20" />
              </svg>
            </div>
          </div>

          <div className="step-card" data-aos="fade-up" data-aos-delay="300">
            <div className="step-icon">
              <svg className="icon-circle" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" />
                <path d="M30,50 L45,35 L70,60 L70,70 L60,70 L35,45 L30,50 Z" />
              </svg>
            </div>
            <div className="step-content">
              <h3>Trade Securely</h3>
              <p>Start trading with escrow protection and live chat support for smooth transactions.</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <button className="glow-button">
            Start Trading Now
            <svg viewBox="0 0 24 24">
              <path d="M5 12H19M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
};

export default Market;