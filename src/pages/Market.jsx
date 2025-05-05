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

const API_BASE_URL = "http://127.0.0.1:8000";

const DEFAULT_TRADER = {
  id: '',
  creator: {
    id: '',
    username: 'Anonymous',
    email: '',
    last_seen: null,
    verification_status: 'UNVERIFIED',
    trade_stats: {
      total_trades: 0,
      completion_rate: 0,
      avg_release_time: 0
    },
    wallet_address: null
  },
  trade_type: 'FIAT',
  transaction_type: 'BUY',
  crypto_currency: '', // Changed from 'XRP' to empty string to avoid overriding
  crypto_amount: 0, // Changed from string to number
  min_amount: 0, // Changed from string to number
  max_amount: 0, // Changed from string to number
  secondary_currency: '', // Changed from 'KES' to empty string
  secondary_amount: 0, // Changed from string to number
  rate: 0, // Changed from string to number
  payment_methods: [],
  time_window: 30,
  terms: 'No terms specified',
  status: 'PENDING',
  created_at: new Date().toISOString(),
  location: 'Unknown'
};

const TradingService = {
  fetchTraders: async (filters) => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      // Prepare strict filters for API
      const apiFilters = {
        transaction_type: filters.tradeType.toUpperCase(), // 'BUY' or 'SELL'
        crypto_currency: filters.crypto,
        ...(filters.paymentMethod !== 'Any' && {
          payment_methods: filters.paymentMethod
        }),
        ...(filters.location && {
          location: filters.location
        })
      };

      // Remove empty filters
      Object.keys(apiFilters).forEach(key => {
        if (apiFilters[key] === undefined || apiFilters[key] === '') {
          delete apiFilters[key];
        }
      });

      const queryParams = new URLSearchParams(apiFilters).toString();

      const response = await fetch(`${API_BASE_URL}/crypto/trade-offers/?${queryParams}`, {
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
      throw error;
    }
  },

  fetchTraderDetails: async (traderId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/crypto/trader/${traderId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching trader details:", error);
      return DEFAULT_TRADER;
    }
  },

  checkVerificationStatus: async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const userData = JSON.parse(localStorage.getItem('userData'));

      if (!userData?.email) {
        throw new Error('User email not found');
      }

      const response = await fetch(`${API_BASE_URL}/kyc/verifications/${userData.email}/`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { verified: false, verificationExists: false };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        verified: data.status === 'completed',
        verificationExists: true,
        verificationData: data
      };
    } catch (error) {
      console.error("Error checking verification status:", error);
      return { verified: false, verificationExists: false };
    }
  }
};

const Market = () => {
  const [filters, setFilters] = useState({
    tradeType: "Buy",
    crypto: "XRP",
    paymentMethod: "Any",
    location: "Kenya",
    sortBy: "bestPrice"
  });
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 4,
    totalItems: 0
  });
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const navigate = useNavigate();

  const filterMemo = useMemo(() => JSON.stringify(filters), [filters]);

  const isOnline = (lastSeen) => {
    if (!lastSeen) return false;
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    return (now - lastSeenDate) < (5 * 60 * 1000);
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Never";
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 24 * 60) return "Today";
    if (diffMinutes < 7 * 24 * 60) return `${Math.floor(diffMinutes / (24 * 60))} days ago`;
    return lastSeenDate.toLocaleDateString();
  };

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    try {
      return parseFloat(priceStr) || 0;
    } catch {
      return 0;
    }
  };

  const fetchTraders = useCallback(
    debounce(async (currentFilters) => {
      try {
        setLoading(true);
        setError(null);

        // Verify we have a token first
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Please login again');
        }

        // Prepare headers
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const queryParams = new URLSearchParams({
          transaction_type: currentFilters.tradeType.toUpperCase(),
          crypto_currency: currentFilters.crypto,
          ...(currentFilters.paymentMethod !== 'Any' && {
            payment_methods: currentFilters.paymentMethod
          }),
          ...(currentFilters.location && {
            location: currentFilters.location
          })
        }).toString();

        const response = await fetch(`${API_BASE_URL}/crypto/trade-offers/?${queryParams}`, {
          method: "GET",
          headers: headers,
          credentials: 'include' // If using cookies
        });

        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('accessToken');
          throw new Error('Technical Error. Please login again.');
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTraders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching traders:", err);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleCreateOffer = async () => {
    setIsCheckingVerification(true);
    try {
      const { verified, verificationExists } = await TradingService.checkVerificationStatus();

      if (verified) {
        navigate('/termsAndCondition');
      } else if (verificationExists) {
        // Verification exists but not approved - show appropriate message
        navigate('/verification-pending'); // Or handle differently
      } else {
        navigate('/become-vendor');
      }
    } catch (error) {
      console.error("Error:", error);
      navigate('/become-vendor');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  useEffect(() => {
    fetchTraders(filters);
    return () => fetchTraders.cancel();
  }, [filterMemo, fetchTraders]);

  const processedTraders = useMemo(() => {
    const filtered = searchQuery
      ? traders.filter(trader => {
        const query = searchQuery.toLowerCase();
        const safeTrader = { ...DEFAULT_TRADER, ...trader };
        return (
          safeTrader.creator?.username?.toLowerCase().includes(query) ||
          safeTrader.payment_methods?.some(method =>
            method.toLowerCase().includes(query)
          ) ||
          safeTrader.crypto_currency?.toLowerCase().includes(query) ||
          safeTrader.secondary_currency?.toLowerCase().includes(query)
        );
      })
      : traders;

    return [...filtered].sort((a, b) => {
      const safeA = { ...DEFAULT_TRADER, ...a };
      const safeB = { ...DEFAULT_TRADER, ...b };

      switch (filters.sortBy) {
        case "bestPrice":
          const priceA = parsePrice(safeA.rate);
          const priceB = parsePrice(safeB.rate);
          return filters.tradeType === "Buy" ? priceA - priceB : priceB - priceA;
        case "mostTrades":
          return (safeB.creator?.trade_stats?.total_trades || 0) - (safeA.creator?.trade_stats?.total_trades || 0);
        case "highestRating":
          return (safeB.creator?.trade_stats?.completion_rate || 0) - (safeA.creator?.trade_stats?.completion_rate || 0);
        case "newest":
          const dateA = safeA.created_at ? new Date(safeA.created_at) : new Date(0);
          const dateB = safeB.created_at ? new Date(safeB.created_at) : new Date(0);
          return dateB - dateA;
        default:
          return 0;
      }
    });
  }, [traders, searchQuery, filters.sortBy, filters.tradeType]);

  const currentTraders = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    return processedTraders.slice(start, start + pagination.itemsPerPage);
  }, [processedTraders, pagination]);

  const totalPages = Math.ceil(processedTraders.length / pagination.itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTradeClick = (trader) => {
    console.log('Original trader data:', trader);

    // Validate trader object
    if (!trader || typeof trader !== 'object') {
      console.error('Invalid trader data:', trader);
      alert('Invalid trading data. Please try another offer.');
      return;
    }

    if (!trader.crypto_currency) {
      console.error('Missing crypto_currency in trader data:', trader);
      alert('This trading offer has incomplete information. Please try another offer.');
      return;
    }

    // Safely merge with default trader structure
    const safeTrader = {
      ...DEFAULT_TRADER,
      ...trader,
      creator: {
        ...DEFAULT_TRADER.creator,
        ...(trader.creator || {}),
        trade_stats: {
          ...DEFAULT_TRADER.creator.trade_stats,
          ...((trader.creator && trader.creator.trade_stats) || {})
        }
      },
      crypto_currency: trader.crypto_currency.toUpperCase(),
      secondary_currency: trader.secondary_currency ? trader.secondary_currency.toUpperCase() : 'UNKNOWN'
    };

    console.log('Merged trader data:', safeTrader);

    // Map payment method IDs to readable names
    const paymentMethods = Array.isArray(safeTrader.payment_methods)
      ? safeTrader.payment_methods.map(method => {
        if (typeof method === 'number') {
          switch (method) {
            case 9:
              return 'M-PESA';
            // Add more cases if needed
            default:
              return 'Unknown';
          }
        }
        return String(method).trim();
      })
      : [String(safeTrader.payment_methods || 'Unknown').trim()];

    const sellerWalletAddress = trader.creator.wallet_address;

    // Build final trade data
    const tradeData = {
      trader: {
        id: safeTrader.id,
        creator: {
          id: safeTrader.creator.id,
          username: safeTrader.creator.username,
          trade_stats: {
            total_trades: Number(safeTrader.creator.trade_stats?.total_trades) || 0,
            completion_rate: Number(safeTrader.creator.trade_stats?.completion_rate) || 0
          },
          verification_status: safeTrader.creator.verification_status || 'UNVERIFIED',
          walletAddress: sellerWalletAddress,
        },
        crypto_currency: safeTrader.crypto_currency,
        crypto_amount: Number(safeTrader.crypto_amount) || 0,
        min_amount: Number(safeTrader.min_amount) || 0,
        max_amount: Number(safeTrader.max_amount) || 0,
        secondary_currency: safeTrader.secondary_currency,
        rate: Number(safeTrader.rate) || 0,
        payment_methods: paymentMethods,
        terms: String(safeTrader.terms || 'No terms specified').trim(),
        location: String(safeTrader.location || 'Unknown').trim()
      },
      tradeType: String(filters.tradeType || '').toUpperCase(),
      crypto: safeTrader.crypto_currency,
      fiatCurrency: safeTrader.secondary_currency
    };

    // Final validations
    if (!tradeData.trader.crypto_currency) {
      console.error('Missing cryptocurrency in trade data:', tradeData);
      alert('This offer has invalid cryptocurrency information. Please try another offer.');
      return;
    }

    if (!tradeData.trader.secondary_currency) {
      console.error('Missing fiat currency in trade data:', tradeData);
      alert('This offer has invalid fiat currency information. Please try another offer.');
      return;
    }

    console.log(`Initiating ${tradeData.tradeType} trade for ${tradeData.crypto}`, tradeData);

    navigate("/amount", {
      state: tradeData,
      replace: true
    });
  };

  const renderRatingStars = (completionRate) => {
    const rating = (completionRate || 0) / 20;
    return Array(5).fill(0).map((_, i) => (
      <FaStar
        key={i}
        className={`star ${i < Math.floor(rating) ? 'full-star' : ''}${i === Math.floor(rating) && rating % 1 >= 0.5 ? ' half-star' : ''}`}
      />
    ));
  };

  const getPaymentMethods = (methods) => {
    if (!methods) return 'Unknown';

    if (Array.isArray(methods)) {
      return methods.map(method => {
        if (typeof method === 'number') {
          switch (method) {
            case 9: return 'M-PESA';
            // Add other mappings as needed
            default: return 'Unknown';
          }
        }
        return method;
      }).join(', ') || 'Not specified';
    }

    return String(methods) || 'Not specified';
  };

  const getLocation = (location) => {
    if (!location) return 'Unknown';
    return location;
  };

  return (
    <div className="market-container">
      <div className="market-header">
        <h1>P2P Crypto Trading Marketplace</h1>
        <p className="market-subtitle">
          Trade directly with other users with escrow protection
        </p>
        {/* <div className="header-actions">
          <Link to="/become-vendor" className="become-vendor-btn">
            Create Offer
          </Link>
        </div> */}

        <button
          onClick={handleCreateOffer}
          className="become-vendor-btn"
          disabled={isCheckingVerification}
        >
          {isCheckingVerification ? 'Checking...' : 'Create Offer'}
        </button>
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
              <option value="CHX">CHX</option>
              <option value="">Select a cryptocurrency</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
              <option value="DAI">DAI</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="BNB">BNB</option>
              <option value="XRP">XRP</option>
              <option value="SOL">SOL</option>
              <option value="ADA">ADA</option>
              <option value="DOGE">DOGE</option>
              <option value="DOT">DOT</option>
              <option value="SHIB">SHIB</option>
              <option value="MATIC">MATIC</option>
              <option value="LTC">LTC</option>
            </select>

          </div>

          <div className="filter-group">
            <label>Crypto Wallet</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
              className="market-select"
            >
              <option value="Any">Any Wallet</option>
              <option value="Metamask">Metamask</option>
              <option value="Trust Wallet">Trust Wallet</option>
              <option value="Coinbase Wallet">Coinbase Wallet</option>
              <option value="Binance Wallet">Binance Wallet</option>
            </select>
          </div>


          <div className="filter-group">
            <label>Location</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="market-select"
            >
              <option value="Any">🌍 All African Locations</option>
              <option value="Kenya">🇰🇪 Kenya</option>
              <option value="Nigeria">🇳🇬 Nigeria</option>
              <option value="South Africa">🇿🇦 South Africa</option>
              <option value="Egypt">🇪🇬 Egypt</option>
              <option value="Ghana">🇬🇭 Ghana</option>
              <option value="Uganda">🇺🇬 Uganda</option>
              <option value="Tanzania">🇹🇿 Tanzania</option>
              <option value="Ethiopia">🇪🇹 Ethiopia</option>
              <option value="Rwanda">🇷🇼 Rwanda</option>
              <option value="Morocco">🇲🇦 Morocco</option>
              <option value="Algeria">🇩🇿 Algeria</option>
              <option value="Cameroon">🇨🇲 Cameroon</option>
              <option value="Zambia">🇿🇲 Zambia</option>
              <option value="Zimbabwe">🇿🇼 Zimbabwe</option>
              <option value="Senegal">🇸🇳 Senegal</option>
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
              Showing {processedTraders.length} {filters.tradeType.toLowerCase()} offers for {filters.crypto} in {filters.location}
            </p>
          </div>

          <div className="trader-list">
            {currentTraders.length > 0 ? (
              currentTraders.map((trader) => {
                const safeTrader = { ...DEFAULT_TRADER, ...trader };
                const isTraderOnline = isOnline(safeTrader.creator?.last_seen);
                const completionRate = safeTrader.creator?.trade_stats?.completion_rate || 0;
                const totalTrades = safeTrader.creator?.trade_stats?.total_trades || 0;

                return (
                  <div key={safeTrader.id} className="trader-card">
                    <div className="trader-main-info">
                      <div className="trader-avatar">
                        <div className={`avatar-market ${isTraderOnline ? "online" : "offline"}`}>
                          {safeTrader.creator?.username?.charAt(0) || '?'}
                        </div>

                        <div className="trader-status">
                          {isTraderOnline ? (
                            <span className="online-status">Online now</span>
                          ) : (
                            <span className="offline-status">
                              Last seen: {formatLastSeen(safeTrader.creator?.last_seen)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="trader-details">
                        <div className="trader-name-verification">
                          <h3>
                            <Link to={`/profile-details-users/${safeTrader.creator?.id}`} className="trader-link">
                              {safeTrader.creator?.username || 'Anonymous'}
                            </Link>
                            {safeTrader.creator?.verification_status === 'VERIFIED' && (
                              <FaUserShield className="kyc-icon" title="KYC Verified" />
                            )}
                            {safeTrader.creator?.verification_status === 'PREMIUM' && (
                              <FaShieldAlt className="premium-icon" title="Premium Trader" />
                            )}
                          </h3>
                          <div className="trader-rating">
                            <div className="stars">{renderRatingStars(completionRate)}</div>
                            <span className="rating-value">{(completionRate / 20).toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="trader-stats">
                          <div className="stat-item">
                            <IoMdFlash className="stat-icon" />
                            <span>{totalTrades}+ trades</span>
                          </div>
                          <div className="stat-item">
                            <FaExchangeAlt className="stat-icon" />
                            <span>{completionRate}% completion</span>
                          </div>
                          <div className="stat-item">
                            <MdPayment className="stat-icon" />
                            <span>{getPaymentMethods(safeTrader.payment_methods)}</span>
                          </div>
                          <div className="stat-item">
                            <MdLocationOn className="stat-icon" />
                            <span>{getLocation(safeTrader.location)}</span>
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
                          <p className="price">{safeTrader.rate} {safeTrader.secondary_currency}</p>
                          <p className="price-increase">
                            <span className="market-rate">
                              <RiExchangeDollarFill /> Market rate
                            </span>
                          </p>
                        </div>

                        <div className="limit-info">
                          <p className="limits">
                            <span>Min:</span> {safeTrader.min_amount} {safeTrader.secondary_currency}
                          </p>
                          <p className="limits">
                            <span>Max:</span> {safeTrader.max_amount} {safeTrader.secondary_currency}
                          </p>
                          <p className="crypto-amount">
                            <span>Available:</span> {safeTrader.crypto_amount} {safeTrader.crypto_currency}
                          </p>
                        </div>
                      </div>

                      <button
                        className={`trade-button ${filters.tradeType.toLowerCase()}`}
                        onClick={() => handleTradeClick(safeTrader)}
                      >
                        {filters.tradeType} {safeTrader.crypto_currency}
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

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={pagination.currentPage === page ? 'active' : ''}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
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