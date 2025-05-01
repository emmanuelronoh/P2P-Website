import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { formatCurrency, validateInput, calculateCryptoAmount } from "../utils/tradingUtils";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { useUserBalance } from "../hooks/useUserBalance";
import SecurityVerification from "../components/SecurityVerification";
import TradingLimitsInfo from "../components/TradingLimitsInfo";
import PriceMovementIndicator from "../components/PriceMovementIndicator";
import ErrorModal from "../components/ErrorModal";
import LoadingOverlay from "../components/LoadingOverlay";
import "../styles/Amount.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const Amount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trader: traderProp, tradeType, crypto } = location.state || {};
  
  // Initialize trader with data from market.jsx
  const paymentMethodMap = {
    6: 'Binance Pay',
    7: 'Coinbase Wallet',
    8: 'MetaMask',
    9: 'Trust Wallet',
    10: 'Exodus',
    11: 'Electrum'
  };
  
  
  const trader = useMemo(() => {
    if (!traderProp) return null;
    
    const completionRate = traderProp.creator?.trade_stats?.completion_rate || 0;
    const totalTrades = traderProp.creator?.trade_stats?.total_trades || 0;
    
    // Process payment methods
    let paymentMethods = 'Not specified';
    if (Array.isArray(traderProp.payment_methods)) {
      paymentMethods = traderProp.payment_methods
        .map(method => {
          if (typeof method === 'number') {
            return paymentMethodMap[method] || `Unknown (${method})`;
          }
          return method;
        })
        .join(', ');
    } else if (typeof traderProp.payment_methods === 'string') {
      paymentMethods = traderProp.payment_methods;
    }
  
    return {
      id: traderProp.id,
      name: traderProp.creator?.username || 'Anonymous',
      rating: completionRate / 20,
      completedTrades: totalTrades,
      price: parseFloat(traderProp.rate) || 0,
      minLimit: parseFloat(traderProp.min_amount) || 0,
      maxLimit: parseFloat(traderProp.max_amount) || 0,
      paymentMethod: paymentMethods,
      verifiedPayment: traderProp.creator?.verification_status !== 'UNVERIFIED',
      walletAddress: traderProp.creator?.wallet_address || null,
      terms: traderProp.terms || 'No terms specified',
      location: traderProp.location || 'Unknown',
      currency: traderProp.secondary_currency || 'KES',
      cryptoAmountAvailable: parseFloat(traderProp.crypto_amount) || 0
    };
  }, [traderProp]);

  const [amount, setAmount] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [inputError, setInputError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "", details: "" });

  const cryptoSymbol = crypto || traderProp?.crypto_currency || "";
  const cryptoName = cryptoSymbol; // You might want to map this to full names

  // Custom hooks for real-time data
  const { currentPrice, priceChange24h, exchangeRateError } = useExchangeRate(cryptoSymbol, trader?.currency);
  const { availableBalance, balanceError } = useUserBalance(cryptoSymbol);

  // Calculate crypto amount based on fiat input
  const cryptoAmount = useMemo(() => (
    calculateCryptoAmount(parseFloat(amount.replace(/,/g, '')) || 0, trader?.price || currentPrice)
  ), [amount, trader?.price, currentPrice]);

  // Validate trader data on mount
  useEffect(() => {
    if (!trader || !cryptoSymbol) {
      navigate("/market", { 
        state: { 
          notification: {
            type: "error",
            message: "Incomplete Trade Information",
            details: "Please select both a trader and cryptocurrency to continue."
          }
        },
        replace: true 
      });
    }
  }, [trader, cryptoSymbol, navigate]);

  useEffect(() => {
    if (exchangeRateError) {
      setErrorModal({
        show: true,
        message: "Exchange Rate Error",
        details: exchangeRateError
      });
    }

    if (balanceError) {
      setErrorModal({
        show: true,
        message: "Balance Check Failed",
        details: balanceError
      });
    }
  }, [exchangeRateError, balanceError]);

  const formatDisplayAmount = useCallback((value) => {
    if (!value) return "";
    const numStr = value.replace(/,/g, '');
    if (numStr === "") return "";
    if (isNaN(numStr)) return value;

    const [whole, decimal] = numStr.split('.');
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
  }, []);

  const handleAmountChange = (e) => {
    let value = e.target.value;
    const validInput = value.match(/^(\d+\.?\d*|\.\d*)/);
    if (!validInput && value !== "") return;

    value = validInput?.[0] || "";
    const numericValue = value.replace(/,/g, '');

    if (numericValue === "") {
      setAmount("");
      setInputError("");
      return;
    }

    const validation = validateInput(
      numericValue, 
      trader?.minLimit || 0, 
      trader?.maxLimit || 0,
      tradeType === "sell" ? availableBalance : null,
      tradeType === "buy" ? trader?.cryptoAmountAvailable : null
    );

    if (validation.isValid) {
      setInputError("");
      setAmount(formatDisplayAmount(numericValue));
    } else {
      setInputError(validation.message);
      setAmount(formatDisplayAmount(numericValue));
    }
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(formatDisplayAmount(quickAmount.toString()));
    setInputError("");
  };

  const validateTradeRequirements = () => {
    const numericAmount = parseFloat((amount.replace(/,/g, '')) || 0);
  
    if (!amount || numericAmount <= 0) {
      setInputError("Please enter a valid amount");
      return false;
    }
  
    if (tradeType === "sell" && numericAmount > availableBalance) {
      setInputError(`Amount exceeds your available balance of ${formatCurrency(availableBalance, trader.currency)}`);
      return false;
    }
  
    if (tradeType === "buy" && cryptoAmount > trader.cryptoAmountAvailable) {
      setInputError(`Amount exceeds trader's available ${cryptoSymbol} balance`);
      return false;
    }
  
    if (!localStorage.getItem('walletAddress')) {
      setErrorModal({
        show: true,
        message: "Wallet Address Required",
        details: "Please set your wallet address in your profile before proceeding with trades."
      });
      return false;
    }
  
    if (!trader.walletAddress) {
      setErrorModal({
        show: true,
        message: "Trade Cannot Be Processed",
        details: "The trader has not set up their wallet address. Please choose another trader."
      });
      return false;
    }
  
    return true;
  };

  const handleProceed = async () => {
    if (!validateTradeRequirements()) return;
    setIsVerifying(true);
  };

  const confirmTrade = async () => {
    setIsLoading(true);

    try {
      const numericAmount = parseFloat((amount || '0').replace(/,/g, ''));
      const walletAddress = localStorage.getItem('walletAddress');

      const response = await fetch(`${API_BASE_URL}/crypto/trades/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trader_id: trader.id,
          amount: numericAmount,
          crypto_amount: cryptoAmount,
          crypto_currency: cryptoSymbol,
          fiat_currency: trader.currency,
          trade_type: tradeType.toUpperCase(),
          wallet_address: walletAddress
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || errorData?.message || "Failed to process trade");
      }

      const trade = await response.json();

      if (!trade.escrow_address || !trade.id) {
        throw new Error("Invalid trade response from server");
      }

      navigate("/messages", {
        state: {
          trader,
          tradeType,
          crypto: `${cryptoSymbol} - ${cryptoSymbol}`,
          amount: numericAmount,
          cryptoAmount,
          currentPrice: trader.price || currentPrice,
          escrow_address: trade.escrow_address,
          trade_id: trade.id
        }
      });
    } catch (error) {
      console.error("Trade Processing Error:", error);
      setErrorModal({
        show: true,
        message: "Trade Processing Failed",
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeErrorModal = () => {
    setErrorModal({ show: false, message: "", details: "" });
  };

  const navigateToWalletSettings = () => {
    closeErrorModal();
    navigate("/wallet", { state: { section: "wallet" } });
  };

  if (!trader || !cryptoSymbol) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h2>Incomplete Trade Information</h2>
          <p>Please go back and select both a trader and cryptocurrency to continue.</p>
          <button className="back-btn" onClick={() => navigate("/market")}>
            Back to Trade Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-amount-container">
      <LoadingOverlay isLoading={isLoading} message="Processing your trade..." />
      
      <ErrorModal
        show={errorModal.show}
        title={errorModal.message}
        message={errorModal.details}
        onClose={closeErrorModal}
        actions={
          errorModal.message === "Wallet Address Required" ? [
            { text: "Go to Wallets", handler: navigateToWalletSettings },
            { text: "Cancel", handler: closeErrorModal }
          ] : 
          errorModal.message === "Trade Cannot Be Processed" ? [
            { text: "Choose Another Trader", handler: () => { closeErrorModal(); navigate("/market"); } },
            { text: "Cancel", handler: closeErrorModal }
          ] : null
        }
      />

      <div className="trade-amount-card">
        <div className="trade-header">
          <h2>
            {tradeType.toUpperCase()} {cryptoSymbol}
            <span className="crypto-name">{cryptoName}</span>
          </h2>
          <PriceMovementIndicator
            currentPrice={trader.price || currentPrice}
            change24h={priceChange24h}
            currency={trader.currency}
          />
        </div>

        <div className="trader-info-section">
          <div className="trader-info-row">
            <span className="label">Trader:</span>
            <span className="value">
              <strong>{trader.name}</strong>
              <span className={`rating ${trader.rating >= 4.5 ? "high" : trader.rating >= 3.5 ? "medium" : "low"}`}>
                {Number(trader.rating).toFixed(1)} ★
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
              <strong>{formatCurrency(trader.price || currentPrice, trader.currency)}</strong>
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
            currency={trader.currency}
          />

          {tradeType === "buy" && (
            <div className="trader-info-row">
              <span className="label">Available:</span>
              <span className="value">
                <strong>{trader.cryptoAmountAvailable.toFixed(8)} {cryptoSymbol}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="amount-input-section">
          <div className="input-group">
            <label>Amount in {trader.currency}:</label>
            <div className="input-with-actions">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder={`${formatCurrency(trader.minLimit, trader.currency, true)} - ${formatCurrency(trader.maxLimit, trader.currency, true)}`}
                className={`amount-input ${inputError ? "invalid" : ""}`}
                autoFocus
                disabled={isLoading}
              />
              <div className="quick-amounts">
                {[trader.minLimit, Math.round((trader.minLimit + trader.maxLimit) / 2), trader.maxLimit].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="quick-amount-btn"
                    disabled={isLoading}
                  >
                    {formatCurrency(quickAmount, trader.currency, true)}
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
              (1 {cryptoSymbol} = {formatCurrency(trader.price || currentPrice, trader.currency)})
            </span>
          </div>
        </div>

        {isVerifying && !verificationComplete ? (
          <SecurityVerification
            onComplete={() => {
              setVerificationComplete(true);
              confirmTrade();
            }}
            onCancel={() => setIsVerifying(false)}
          />
        ) : (
          <div className="action-buttons">
            <button
              className="proceed-btn"
              onClick={handleProceed}
              disabled={!amount || !!inputError || isLoading}
            >
              {verificationComplete ? "Confirm Trade" : "Verify and Proceed"}
            </button>
            <button 
              className="cancel-btn" 
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="security-info">
          <div className="security-tip">
            <span className="icon">🔒</span>
            <span>All trades are protected by escrow</span>
          </div>
          <div className="security-tip">
            <span className="icon">⚠️</span>
            <span>Never share sensitive information outside the platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Amount;