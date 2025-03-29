import { useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/Chat.css";

const Chat = () => {
  const location = useLocation();
  const { trader, tradeType, crypto, amount } = location.state || {};
  const [messages, setMessages] = useState([
    { text: `Hello! I want to ${tradeType.toLowerCase()} ${crypto} worth ${amount} KES.`, sender: "buyer", time: "Now" }
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, sender: "buyer", time: "Now" }]);
      setMessage("");
    }
  };

  if (!trader) {
    return <p>No trade selected.</p>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="trader-name">
          <img src="https://via.placeholder.com/40" alt={trader.name} />
          {trader.name}
        </div>
      </div>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
            <div className="message-time">{msg.time}</div>
          </div>
        ))}
      </div>

      <div className="chat-input-box">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="send-button" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
