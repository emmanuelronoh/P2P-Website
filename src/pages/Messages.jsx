import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import "../styles/Messages.css";

const Messages = () => {
  const location = useLocation();
  const { trader, tradeType = "", crypto = "", amount = 0 } = location.state || {};
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [chats, setChats] = useState([
    { 
      id: 1, 
      trader: "Alice Johnson", 
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      status: "online",
      messages: [
        { 
          text: "Hey, are you available for a trade?", 
          sender: "them", 
          status: "delivered",
          timestamp: new Date(Date.now() - 3600000)
        },
        { 
          text: "I'd like to buy 0.5 BTC", 
          sender: "them", 
          status: "delivered",
          timestamp: new Date(Date.now() - 3500000)
        },
        { 
          text: "Yes, I'm available. What's your offer?", 
          sender: "me", 
          status: "read",
          timestamp: new Date(Date.now() - 3400000)
        }
      ], 
      unread: true, 
      lastActive: new Date(Date.now() - 300000)
    },
    { 
      id: 2, 
      trader: "Bob Smith", 
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      status: "offline",
      messages: [
        { 
          text: "Trade completed successfully!", 
          sender: "them", 
          status: "read",
          timestamp: new Date(Date.now() - 7200000)
        },
        { 
          text: "Thanks for the smooth transaction", 
          sender: "me", 
          status: "read",
          timestamp: new Date(Date.now() - 7100000)
        }
      ], 
      unread: false, 
      lastActive: new Date(Date.now() - 7200000)
    },
    { 
      id: 3, 
      trader: "Emma Wilson", 
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      status: "online",
      messages: [
        { 
          text: "Can we negotiate the price?", 
          sender: "them", 
          status: "read",
          timestamp: new Date(Date.now() - 86400000)
        }
      ], 
      unread: false, 
      lastActive: new Date(Date.now() - 3600000)
    }
  ]);

  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat, isTyping]);

  useEffect(() => {
    if (trader?.name) {
      setChats(prevChats => {
        const existingChat = prevChats.find(chat => chat.trader === trader.name);
        
        if (!existingChat) {
          const newChat = {
            id: Date.now(),
            trader: trader.name,
            avatar: trader.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
            status: "online",
            messages: [{
              text: `Hello! I want to ${tradeType.toLowerCase()} ${amount} ${crypto} for KES ${amount}.`,
              sender: "me",
              status: "sent",
              timestamp: new Date()
            }],
            unread: false,
            lastActive: new Date()
          };
          return [...prevChats, newChat];
        }
        return prevChats;
      });

      setSelectedChat(prevSelected => {
        const existingChat = chats.find(chat => chat.trader === trader.name);
        return existingChat || {
          id: Date.now(),
          trader: trader.name,
          avatar: trader.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
          status: "online",
          messages: [{
            text: `Hello! I want to ${tradeType.toLowerCase()} ${amount} ${crypto} for KES ${amount}.`,
            sender: "me",
            status: "sent",
            timestamp: new Date()
          }],
          unread: false,
          lastActive: new Date()
        };
      });
    }
  }, [trader, tradeType, crypto, amount]);

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a preview for the file
    let filePreview;
    if (file.type.startsWith('image/')) {
      filePreview = URL.createObjectURL(file);
    } else {
      filePreview = null;
    }

    const fileMessage = {
      text: file.name,
      sender: "me",
      status: "sent",
      timestamp: new Date(),
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        preview: filePreview
      }
    };

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChat.id
          ? { 
              ...chat, 
              messages: [...chat.messages, fileMessage],
              lastActive: new Date()
            }
          : chat
      )
    );

    setSelectedChat(prev => ({
      ...prev,
      messages: [...prev.messages, fileMessage],
      lastActive: new Date()
    }));

    // Simulate file upload and response
    setIsTyping(true);
    setTimeout(() => {
      const replyMessage = {
        text: getRandomFileResponse(file.type),
        sender: "them",
        status: "delivered",
        timestamp: new Date()
      };

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat.id
            ? { 
                ...chat, 
                messages: [...chat.messages, replyMessage],
                lastActive: new Date(),
                unread: true
              }
            : chat
        )
      );

      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, replyMessage],
        lastActive: new Date()
      }));

      setIsTyping(false);
    }, 2000 + Math.random() * 3000);
  };

  const getRandomFileResponse = (fileType) => {
    if (fileType.startsWith('image/')) {
      const responses = [
        "Nice picture!",
        "Thanks for sharing this image.",
        "I've received the image.",
        "This looks great!",
        "Image received successfully."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = [
        "File received, thanks!",
        "I'll check this document.",
        "Thanks for sending this over.",
        "File downloaded successfully.",
        "I've received the file."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

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
                lastActive: new Date()
              }
            : chat
        )
      );
      
      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, updatedMessage],
        lastActive: new Date()
      }));
      
      setNewMessage("");
      setShowEmojiPicker(false);
      
      // Simulate typing indicator and reply
      if (Math.random() > 0.3) {
        setIsTyping(true);
        setTimeout(() => {
          const replyMessage = {
            text: getRandomReply(),
            sender: "them",
            status: "delivered",
            timestamp: new Date()
          };
          
          setChats(prevChats =>
            prevChats.map(chat =>
              chat.id === selectedChat.id
                ? { 
                    ...chat, 
                    messages: [...chat.messages, replyMessage],
                    lastActive: new Date(),
                    unread: true
                  }
                : chat
            )
          );
          
          setSelectedChat(prev => ({
            ...prev,
            messages: [...prev.messages, replyMessage],
            lastActive: new Date()
          }));
          
          setIsTyping(false);
        }, 2000 + Math.random() * 3000);
      }
    }
  };

  const getRandomReply = () => {
    const replies = [
      "Sounds good to me!",
      "Let me think about that...",
      "Can we negotiate the price?",
      "I'll get back to you shortly.",
      "Perfect! When can we meet?",
      "Do you accept M-Pesa?",
      "What's your best offer?",
      "I'm interested, let's proceed.",
      "Can we do half now, half later?",
      "Are you available tomorrow?"
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return "";
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getActiveStatus = (date) => {
    if (!date) return "Long time ago";
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return "Active now";
    if (diffMinutes < 60) return `Active ${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `Active ${Math.floor(diffMinutes / 60)} hours ago`;
    return `Active ${Math.floor(diffMinutes / 1440)} days ago`;
  };

  const filteredChats = chats.filter(chat => 
    chat.trader.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.messages.some(msg => 
      msg.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const renderMessageContent = (msg) => {
    if (msg.file) {
      if (msg.file.type.startsWith('image/')) {
        return (
          <div className="file-message">
            <img src={msg.file.preview} alt={msg.file.name} className="file-preview" />
            <div className="file-info">
              <span className="file-name">{msg.file.name}</span>
              <span className="file-size">{(msg.file.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        );
      } else {
        return (
          <div className="file-message">
            <div className="file-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
              </svg>
            </div>
            <div className="file-info">
              <span className="file-name">{msg.file.name}</span>
              <span className="file-size">{(msg.file.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        );
      }
    }
    return <p>{msg.text}</p>;
  };

  return (
    <div className="messages-app">
      <div className="conversation-list">
        <div className="conversation-header">
          <h2>Messages</h2>
          <button className="new-chat-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        </div>
        
        <div className="conversation-search">
          <svg viewBox="0 0 24 24" width="18" height="18" className="search-icon">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>
        
        <div className="conversation-items">
          {filteredChats.map(chat => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            const isActive = selectedChat?.id === chat.id;
            
            return (
              <div
                key={chat.id}
                className={`conversation-item ${isActive ? 'active' : ''} ${chat.unread ? 'unread' : ''}`}
                onClick={() => {
                  setSelectedChat(chat);
                  if (chat.unread) {
                    setChats(prev => 
                      prev.map(c => 
                        c.id === chat.id ? {...c, unread: false} : c
                      )
                    );
                  }
                }}
              >
                <div className="avatar-container">
                  <img src={chat.avatar} alt={chat.trader} className="conversation-avatar" />
                  {chat.status === "online" && <span className="online-badge"></span>}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h3>{chat.trader}</h3>
                    <span className="conversation-time">
                      {formatTime(lastMessage?.timestamp)}
                    </span>
                  </div>
                  <p className="conversation-snippet">
                    {lastMessage?.text.length > 40 
                      ? `${lastMessage.text.substring(0, 40)}...` 
                      : lastMessage?.text}
                  </p>
                  <div className="conversation-footer">
                    <span className="last-active">{getActiveStatus(chat.lastActive)}</span>
                    {chat.unread && <span className="unread-badge"></span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="message-area">
        {selectedChat ? (
          <>
            <div className="message-header">
              <div className="header-left">
                <button className="back-button" onClick={() => setSelectedChat(null)}>
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                  </svg>
                </button>
                <div className="avatar-container">
                  <img src={selectedChat.avatar} alt={selectedChat.trader} className="message-avatar" />
                  {selectedChat.status === "online" && <span className="online-badge"></span>}
                </div>
                <div className="user-info">
                  <h3>{selectedChat.trader}</h3>
                  <p className="active-status">
                    {selectedChat.status === "online" ? "Online" : getActiveStatus(selectedChat.lastActive)}
                  </p>
                </div>
              </div>
              <div className="header-actions">
                <button className="action-btn">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="message-container">
              <div className="message-list">
                {selectedChat.messages.map((msg, index) => {
                  const showDateSeparator = index === 0 || 
                    formatDate(msg.timestamp) !== formatDate(selectedChat.messages[index - 1]?.timestamp);
                  
                  return (
                    <div key={index}>
                      {showDateSeparator && (
                        <div className="date-separator">
                          <span>{formatDate(msg.timestamp)}</span>
                        </div>
                      )}
                      <div 
                        className={`message-bubble ${msg.sender === 'me' ? 'outgoing' : 'incoming'}`}
                      >
                        <div className="message-content">
                          {renderMessageContent(msg)}
                          <div className="message-meta">
                            <span className="message-time">{formatTime(msg.timestamp)}</span>
                            {msg.sender === 'me' && (
                              <span className={`message-status ${msg.status}`}>
                                {msg.status === "read" ? (
                                  <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="currentColor" d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="message-bubble incoming">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="message-composer">
                <button 
                  className="emoji-btn"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-5-7h2a3 3 0 0 0 6 0h2a5 5 0 0 1-10 0zm1-2a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                  </svg>
                </button>
                
                {showEmojiPicker && (
                  <div className="emoji-picker-container">
                    <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={350} />
                  </div>
                )}
                
                <button 
                  className="attachment-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                  </svg>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </button>
                
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                
                <button 
                  className="send-btn" 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-illustration">
              <svg viewBox="0 0 24 24" width="80" height="80">
                <path fill="#d1d5db" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
            </div>
            <h3>Select a conversation</h3>
            <p>Choose a chat from the list or start a new one</p>
            <button className="start-chat-btn">Start New Chat</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;