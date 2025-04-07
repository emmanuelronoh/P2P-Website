import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { formatCurrency, validateInput, calculateCryptoAmount } from "../utils/tradingUtils";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { useUserBalance } from "../hooks/useUserBalance";
import SecurityVerification from "../components/SecurityVerification";
import TradingLimitsInfo from "../components/TradingLimitsInfo";
import PriceMovementIndicator from "../components/PriceMovementIndicator";
import "../styles/Amount.css";

const Amount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trader, tradeType, crypto } = location.state || {};
  const [amount, setAmount] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [inputError, setInputError] = useState("");

  // Extract crypto symbol and name
  const [cryptoSymbol, cryptoName] = crypto?.split(" - ") || ["", ""];

  // Custom hooks for real-time data
  const { currentPrice, priceChange24h } = useExchangeRate(cryptoSymbol, "KES");
  const { availableBalance } = useUserBalance(cryptoSymbol);

  // Calculate crypto amount based on fiat input
  const cryptoAmount = useMemo(() => (
    calculateCryptoAmount(parseFloat(amount.replace(/,/g, '')) || 0, trader?.price || currentPrice)
  ), [amount, trader?.price, currentPrice]);

  // Validate trader data on mount
  useEffect(() => {
    if (!trader || !crypto) {
      navigate("/trade", { replace: true });
    }
  }, [trader, crypto, navigate]);

  // Format amount with commas for display
  const formatDisplayAmount = useCallback((value) => {
    if (!value) return "";
    const numStr = value.replace(/,/g, '');
    if (numStr === "") return "";
    if (isNaN(numStr)) return value; // don't modify if invalid
    
    const [whole, decimal] = numStr.split('.');
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
  }, []);

  // Handle amount changes with validation
  const handleAmountChange = (e) => {
    let value = e.target.value;
    
    // Allow only numbers and one decimal point
    const validInput = value.match(/^(\d+\.?\d*|\.\d*)/);
    if (!validInput && value !== "") return;
    
    value = validInput?.[0] || "";
    
    // Remove existing commas for validation
    const numericValue = value.replace(/,/g, '');
    
    if (numericValue === "") {
      setAmount("");
      setInputError("");
      return;
    }
    
    // Validate the numeric value
    const validation = validateInput(numericValue, trader?.minLimit, trader?.maxLimit);
    
    if (validation.isValid) {
      setInputError("");
      // Store the formatted value in state for display
      setAmount(formatDisplayAmount(numericValue));
    } else {
      setInputError(validation.message);
      // Still allow typing but show error
      setAmount(formatDisplayAmount(numericValue));
    }
  };

  // Handle quick amount selection
  const handleQuickAmount = (quickAmount) => {
    setAmount(formatDisplayAmount(quickAmount.toString()));
    setInputError("");
  };
  
  // Handle proceed to trade
  const handleProceed = async () => {
    const numericAmount = parseFloat(amount.replace(/,/g, '') || 0);
    
    // Final validation before proceeding
    if (!amount || numericAmount <= 0) {
      setInputError("Please enter a valid amount");
      return;
    }

    if (numericAmount < trader.minLimit || numericAmount > trader.maxLimit) {
      setInputError(`Amount must be between ${formatCurrency(trader.minLimit, "KES")} and ${formatCurrency(trader.maxLimit, "KES")}`);
      return;
    }

    if (tradeType === "buy" && availableBalance < cryptoAmount) {
      setInputError("Insufficient seller balance for this trade");
      return;
    }

    if (!verificationComplete) {
      setIsVerifying(true);
      return;
    }

    navigate("/trade-confirmation", {
      state: {
        trader,
        tradeType,
        crypto,
        amount: numericAmount,
        cryptoAmount,
        currentPrice: trader?.price || currentPrice
      }
    });
  };

  if (!trader || !crypto) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h2>Incomplete Trade Information</h2>
          <p>Please go back and select both a trader and cryptocurrency to continue.</p>
          <button className="back-btn" onClick={() => navigate("/trade")}>
            Back to Trade Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-amount-container">
      <div className="trade-amount-card">
        <div className="trade-header">
          <h2>
            {tradeType.toUpperCase()} {cryptoSymbol}
            <span className="crypto-name">{cryptoName}</span>
          </h2>
          <PriceMovementIndicator
            currentPrice={trader?.price || currentPrice}
            change24h={priceChange24h}
            currency="KES"
          />
        </div>

        <div className="trader-info-section">
          <div className="trader-info-row">
            <span className="label">Trader:</span>
            <span className="value">
              <strong>{trader.name}</strong>
              <span className={`rating ${trader.rating >= 4.5 ? "high" : trader.rating >= 3.5 ? "medium" : "low"}`}>
                {trader.rating} ★
              </span>
              <span className="trade-count">({trader.completedTrades} trades)</span>
            </span>
          </div>

          <div className="trader-info-row">
            <span className="label">Payment Method:</span>
            <span className="value">
              <strong>{trader.paymentMethod}</strong>
              {trader.verifiedPayment && <span className="verified-badge">Verified</span>}
            </span>
          </div>

          <div className="trader-info-row">
            <span className="label">Price:</span>
            <span className="value price-value">
              <strong>{formatCurrency(trader.price || currentPrice, "KES")}</strong>
              {trader.price && trader.price !== currentPrice && (
                <span className="price-difference">
                  ({((trader.price - currentPrice) / currentPrice * 100).toFixed(2)}% {trader.price > currentPrice ? "above" : "below"} market)
                </span>
              )}
            </span>
          </div>

          <TradingLimitsInfo
            minLimit={trader.minLimit}
            maxLimit={trader.maxLimit}
            currency="KES"
          />
        </div>

        <div className="amount-input-section">
          <div className="input-group">
            <label>Amount in KES:</label>
            <div className="input-with-actions">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder={`${formatCurrency(trader.minLimit, "KES", true)} - ${formatCurrency(trader.maxLimit, "KES", true)}`}
                className={`amount-input ${inputError ? "invalid" : ""}`}
                autoFocus
              />
              <div className="quick-amounts">
                {[trader.minLimit, Math.round(trader.maxLimit / 2), trader.maxLimit].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="quick-amount-btn"
                  >
                    {formatCurrency(quickAmount, "KES", true)}
                  </button>
                ))}
              </div>
            </div>
            {inputError && <div className="error-message">{inputError}</div>}
          </div>

          <div className="conversion-display">
            <span>You will {tradeType === "buy" ? "receive" : "send"}:</span>
            <strong>
              {cryptoAmount.toFixed(8)} {cryptoSymbol}
            </strong>
            <span className="exchange-rate">
              (1 {cryptoSymbol} = {formatCurrency(trader?.price || currentPrice, "KES")})
            </span>
          </div>
        </div>

        {isVerifying && !verificationComplete ? (
          <SecurityVerification
            onComplete={() => {
              setVerificationComplete(true);
              setIsVerifying(false);
            }}
            onCancel={() => setIsVerifying(false)}
          />
        ) : (
          <div className="action-buttons">
            <button
              className="proceed-btn"
              onClick={handleProceed}
              disabled={!amount || !!inputError}
            >
              {verificationComplete ? "Confirm Trade" : "Verify and Proceed"}
            </button>
            <button className="cancel-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        )}

        <div className="security-info">
          <div className="security-tip">
            <span className="icon">🔒</span>
            <span>Never release crypto before receiving payment</span>
          </div>
          <div className="security-tip">
            <span className="icon">👤</span>
            <span>Check trader's rating and trade history</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Amount;