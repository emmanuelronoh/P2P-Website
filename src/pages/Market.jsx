import React, { useState, useEffect } from "react";
import "../styles/market.css";
import { Link } from "react-router-dom";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdFlash } from "react-icons/io";
import { MdOutlineArrowForwardIos } from "react-icons/md";

export const tradersData = [
  { id: 1, name: "RealNinja", rating: 5, trades: 2200, tradeType: "Buy", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh305,664.73", priceIncrease: "17% above market", minLimit: "KSh20,000", maxLimit: "KSh900,000" },
  { id: 2, name: "arielsluke", rating: 4.94, trades: 1700, tradeType: "Sell", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh271,701.98", priceIncrease: "4% above market", minLimit: "KSh15,000", maxLimit: "KSh500,000" },
  { id: 3, name: "RealNinja", rating: 5, trades: 2200, tradeType: "Buy", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh305,664.73", priceIncrease: "17% above market", minLimit: "KSh20,000", maxLimit: "KSh900,000" },
  { id: 4, name: "arielsluke", rating: 4.94, trades: 1700, tradeType: "Buy", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh271,701.98", priceIncrease: "4% above market", minLimit: "KSh15,000", maxLimit: "KSh500,000" },
  { id: 5, name: "RealNinja", rating: 5, trades: 2200, tradeType: "Buy", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh305,664.73", priceIncrease: "17% above market", minLimit: "KSh20,000", maxLimit: "KSh900,000" },
  { id: 6, name: "arielsluke", rating: 4.94, trades: 1700, tradeType: "Buy", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh271,701.98", priceIncrease: "4% above market", minLimit: "KSh15,000", maxLimit: "KSh500,000" },
  { id: 7, name: "RealNinja", rating: 5, trades: 2200, tradeType: "Sell", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh305,664.73", priceIncrease: "17% above market", minLimit: "KSh20,000", maxLimit: "KSh900,000" },
  { id: 8, name: "arielsluke", rating: 4.94, trades: 1700, tradeType: "Buy", crypto: "Bitcoin - BTC", paymentMethod: "M-PESA", location: "Kenya", price: "KSh271,701.98", priceIncrease: "4% above market", minLimit: "KSh15,000", maxLimit: "KSh500,000" },
  { id: 9, name: "RealNinja", rating: 5, trades: 2200, tradeType: "Sell", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh305,664.73", priceIncrease: "17% above market", minLimit: "KSh20,000", maxLimit: "KSh900,000" },
  { id: 10, name: "arielsluke", rating: 4.94, trades: 1700, tradeType: "Buy", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh271,701.98", priceIncrease: "4% above market", minLimit: "KSh15,000", maxLimit: "KSh500,000" },
  { id: 11, name: "RealNinja", rating: 5, trades: 2200, tradeType: "Sell", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh305,664.73", priceIncrease: "17% above market", minLimit: "KSh20,000", maxLimit: "KSh900,000" },
  { id: 12, name: "arielsluke", rating: 4.94, trades: 1700, tradeType: "Sell", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh271,701.98", priceIncrease: "4% above market", minLimit: "KSh15,000", maxLimit: "KSh500,000" },
  { id: 13, name: "RealNinja", rating: 5, trades: 2200, tradeType: "Sell", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh305,664.73", priceIncrease: "17% above market", minLimit: "KSh20,000", maxLimit: "KSh900,000" },
  { id: 14, name: "arielsluke", rating: 4.94, trades: 1700, tradeType: "Buy", crypto: "Ethereum - ETH", paymentMethod: "M-PESA", location: "Kenya", price: "KSh271,701.98", priceIncrease: "4% above market", minLimit: "KSh15,000", maxLimit: "KSh500,000" },
];
const Market = () => {
  const [tradeType, setTradeType] = useState("Sell");
  const [crypto, setCrypto] = useState("Ethereum - ETH");
  const [paymentMethod, setPaymentMethod] = useState("Any");
  const [location, setLocation] = useState("Kenya");
  const [filteredTraders, setFilteredTraders] = useState([]);

  useEffect(() => {
    const filtered = tradersData.filter(
      (trader) =>
        trader.tradeType === tradeType &&
        trader.crypto === crypto &&
        (paymentMethod === "Any" || trader.paymentMethod === paymentMethod) &&
        trader.location === location
    );
    setFilteredTraders(filtered);
  }, [tradeType, crypto, paymentMethod, location]);

  return (
    <div className="market-container">
      <div className="filters">
        <div className="market-select">
          <label>I want to</label>
          <select value={tradeType} onChange={(e) => setTradeType(e.target.value)}>
            <option value="Buy">Buy</option>
            <option value="Sell" selected>Sell</option>
          </select>
        </div>

        <div className="market-select">
          <label>Cryptocurrency</label>
          <select value={crypto} onChange={(e) => setCrypto(e.target.value)}>
            <option value="Ethereum - ETH" selected>Ethereum - ETH</option>
            <option value="Bitcoin - BTC">Bitcoin - BTC</option>
            <option value="USDT - Tether">USDT - Tether</option>
          </select>
        </div>

        <div className="market-select">
          <label>Payment method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="Any">Any</option>
            <option value="M-PESA">M-PESA</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="PayPal">PayPal</option>
          </select>
        </div>

        <div className="market-select">
          <label>Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="Kenya" selected>🇰🇪 Kenya</option>
            <option value="USA">🇺🇸 USA</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="Germany">🇩🇪 Germany</option>
          </select>
        </div>
      </div>

      <div className="trader-list">
  <h2>
    {tradeType} {crypto.split(" - ")[0]} in {location}
  </h2>
  {filteredTraders.length > 0 ? (
    filteredTraders.map((trader) => (
      <div key={trader.id} className="trader-card">
        <div className="trader-info">
          <h3>
            <Link to={`/profile/${trader.id}`} className="trader-link">
              {trader.name}
            </Link>{" "}
            <FaRegCheckCircle className="verified-icon" />
          </h3>
          <p className="rating">
            <IoMdFlash /> {trader.rating} ⭐ {trader.trades} trades
          </p>
          <p className="trade-details">
            {trader.paymentMethod} · {trader.location}
          </p>
        </div>
        <div className="price-section">
          <p className="price">{trader.price} KES</p>
          <p className="price-increase">{trader.priceIncrease}</p>
          <p className="limits">
            Limits: {trader.minLimit} - {trader.maxLimit}
          </p>
        </div>
        <button className={`${tradeType.toLowerCase()}-button`}>
          {tradeType} <MdOutlineArrowForwardIos />
        </button>
      </div>
    ))
  ) : (
    <p>No traders found for your selection.</p>
  )}
</div>
    </div>
  );
};

export default Market;