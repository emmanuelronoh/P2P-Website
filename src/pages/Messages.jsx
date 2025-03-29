import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/Messages.css";

const Messages = () => {
  const location = useLocation();
  const { trader, tradeType = "", crypto = "", amount = 0 } = location.state || {};

  const [chats, setChats] = useState([
    { 
      id: 1, 
      trader: "Alice", 
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      messages: [
        { 
          text: "Hey, are you available?", 
          sender: "them", 
          status: "delivered",
          timestamp: new Date(Date.now() - 3600000)
        }
      ], 
      unread: true, 
      lastActive: "Active now" 
    },
    { 
      id: 2, 
      trader: "Bob", 
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      messages: [
        { 
          text: "Trade completed successfully!", 
          sender: "them", 
          status: "read",
          timestamp: new Date(Date.now() - 7200000)
        }
      ], 
      unread: false, 
      lastActive: "Last seen 2h ago" 
    }
  ]);

  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Only proceed if we have trader data
    if (trader?.name) {
      setChats(prevChats => {
        // Check if trader already exists in chats
        const existingChat = prevChats.find(chat => chat.trader === trader.name);
        
        if (!existingChat) {
          // Create new chat if it doesn't exist
          const newChat = {
            id: Date.now(), // More reliable ID generation
            trader: trader.name,
            avatar: trader.avatar || "https://randomuser.me/api/portraits/lego/1.jpg",
            messages: [{
              text: `Hello! I want to ${tradeType.toLowerCase()} ${crypto} worth ${amount} KES.`,
              sender: "me",
              status: "sent",
              timestamp: new Date()
            }],
            unread: false,
            lastActive: "Active now"
          };
          
          // Return new array with the added chat
          return [...prevChats, newChat];
        }
        
        // Return unchanged if chat already exists
        return prevChats;
      });
  
      // Set the selected chat to the trader's chat
      setSelectedChat(prevSelected => {
        // Find the existing chat in current state
        const existingChat = chats.find(chat => chat.trader === trader.name);
        
        return existingChat || {
          id: Date.now(),
          trader: trader.name,
          avatar: trader.avatar || "https://randomuser.me/api/portraits/lego/1.jpg",
          messages: [{
            text: `Hello! I want to ${tradeType.toLowerCase()} ${crypto} worth ${amount} KES.`,
            sender: "me",
            status: "sent",
            timestamp: new Date()
          }],
          unread: false,
          lastActive: "Active now"
        };
      });
    }
  }, [trader, tradeType, crypto, amount]); // Removed chats from dependencies
  const sendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const updatedMessage = {
        text: newMessage,
        sender: "me",
        status: "sent",
        timestamp: new Date()
      };
      
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat.id
            ? { 
                ...chat, 
                messages: [...chat.messages, updatedMessage],
                lastActive: "Active now"
              }
            : chat
        )
      );
      
      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, updatedMessage],
        lastActive: "Active now"
      }));
      
      setNewMessage("");
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="messages-app">
      <div className="conversation-list">
        <h2>Messages</h2>
        <div className="conversation-search">
          <input type="text" placeholder="Search messages..." />
        </div>
        <div className="conversation-items">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`conversation-item ${selectedChat?.id === chat.id ? 'active' : ''} ${chat.unread ? 'unread' : ''}`}
              onClick={() => {
                setSelectedChat(chat);
                // Mark as read when selected
                if (chat.unread) {
                  setChats(prev => 
                    prev.map(c => 
                      c.id === chat.id ? {...c, unread: false} : c
                    )
                  );
                }
              }}
            >
              <img src={chat.avatar} alt={chat.trader} className="conversation-avatar" />
              <div className="conversation-info">
                <div className="conversation-header">
                  <h3>{chat.trader}</h3>
                  <span className="conversation-time">
                    {formatTime(chat.messages[chat.messages.length - 1]?.timestamp)}
                  </span>
                </div>
                <p className="conversation-snippet">
                  {chat.messages[chat.messages.length - 1]?.text}
                </p>
                <div className="conversation-status">
                  <span className="last-active">{chat.lastActive}</span>
                  {chat.unread && <span className="unread-badge"></span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="message-area">
        {selectedChat ? (
          <>
            <div className="message-header">
              <img src={selectedChat.avatar} alt={selectedChat.trader} className="message-avatar" />
              <div>
                <h3>{selectedChat.trader}</h3>
                <p className="active-status">{selectedChat.lastActive}</p>
              </div>
            </div>
            
            <div className="message-container">
              <div className="message-list">
                {selectedChat.messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message-bubble ${msg.sender === 'me' ? 'outgoing' : 'incoming'}`}
                  >
                    <div className="message-content">
                      <p>{msg.text}</p>
                      <div className="message-meta">
                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                        {msg.sender === 'me' && (
                          <span className={`message-status ${msg.status}`}>
                            {msg.status === "read" ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="message-composer">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>Select a conversation</h3>
            <p>Choose a chat from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;