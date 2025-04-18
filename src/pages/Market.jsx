import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaRegCheckCircle,
  FaStar,
  FaUserShield,
  FaShieldAlt,
  FaBolt,
  FaExchangeAlt
} from "react-icons/fa";
import { IoMdFlash, IoMdTime } from "react-icons/io";
import { MdOutlineArrowForwardIos, MdPayment, MdLocationOn } from "react-icons/md";
import { RiExchangeDollarFill } from "react-icons/ri";
import { BsGraphUp, BsGraphDown } from "react-icons/bs";
import debounce from "lodash.debounce";
import "../styles/market.css";

const API_BASE_URL = "http://localhost:8000/fiat";

// API service for real backend calls
const TradingService = {
  fetchTraders: async (filters) => {
    try {
      const response = await fetch(`${API_BASE_URL}/traders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching traders:", error);
      throw error;
    }
  },

  fetchMarketPrice: async (crypto, tradeType) => {
    try {
      const token = localStorage.getItem('accessToken'); // Get auth token
  
      const response = await fetch(`http://localhost:8000/fiat/market/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          crypto: crypto.toUpperCase(),
          tradeType 
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // ✅ Ensure this function always returns a string (price or error)
      return data.price || "Price unavailable";
    } catch (error) {
      console.error("❌ Full error:", error.message);
      return `Error: ${error.message}`; // ✅ Return string, not object
    }
  },  

  fetchTraderDetails: async (traderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/trader/${traderId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching trader details:", error);
      throw error;
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
  const [marketPrice, setMarketPrice] = useState("Loading...");
  const navigate = useNavigate();

  // Fetch traders with debouncing
  const fetchTraders = useCallback(
    debounce(async (filters) => {
      try {
        setLoading(true);
        const data = await TradingService.fetchTraders(filters);
        setTraders(data);
        setError(null);
        
        // Fetch market price whenever we fetch traders
        const price = await TradingService.fetchMarketPrice(
          filters.crypto.split(" - ")[0], 
          filters.tradeType
        );
        setMarketPrice(price);
      } catch (err) {
        setError("Failed to load traders. Please try again later.");
        console.error("Error fetching traders:", err);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchTraders(filters);
  }, [filters, fetchTraders]);

  // Filter traders based on search query
  const filteredTraders = useMemo(() => {
    if (!searchQuery) return traders;
    return traders.filter(trader =>
      trader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trader.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [traders, searchQuery]);

  // Sort traders based on selected criteria
  const sortedTraders = useMemo(() => {
    const tradersCopy = [...filteredTraders];
    switch (filters.sortBy) {
      case "bestPrice":
        return tradersCopy.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ""));
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ""));
          return filters.tradeType === "Buy" ? priceA - priceB : priceB - priceA;
        });
      case "mostTrades":
        return tradersCopy.sort((a, b) => b.trades - a.trades);
      case "highestRating":
        return tradersCopy.sort((a, b) => b.rating - a.rating);
      case "newest":
        return tradersCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return tradersCopy;
    }
  }, [filteredTraders, filters.sortBy, filters.tradeType]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTradeClick = (trader) => {
    navigate("/amount", { 
      state: { 
        trader, 
        tradeType: filters.tradeType, 
        crypto: filters.crypto 
      } 
    });
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
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
            <div className="market-price-trend">
              {filters.tradeType === "Buy" ? (
                <BsGraphDown className="trend-icon down" />
              ) : (
                <BsGraphUp className="trend-icon up" />
              )}
              <span>
                Market {filters.tradeType === "Buy" ? "buy" : "sell"} price: {marketPrice}
              </span>
            </div>
          </div>

          <div className="trader-list">
            {sortedTraders.length > 0 ? (
              sortedTraders.map((trader) => (
                <div key={trader.id} className={`trader-card ${trader.premium ? "premium" : ""}`}>
                  <div className="trader-main-info">
                    <div className="trader-avatar">
                      <div className={`avatar-market ${trader.online ? "online" : "offline"}`}>
                        {trader.name.charAt(0)}
                      </div>
                      <div className="trader-status">
                        {trader.online ? (
                          <span className="online-status">Online</span>
                        ) : (
                          <span className="offline-status">Offline ({trader.lastActive})</span>
                        )}
                      </div>
                    </div>

                    <div className="trader-details">
                      <div className="trader-name-verification">
                        <h3>
                          <Link to={`/profile/${trader.id}`} className="trader-link">
                            {trader.name}
                          </Link>
                          {trader.kycVerified && <FaUserShield className="kyc-icon" title="KYC Verified" />}
                          {trader.premium && <FaShieldAlt className="premium-icon" title="Premium Trader" />}
                        </h3>
                        <div className="trader-rating">
                          <div className="stars">{renderRatingStars(trader.rating)}</div>
                          <span className="rating-value">{trader.rating.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="trader-stats">
                        <div className="stat-item">
                          <IoMdFlash className="stat-icon" />
                          <span>{trader.trades.toLocaleString()} trades</span>
                        </div>
                        <div className="stat-item">
                          <FaExchangeAlt className="stat-icon" />
                          <span>{trader.completionRate}% completion</span>
                        </div>
                        <div className="stat-item">
                          <MdPayment className="stat-icon" />
                          <span>{trader.paymentMethod}</span>
                        </div>
                        <div className="stat-item">
                          <MdLocationOn className="stat-icon" />
                          <span>{trader.location}</span>
                        </div>
                      </div>

                      <div className="trader-terms">
                        <p>
                          <IoMdTime className="terms-icon" />
                          {trader.terms}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="trader-offer">
                    <div className="price-info">
                      <div className="price-section">
                        <p className="price">{trader.price}</p>
                        <p className="price-increase">
                          {trader.priceIncrease.includes("above") ? (
                            <span className="above-market">
                              <RiExchangeDollarFill /> {trader.priceIncrease}
                            </span>
                          ) : (
                            <span className="below-market">
                              <RiExchangeDollarFill /> {trader.priceIncrease}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="limit-info">
                        <p className="limits">
                          <span>Min:</span> {trader.minLimit}
                        </p>
                        <p className="limits">
                          <span>Max:</span> {trader.maxLimit}
                        </p>
                        <p className="crypto-amount">
                          <span>Available:</span> {trader.cryptoAmount} {trader.crypto.split(" - ")[1]}
                        </p>
                      </div>
                    </div>

                    <button
                      className={`trade-button ${filters.tradeType.toLowerCase()}`}
                      onClick={() => handleTradeClick(trader)}
                    >
                      {filters.tradeType} {trader.crypto.split(" - ")[1]}
                      <MdOutlineArrowForwardIos className="button-arrow" />
                    </button>
                  </div>
                </div>
              ))
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
    </div>
  );
};

export default Market;