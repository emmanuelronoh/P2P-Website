import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Amount.css";

const Amount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trader, tradeType, crypto } = location.state || {};
  const [amount, setAmount] = useState("");

  if (!trader) {
    return <p className="error">No trader selected. Please go back and choose a trader.</p>;
  }

  const handleProceed = () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    navigate("/messages", { state: { trader, tradeType, crypto, amount } });
  };

  return (
    <div className="amount-container">
      <div className="amount-card">
        <h2>{tradeType} {crypto.split(" - ")[0]}</h2>
        <p>Trader: <strong>{trader.name}</strong></p>
        <p>Payment Method: <strong>{trader.paymentMethod}</strong></p>
        <p>Price: <strong>{trader.price} KES</strong></p>
        <p>Limits: {trader.minLimit} - {trader.maxLimit} KES</p>

        <div className="input-group">
          <label>Enter Amount (KES):</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="button-group">
          <button className="proceed-btn" onClick={handleProceed}>Proceed to Chat</button>
          <button className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Amount;
