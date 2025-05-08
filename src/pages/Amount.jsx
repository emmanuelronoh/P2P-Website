
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { formatCurrency, validateInput, calculateCryptoAmount } from "../utils/tradingUtils";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { useUserBalance } from "../hooks/useUserBalance";
import { TOKEN_ADDRESSES, SUPPORTED_TOKENS } from '../config/tokens';
import SecurityVerification from "../authentications/SecurityVerification";
import TradingLimitsInfo from "../components/TradingLimitsInfo";
import ErrorModal from "../components/ErrorModal";
import LoadingOverlay from "../components/LoadingOverlay";
import "../styles/Amount.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const Amount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trader: traderProp, tradeType, crypto } = location.state || {};

  // Get wallet address from localStorage
  const userWalletAddress = localStorage.getItem('walletAddress');
  const [sellerWalletAddress, setSellerWalletAddress] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);

  const paymentMethodMap = {
    6: 'Binance Pay',
    7: 'Coinbase Wallet',
    8: 'MetaMask',
    9: 'Trust Wallet',
    10: 'Exodus',
    11: 'Electrum'
  };

  useEffect(() => {
    const fetchSellerWallet = async () => {
      if (!traderProp?.creator?.id) return;

      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('No access token found');
        }

        const response = await fetch(`${API_BASE_URL}/wallet-connect/connections/?user=${traderProp.creator.id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            setErrorModal({
              show: true,
              message: "Technical Error",
              details: "Your session has expired. Please login again.",
              actionText: "Login",
              onAction: () => navigate("/login")
            });
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const connections = await response.json();

        // Debugging
        console.log('All connections:', connections);
        console.log('Looking for user ID:', traderProp.creator.id);

        const sellerConnections = connections.filter(conn => {
          // Convert both to string for reliable comparison
          return conn.user.toString() === traderProp.creator.id.toString() && conn.is_active;
        });
        if (sellerConnections.length > 0) {
          const mostRecentConnection = sellerConnections.sort((a, b) =>
            new Date(b.last_used_at) - new Date(a.last_used_at)
          )[0];

          console.log('Selected wallet:', mostRecentConnection);
          setSellerWalletAddress(mostRecentConnection.wallet_address);
        } else {
          console.warn("No active wallet connections found for seller:", traderProp.creator.id);
          setSellerWalletAddress(null);
        }
      } catch (error) {
        console.error("Error fetching seller wallet:", error);
        setErrorModal({
          show: true,
          message: "Error Loading Wallet",
          details: error.message.includes('401')
            ? "Authentication failed. Please login again."
            : "Could not load seller's wallet information",
          actionText: "Retry",
          onAction: () => fetchSellerWallet()
        });
      } finally {
        setWalletLoading(false);
      }
    };

    fetchSellerWallet();
  }, [traderProp, navigate]);


  const trader = useMemo(() => {
    if (!traderProp) return null;

    // Convert string amounts to numbers safely
    const minAmount = parseFloat(traderProp.min_amount) || 0;
    const maxAmount = parseFloat(traderProp.max_amount) || 0;
    const cryptoAmount = parseFloat(traderProp.crypto_amount) || 0;
    const rate = parseFloat(traderProp.rate) || 0;

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
      rating: (traderProp.creator?.trade_stats?.completion_rate || 0) / 20,
      completedTrades: traderProp.creator?.trade_stats?.total_trades || 0,
      price: rate,
      minLimit: minAmount,
      maxLimit: maxAmount,
      paymentMethod: paymentMethods,
      verifiedPayment: traderProp.creator?.verification_status !== 'UNVERIFIED',
      walletAddress: sellerWalletAddress, // Use the fetched wallet address
      buyerWalletAddress: userWalletAddress,
      terms: traderProp.terms || 'No terms specified',
      location: traderProp.location || 'Unknown',
      currency: traderProp.secondary_currency || 'KES',
      cryptoAmountAvailable: cryptoAmount,
      isWalletSet: !!sellerWalletAddress
    };
  }, [traderProp, userWalletAddress, sellerWalletAddress]);

  const [amount, setAmount] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [inputError, setInputError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "", details: "" });

  const cryptoSymbol = crypto || traderProp?.crypto_currency || "";
  const cryptoName = cryptoSymbol;

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
      return;
    }

    // Check if user has wallet address
    if (!userWalletAddress) {
      setErrorModal({
        show: true,
        message: "Wallet Setup Required",
        details: "Please set up your wallet address before trading."
      });
    }
  }, [trader, cryptoSymbol, navigate, userWalletAddress]);

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

  useEffect(() => {
    if (traderProp && cryptoSymbol && traderProp.crypto_currency !== cryptoSymbol) {
      setErrorModal({
        show: true,
        message: "Cryptocurrency Mismatch",
        details: `This listing is for ${traderProp.crypto_currency} but you're trying to trade ${cryptoSymbol}`,
        actionText: "Back to Market",
        onAction: () => navigate("/market")
      });
    }
  }, [traderProp, cryptoSymbol, navigate]);

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
    const numericValue = parseFloat(value.replace(/,/g, '')) || 0;

    if (value === "") {
      setAmount("");
      setInputError("");
      return;
    }

    // Validate against trader's limits
    if (numericValue < trader.minLimit) {
      setInputError(`Minimum trade amount is ${formatCurrency(trader.minLimit, trader.currency)}`);
    } else if (numericValue > trader.maxLimit) {
      setInputError(`Maximum trade amount is ${formatCurrency(trader.maxLimit, trader.currency)}`);
    } else if (tradeType === "sell" && numericValue > availableBalance) {
      setInputError(`Insufficient balance. You only have ${availableBalance.toFixed(6)} ${cryptoSymbol}`);
    } else if (tradeType === "buy" && cryptoAmount > trader.cryptoAmountAvailable) {
      setInputError(`Trader only has ${trader.cryptoAmountAvailable.toFixed(6)} ${cryptoSymbol} available`);
    } else {
      setInputError("");
    }

    setAmount(formatDisplayAmount(value));
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(formatDisplayAmount(quickAmount.toString()));
    setInputError("");
  };

  const validateTradeRequirements = () => {
    const numericAmount = parseFloat((amount.replace(/,/g, '')) || 0);

    // Validate trade amount
    if (!amount || numericAmount <= 0) {
      setInputError("Please enter a valid amount");
      return false;
    }

    // Check if amount is within trader's limits
    if (numericAmount < trader.minLimit) {
      setInputError(`Minimum trade amount is ${formatCurrency(trader.minLimit, trader.currency)}`);
      return false;
    }

    if (numericAmount > trader.maxLimit) {
      setInputError(`Maximum trade amount is ${formatCurrency(trader.maxLimit, trader.currency)}`);
      return false;
    }

    // Check buyer's wallet
    if (!trader.buyerWalletAddress) {
      setErrorModal({
        show: true,
        message: "Your Wallet Not Setup",
        details: "Please configure your wallet address in settings before trading.",
        actionText: "Go to Wallet Settings",
        onAction: navigateToWalletSettings
      });
      return false;
    }

    // Check seller's wallet (only for buy trades)
    if (tradeType === "buy") {
      if (walletLoading) {
        setErrorModal({
          show: true,
          message: "Loading Trader Wallet",
          details: "Please wait while we verify the trader's wallet information."
        });
        return false;
      }

      if (!trader.walletAddress) {
        setErrorModal({
          show: true,
          message: "Trader Wallet Not Configured",
          details: "This trader hasn't set up their receiving wallet. Please choose another trader or contact support.",
          actionText: "Back to Market",
          onAction: () => navigate("/market")
        });
        return false;
      }
    }

    // Additional checks for sell trades
    if (tradeType === "sell") {
      if (numericAmount > availableBalance) {
        setInputError(`Insufficient balance. You only have ${availableBalance.toFixed(6)} ${cryptoSymbol}`);
        return false;
      }
    }

    // Additional checks for buy trades
    if (tradeType === "buy") {
      if (cryptoAmount > trader.cryptoAmountAvailable) {
        setInputError(`Trader only has ${trader.cryptoAmountAvailable.toFixed(6)} ${cryptoSymbol} available`);
        return false;
      }
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
  
      // Validate amount again before proceeding
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error("Please enter a valid trade amount");
      }
  
      // Enhanced token address mapping with fallback to API if needed
      const tokenAddresses = {
        'BNB': '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        'BTC': '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
        'ETH': '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
        'USDT': '0x55d398326f99059ff775485246999027b3197955',
        'USDC': '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        'SOL': '0x570a5d26f7765ecb712c0924e4de545b89fd43df',
        'CHX': '0x5f75112bBB4E1aF516fBE3e21528C63DA2B6a1A5',
        "XRP":   '0x0e2e74cfe8e0412434d5c87a6a9f80e94f00b0a0'
      };
  
      // Get token address with better error handling
      let tokenAddress = tokenAddresses[cryptoSymbol.toUpperCase()];
  
      if (!tokenAddress) {
        // Try to fetch token address dynamically if not in our mapping
        try {
          const tokenInfoResponse = await fetch(`${API_BASE_URL}/tokens/${cryptoSymbol}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
          
          if (tokenInfoResponse.ok) {
            const tokenInfo = await tokenInfoResponse.json();
            if (tokenInfo.address && tokenInfo.is_active) {
              tokenAddress = tokenInfo.address;
            } else {
              throw new Error(`Token ${cryptoSymbol} is inactive`);
            }
          } else {
            throw new Error(`Failed to fetch token info: ${tokenInfoResponse.status}`);
          }
        } catch (fetchError) {
          console.error("Failed to fetch token address:", fetchError);
          throw new Error(`Token ${cryptoSymbol} is not supported. Supported tokens: ${Object.keys(tokenAddresses).join(', ')}`);
        }
      }
  
      // Validate token address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
        throw new Error(`Invalid token address format for ${cryptoSymbol}`);
      }
  
      // Enhanced escrow creation payload
      const escrowPayload = {
        seller_id: trader.id,
        token_address: tokenAddress.toLowerCase(), // Ensure lowercase for consistency
        amount: numericAmount,
        payment_details: `Trading ${cryptoSymbol} for ${trader.currency}`,
        buyer_wallet: userWalletAddress,
        trade_type: tradeType.toUpperCase(),
        fiat_currency: trader.currency,
        crypto_amount: cryptoAmount,
        rate: trader.price || currentPrice
      };
  
      // Step 1: Create the escrow with timeout and retry logic
      const createEscrow = async (attempt = 1) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
  
        try {
          const response = await fetch(`${API_BASE_URL}/escrow/transactions/escrows/create/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(escrowPayload),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
  
          if (!response.ok) {
            const errorData = await response.json();
            const errorMsg = errorData?.error || errorData?.message || "Failed to create escrow";
            
            // Handle token not supported error specifically
            if (errorMsg.includes("not supported") || errorMsg.includes("inactive")) {
              throw new Error(`Token ${cryptoSymbol} is not supported or inactive`);
            }
            
            throw new Error(errorMsg);
          }
  
          return await response.json();
        } catch (error) {
          if (attempt < 3 && !error.message.includes("not supported")) {
            console.warn(`Retrying escrow creation (attempt ${attempt})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            return createEscrow(attempt + 1);
          }
          throw error;
        }
      };
  
      const escrowData = await createEscrow();
  
      if (!escrowData?.escrow_address || !escrowData?.id) {
        throw new Error("Invalid escrow response from server");
      }
  
      // Step 2: Fund the escrow if needed (for buy trades)
      if (tradeType === "buy") {
        try {
          const fundResponse = await fetch(`${API_BASE_URL}/escrow/transactions/${escrowData.escrow_address}/fund/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              amount: numericAmount,
              token_address: tokenAddress.toLowerCase()
            })
          });
  
          if (!fundResponse.ok) {
            const errorData = await fundResponse.json();
            throw new Error(errorData?.error || errorData?.message || "Escrow funding failed");
          }
        } catch (fundError) {
          // Attempt to cancel escrow if funding fails
          try {
            await fetch(`${API_BASE_URL}/escrow/transactions/${escrowData.escrow_address}/cancel/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
          } catch (cancelError) {
            console.error("Failed to cancel escrow after funding error:", cancelError);
          }
          throw fundError;
        }
      }
  
      // Navigate to messages with enhanced state
      navigate("/messages", {
        state: {
          trader,
          tradeType,
          crypto: cryptoSymbol,
          amount: numericAmount,
          cryptoAmount,
          currentPrice: trader.price || currentPrice,
          escrow_address: escrowData.escrow_address,
          trade_id: escrowData.id,
          fiatCurrency: trader.currency,
          tokenAddress,
          timestamp: new Date().toISOString(),
          tradeStatus: 'pending',
          sellerWallet: trader.walletAddress,
          buyerWallet: userWalletAddress
        }
      });
  
    } catch (error) {
      console.error("Trade Processing Error:", error);
      
      let errorMessage = error.message;
      let actionText = null;
      let onAction = null;
      
      // Special handling for token-related errors
      if (error.message.includes("not supported") || error.message.includes("inactive")) {
        errorMessage = `Token ${cryptoSymbol} is not supported. Please try another token.`;
        actionText = "View Supported Tokens";
        onAction = () => navigate("/supported-tokens");
      } else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        errorMessage = "Technical Error. Please login again.";
        actionText = "Login";
        onAction = () => navigate("/login");
      }
  
      setErrorModal({
        show: true,
        message: "Trade Processing Failed",
        details: errorMessage,
        actionText,
        onAction
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
    navigate("/dapp", { state: { section: "wallet" } });
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
          errorModal.message === "Wallet Setup Required" ? [
            { text: "Set Up Wallet", handler: navigateToWalletSettings },
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
        </div>

        <div className="trader-info-section">
          <div className="trader-info-row">
            <span className="label">Your Wallet:</span>
            <span className="value wallet-address">
              {userWalletAddress ? (
                <>
                  <span className="truncated-address">
                    {userWalletAddress.substring(0, 6)}...{userWalletAddress.substring(userWalletAddress.length - 4)}
                  </span>
                  <button
                    className="change-wallet-btn"
                    onClick={navigateToWalletSettings}
                  >
                    Change
                  </button>
                </>
              ) : (
                <span className="no-wallet">Not set up</span>
              )}
            </span>
          </div>

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
            <span className="label">Trader Wallet:</span>
            <span className="value wallet-address">
              {walletLoading ? (
                <span className="loading-wallet">Loading wallet...</span>
              ) : trader.walletAddress ? (
                <>
                  <span className="truncated-address">
                    {trader.walletAddress.substring(0, 6)}...{trader.walletAddress.substring(trader.walletAddress.length - 4)}
                  </span>
                  <span className="wallet-status-badge">Verified</span>
                </>
              ) : (
                <span className="no-wallet warning">Not configured</span>
              )}
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
                <strong>{trader.cryptoAmountAvailable.toFixed(2)} {cryptoSymbol}</strong>
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
              {cryptoAmount.toFixed(2)} {cryptoSymbol}
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
              onClick={() => navigate("/market")}
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
//   return (
//     <div className="trade-amount-container">
//       <LoadingOverlay isLoading={isLoading} message="Processing your trade..." />

//       <ErrorModal
//         show={errorModal.show}
//         title={errorModal.message}
//         message={errorModal.details}
//         onClose={closeErrorModal}
//         actions={
//           errorModal.message === "Wallet Setup Required" ? [
//             { text: "Set Up Wallet", handler: navigateToWalletSettings },
//             { text: "Cancel", handler: closeErrorModal }
//           ] : null
//         }
//       />

//       <div className="trade-amount-card">
//         <div className="trade-header">
//           <h2>
//             {tradeType.toUpperCase()} {cryptoSymbol}
//             <span className="crypto-name">{cryptoName}</span>
//           </h2>
//         </div>

//         <div className="trader-info-section">
//           <div className="trader-info-row">
//             <span className="label">Your Wallet:</span>
//             <span className="value wallet-address">
//               {userWalletAddress ? (
//                 <>
//                   <span className="truncated-address">
//                     {userWalletAddress.substring(0, 6)}...{userWalletAddress.substring(userWalletAddress.length - 4)}
//                   </span>
//                   <button
//                     className="change-wallet-btn"
//                     onClick={navigateToWalletSettings}
//                   >
//                     Change
//                   </button>
//                 </>
//               ) : (
//                 <span className="no-wallet">Not set up</span>
//               )}
//             </span>
//           </div>

//           <div className="trader-info-row">
//             <span className="label">Trader:</span>
//             <span className="value">
//               <strong>{trader.name}</strong>
//               <span className={`rating ${trader.rating >= 4.5 ? "high" : trader.rating >= 3.5 ? "medium" : "low"}`}>
//                 {Number(trader.rating).toFixed(1)} ★
//               </span>
//               <span className="trade-count">({trader.completedTrades} trades)</span>
//             </span>
//           </div>


//           <div className="trader-info-row">
//             <span className="label">Price:</span>
//             <span className="value price-value">
//               <strong>{formatCurrency(trader.price || currentPrice, trader.currency)}</strong>
//               {trader.price && trader.price !== currentPrice && (
//                 <span className="price-difference">
//                   ({((trader.price - currentPrice) / currentPrice * 100).toFixed(2)}% {trader.price > currentPrice ? "above" : "below"} market)
//                 </span>
//               )}
//             </span>
//           </div>

//           <TradingLimitsInfo
//             minLimit={trader.minLimit}
//             maxLimit={trader.maxLimit}
//             currency={trader.currency}
//           />

//           {tradeType === "buy" && (
//             <div className="trader-info-row">
//               <span className="label">Available:</span>
//               <span className="value">
//                 <strong>{trader.cryptoAmountAvailable.toFixed(2)} {cryptoSymbol}</strong>
//               </span>
//             </div>
//           )}
//         </div>

//         <div className="amount-input-section">
//           <div className="input-group">
//             <label>Amount in {trader.currency}:</label>
//             <div className="input-with-actions">
//               <input
//                 type="text"
//                 inputMode="decimal"
//                 value={amount}
//                 onChange={handleAmountChange}
//                 placeholder={`${formatCurrency(trader.minLimit, trader.currency, true)} - ${formatCurrency(trader.maxLimit, trader.currency, true)}`}
//                 className={`amount-input ${inputError ? "invalid" : ""}`}
//                 autoFocus
//                 disabled={isLoading}
//               />
//               <div className="quick-amounts">
//                 {[trader.minLimit, Math.round((trader.minLimit + trader.maxLimit) / 2), trader.maxLimit].map((quickAmount) => (
//                   <button
//                     key={quickAmount}
//                     onClick={() => handleQuickAmount(quickAmount)}
//                     className="quick-amount-btn"
//                     disabled={isLoading}
//                   >
//                     {formatCurrency(quickAmount, trader.currency, true)}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             {inputError && <div className="error-message">{inputError}</div>}
//           </div>

//           <div className="conversion-display">
//             <span>You will {tradeType === "buy" ? "receive" : "send"}:</span>
//             <strong>
//               {cryptoAmount.toFixed(2)} {cryptoSymbol}
//             </strong>
//             <span className="exchange-rate">
//               (1 {cryptoSymbol} = {formatCurrency(trader.price || currentPrice, trader.currency)})
//             </span>
//           </div>
//         </div>

//         {isVerifying && !verificationComplete ? (
//           <SecurityVerification
//             onComplete={() => {
//               setVerificationComplete(true);
//               confirmTrade();
//             }}
//             onCancel={() => setIsVerifying(false)}
//           />
//         ) : (
//           <div className="action-buttons">
//             <button
//               className="proceed-btn"
//               onClick={handleProceed}
//               disabled={!amount || !!inputError || isLoading}
//             >
//               {verificationComplete ? "Confirm Trade" : "Verify and Proceed"}
//             </button>
//             <button
//               className="cancel-btn"
//               onClick={() => navigate("/market")}
//               disabled={isLoading}
//             >
//               Cancel
//             </button>

//           </div>
//         )}

//         <div className="security-info">
//           <div className="security-tip">
//             <span className="icon">🔒</span>
//             <span>All trades are protected by escrow</span>
//           </div>
//           <div className="security-tip">
//             <span className="icon">⚠️</span>
//             <span>Never share sensitive information outside the platform</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Amount;