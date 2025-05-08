
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmojiPicker from 'emoji-picker-react';
import { FiSearch, FiPlus, FiPaperclip, FiSmile, FiSend, FiCheck, FiChevronDown } from 'react-icons/fi';
import { BsCheck2All, BsThreeDotsVertical } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import '../styles/Messages.css';

const Messages = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [state, setState] = useState({
    chatRooms: [],
    currentChat: location.state?.chatRoomId ? {
      id: location.state.chatRoomId,
      counterparty: location.state.counterparty,
      tradeId: location.state.tradeId,
      orderDetails: location.state.orderDetails
    } : null,
    messages: [],
    newMessage: '',
    attachment: null,
    isTyping: false,
    typingUser: '',
    searchTerm: '',
    showEmojiPicker: false,
    isUploading: false,
    unreadCounts: {},
    isMobileView: window.innerWidth < 768,
    showChatList: window.innerWidth >= 768,
    showMobileMenu: false,
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
  });

  // Utility functions
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getActiveStatus = (dateString) => {
    if (!dateString) return "Long time ago";
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffMinutes < 1) return "Active now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  const loadChatRooms = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('https://cheetahx.onrender.com/chat-room/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      // Calculate unread counts
      const unreadCounts = {};
      data.forEach(room => {
        unreadCounts[room.id] = room.unread_count || 0;
      });

      setState(prev => ({
        ...prev,
        chatRooms: data,
        userId: user?.id,
        unreadCounts
      }));
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  }, [user]);

  const connectToChat = useCallback((chatRoomId) => {
    const token = localStorage.getItem('accessToken');
    const wsUrl = `ws://cheetahx.onrender.com/ws/chat/${chatRoomId}/?token=${token}`;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      loadMessages(chatRoomId);
      markMessagesAsRead(chatRoomId);
    };

    newSocket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        const handleChatMessage = () => {
          setState(prev => {
            // Parse and validate timestamp
            const parseTimestamp = (timestamp) => {
              try {
                // Handle both ISO strings and formatted strings
                if (typeof timestamp === 'string') {
                  // Try ISO format first
                  if (timestamp.includes('T')) {
                    return new Date(timestamp).toISOString();
                  }
                  // Try common formats
                  const formats = [
                    'yyyy-MM-dd HH:mm:ss',
                    'yyyy/MM/dd HH:mm:ss',
                    'MM/dd/yyyy HH:mm:ss'
                  ];

                  for (const format of formats) {
                    try {
                      const dt = new Date(timestamp);
                      if (!isNaN(dt.getTime())) {
                        return dt.toISOString();
                      }
                    } catch (e) {
                      continue;
                    }
                  }
                }
                return new Date().toISOString(); // Fallback to current time
              } catch (e) {
                console.warn('Failed to parse timestamp:', timestamp, e);
                return new Date().toISOString();
              }
            };

            const validatedTimestamp = parseTimestamp(data.message?.timestamp);
            const isOwnMessage = data.sender === prev.userId;
            const chatRoomId = data.chat_room_id || prev.currentChat?.id;

            // Check for optimistic update
            const existingMessageIndex = prev.messages.findIndex(
              msg => msg.id === data.temp_id ||
                (msg.text === data.message?.content &&
                  Math.abs(new Date(msg.time) - new Date(validatedTimestamp)) < 60000) // Within 1 minute
            );

            // Handle optimistic update
            if (existingMessageIndex >= 0) {
              const updatedMessages = [...prev.messages];
              updatedMessages[existingMessageIndex] = {
                ...updatedMessages[existingMessageIndex],
                id: data.message?.id || updatedMessages[existingMessageIndex].id,
                text: data.message?.content || updatedMessages[existingMessageIndex].text,
                time: validatedTimestamp,
                read: data.message?.read || false,
                attachments: data.message?.attachments ||
                  updatedMessages[existingMessageIndex].attachments || []
              };

              return {
                ...prev,
                messages: updatedMessages,
                isUploading: false,
                unreadCounts: {
                  ...prev.unreadCounts,
                  [chatRoomId]: isOwnMessage ? 0 : (prev.unreadCounts[chatRoomId] || 0) + 1
                }
              };
            }

            // New message
            return {
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: data.message?.id || Date.now().toString(),
                  sender: isOwnMessage ? 'me' : 'them',
                  text: data.message?.content || '',
                  time: validatedTimestamp,
                  read: data.message?.read || false,
                  attachments: data.message?.attachments || []
                }
              ],
              unreadCounts: {
                ...prev.unreadCounts,
                [chatRoomId]: isOwnMessage ? 0 : (prev.unreadCounts[chatRoomId] || 0) + 1
              }
            };
          });

          // Mark as read if needed
          if (state.currentChat?.id === data.chat_room_id && data.sender !== state.userId) {
            markMessagesAsRead(data.chat_room_id);
          }
        };

        const handleTyping = () => {
          setState(prev => ({
            ...prev,
            isTyping: Boolean(data.is_typing),
            typingUser: data.user || ''
          }));
        };

        const handleAttachment = () => {
          setState(prev => {
            if (!data.message_id || !data.attachment) return prev;

            return {
              ...prev,
              messages: prev.messages.map(msg => {
                if (msg.id !== data.message_id) return msg;

                const existingAttachment = msg.attachments?.find(a => a.id === data.attachment.id);
                const attachment = {
                  ...data.attachment,
                  file: data.attachment.file || existingAttachment?.file
                };

                return {
                  ...msg,
                  attachments: [
                    ...(msg.attachments || []).filter(a => a.id !== attachment.id),
                    attachment
                  ]
                };
              })
            };
          });
        };

        const handleMessageRead = () => {
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.sender === 'me' && !msg.read
                ? { ...msg, read: true }
                : msg
            )
          }));
        };

        // Route message types
        switch (data.type) {
          case 'chat_message':
            handleChatMessage();
            break;
          case 'typing':
            handleTyping();
            break;
          case 'attachment':
            handleAttachment();
            break;
          case 'message_read':
            handleMessageRead();
            break;
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error, e.data);
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    socketRef.current = newSocket;
  }, []);

  const loadMessages = useCallback(async (chatRoomId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `https://cheetahx.onrender.com/chat-room/${chatRoomId}/messages/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();

      setState(prev => ({
        ...prev,
        messages: data.map(msg => ({
          id: msg.id,
          sender: msg.sender.id === prev.userId ? 'me' : 'them',
          text: msg.content,
          time: msg.timestamp,
          read: msg.read,
          attachments: msg.attachments || []
        }))
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  const markMessagesAsRead = async (chatRoomId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(
        `https://cheetahx.onrender.com/chat-room/${chatRoomId}/mark-read/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setState(prev => ({
        ...prev,
        unreadCounts: {
          ...prev.unreadCounts,
          [chatRoomId]: 0
        }
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };


  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setState(prev => ({ ...prev, attachment: e.target.files[0] }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleTyping = () => {
    if (!socketRef.current || !state.currentChat?.id) return;

    // Send typing start event
    socketRef.current.send(JSON.stringify({
      type: 'typing',
      chat_room_id: state.currentChat.id,
      is_typing: true
    }));

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to send typing stop event
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.send(JSON.stringify({
        type: 'typing',
        chat_room_id: state.currentChat.id,
        is_typing: false
      }));
    }, 2000);
  };
  const sendMessage = useCallback(async () => {
    if (!state.newMessage.trim() && !state.attachment) return;
    const tempId = Date.now().toString();

    try {
      const token = localStorage.getItem('accessToken');
      const tempTimestamp = new Date().toISOString();

      // Generate thumbnail if needed
      let thumbnail = null;
      if (state.attachment?.type.startsWith('image/')) {
        thumbnail = await generateThumbnail(state.attachment);
      }

      // Create optimistic message with preview
      setState(prev => ({
        ...prev,
        isUploading: true,
        messages: [
          ...prev.messages,
          {
            id: tempId,
            sender: 'me',
            text: prev.newMessage.trim(),
            time: tempTimestamp,
            read: false,
            attachments: prev.attachment
              ? [{
                id: 'temp-' + tempId,
                url: URL.createObjectURL(prev.attachment),
                file_type: getFileType(prev.attachment.type),
                file_name: prev.attachment.name,
                file_size: prev.attachment.size,
                thumbnail: thumbnail,
                isOptimistic: true,
                uploadProgress: 0
              }]
              : []
          }
        ],
        newMessage: '',
        attachment: null,
        showEmojiPicker: false
      }));

      // Send text via WebSocket if available
      if (state.newMessage.trim() && socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: 'chat_message',
          chat_room_id: state.currentChat.id,
          message: state.newMessage.trim(),
          temp_id: tempId
        }));
      }

      // Handle attachment upload
      if (state.attachment) {
        // 1. Create message record
        const messageResponse = await fetch(
          `${API_BASE_URL}/chat-room/${state.currentChat.id}/messages/create/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              content: state.newMessage.trim() || ''
            })
          }
        );

        if (!messageResponse.ok) throw new Error('Failed to create message');
        const messageData = await messageResponse.json();

        // 2. Upload attachment with progress tracking
        const formData = new FormData();
        formData.append('file', state.attachment);
        formData.append('message_id', messageData.id);

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setState(prev => ({
              ...prev,
              messages: prev.messages.map(msg =>
                msg.id === tempId
                  ? {
                    ...msg,
                    attachments: msg.attachments.map(att => ({
                      ...att,
                      uploadProgress: progress
                    }))
                  }
                  : msg
              )
            }));
          }
        });

        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
              } else {
                reject(new Error('Upload failed'));
              }
            }
          };
        });

        xhr.open(
          'POST',
          `${API_BASE_URL}/chat-room/messages/${messageData.id}/attachments/`,
          true
        );
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);

        const attachmentData = await uploadPromise;

        // 3. Update message with server response
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === tempId
              ? {
                ...msg,
                id: messageData.id,
                attachments: [
                  {
                    ...attachmentData,
                    thumbnail: attachmentData.file_type === 'image'
                      ? attachmentData.thumbnail_url || attachmentData.url
                      : null,
                    uploadProgress: 100
                  }
                ]
              }
              : msg
          ),
          isUploading: false
        }));

        // 4. Notify via WebSocket
        if (socketRef.current) {
          socketRef.current.send(JSON.stringify({
            type: 'attachment_message',
            chat_room_id: state.currentChat.id,
            message_id: messageData.id,
            attachment: attachmentData
          }));
        }
      } else {
        // Text-only message complete
        setState(prev => ({ ...prev, isUploading: false }));
      }

      // Focus input after send
      messageInputRef.current?.focus();

    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        isUploading: false,
        messages: prev.messages.filter(msg => msg.id !== tempId),
        attachment: prev.attachment,
        newMessage: prev.newMessage
      }));
      showToast('Failed to send message: ' + error.message, 'error');
    }
  }, [state.newMessage, state.currentChat, state.attachment, state.userId]);

  // Helper functions remain the same
  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const generateThumbnail = async (file) => {
    if (!file.type.startsWith('image/')) return null;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const startNewChat = useCallback(async (order, tradeType) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        'https://cheetahx.onrender.com/chat-room/api/trades/initiate/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            order_id: order.id,
            trade_type: tradeType
          })
        }
      );
      const data = await response.json();

      setState(prev => ({
        ...prev,
        currentChat: {
          id: data.chat_room_id,
          counterparty: order.user,
          tradeId: data.trade_id,
          orderDetails: order
        },
        showChatList: false // On mobile, show chat after selection
      }));

      connectToChat(data.chat_room_id);
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  }, [connectToChat]);

  const handleResize = () => {
    setState(prev => ({
      ...prev,
      isMobileView: window.innerWidth < 768,
      showChatList: window.innerWidth >= 768
    }));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadChatRooms();

    if (state.currentChat?.id) {
      connectToChat(state.currentChat.id);
    }

    window.addEventListener('resize', handleResize);

    // Check for dark mode preference
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e) => {
      setState(prev => ({ ...prev, darkMode: e.matches }));
    };
    darkModeMediaQuery.addListener(handleDarkModeChange);

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      window.removeEventListener('resize', handleResize);
      darkModeMediaQuery.removeListener(handleDarkModeChange);
    };
  }, [isAuthenticated, navigate, loadChatRooms, state.currentChat, connectToChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  useEffect(() => {
    // Focus on input when chat changes
    if (messageInputRef.current && state.currentChat) {
      messageInputRef.current.focus();
    }
  }, [state.currentChat]);

  const filteredChats = state.chatRooms.filter(room => {
    const counterparty = room.buyer.id === user?.id ? room.seller : room.buyer;
    return (
      counterparty.username.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      room.last_message?.content?.toLowerCase().includes(state.searchTerm.toLowerCase())
    );
  });

  const renderAttachment = (attachment) => {
    // Determine if this is a temporary attachment (before upload completes)
    const isTempAttachment = attachment.id && attachment.id.startsWith('temp-');

    // Get the correct file URL based on attachment type
    const fileUrl = isTempAttachment ? attachment.file : attachment.file_url || attachment.file;

    // Get the filename - checking multiple possible sources
    const fileName = attachment.file_name ||
      (attachment.file && attachment.file.name) ||
      (fileUrl && fileUrl.split('/').pop()) ||
      'Unknown file';

    // Get the file type - with fallback to extension detection
    const fileType = attachment.file_type ||
      (fileName.includes('.') ? fileName.split('.').pop().toUpperCase() : 'FILE');

    // Handle click - with error prevention
    const handleClick = (e) => {
      e.stopPropagation();
      try {
        if (fileUrl) {
          // For temporary files, we can only open them if they're blobs
          if (isTempAttachment && typeof fileUrl === 'string' && fileUrl.startsWith('blob:')) {
            window.open(fileUrl, '_blank');
          }
          // For permanent files, use the proper URL
          else if (!isTempAttachment) {
            window.open(fileUrl, '_blank');
          }
        }
      } catch (error) {
        console.error('Error opening attachment:', error);
        // Optionally show a user-friendly error message
      }
    };

    // Image attachment
    if (fileType.toLowerCase() === 'image' ||
      (attachment.file && attachment.file.type.startsWith('image/'))) {
      return (
        <div className="attachment-image">
          <img
            src={fileUrl}
            alt={fileName}
            onClick={handleClick}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.png';
            }}
          />
          {isTempAttachment && (
            <div className="upload-indicator">
              <div className="spinner"></div>
              <span>Uploading...</span>
            </div>
          )}
        </div>
      );
    }

    // PDF attachment
    if (fileType.toLowerCase() === 'pdf') {
      return (
        <div className="attachment-pdf" onClick={handleClick}>
          <div className="pdf-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm-1.27 1.196c-.235 0-.367.018-.367.045v.566c0 .027.135.045.367.045.351 0 .556-.18.556-.477 0-.213-.146-.379-.556-.379zm-2.16-.13c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm10.043-.933c0-.522-.354-.77-.938-.77h-.888v2.535h.888c.584 0 .938-.248.938-.765zm-1.004-.114h1.525v-.539h-1.525v.539zm4.126-5.593h-7.456v12.796h7.456V9.149zm-1.357 11.47h-4.762V10.576h4.762v9.995zm-12.698-9.995h1.531v9.995h-1.531V10.576zm-2.691 0h1.531v9.995H4.631V10.576zm16.437 0h1.531v9.995h-1.531V10.576z" />
            </svg>
          </div>
          <div className="file-info">
            <span className="file-name">{fileName}</span>
            <span className="file-type">PDF</span>
          </div>
        </div>
      );
    }

    // Document attachment (Word, Excel, etc)
    const documentTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    if (documentTypes.includes(fileType.toLowerCase())) {
      return (
        <div className="attachment-document" onClick={handleClick}>
          <div className="document-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
            </svg>
          </div>
          <div className="file-info">
            <span className="file-name">{fileName}</span>
            <span className="file-type">{fileType.toUpperCase()}</span>
          </div>
        </div>
      );
    }

    // Video attachment
    if (fileType.toLowerCase() === 'video' ||
      (attachment.file && attachment.file.type.startsWith('video/'))) {
      return (
        <div className="attachment-video" onClick={handleClick}>
          <div className="video-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          </div>
          <div className="file-info">
            <span className="file-name">{fileName}</span>
            <span className="file-type">VIDEO</span>
          </div>
        </div>
      );
    }

    // Audio attachment
    if (fileType.toLowerCase() === 'audio' ||
      (attachment.file && attachment.file.type.startsWith('audio/'))) {
      return (
        <div className="attachment-audio" onClick={handleClick}>
          <div className="audio-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            </svg>
          </div>
          <div className="file-info">
            <span className="file-name">{fileName}</span>
            <span className="file-type">AUDIO</span>
          </div>
        </div>
      );
    }

    // Default file attachment
    return (

      <div className="attachment-file" onClick={handleClick}>
        <div className="file-icon">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
          </svg>
        </div>
        <div className="file-info">
          <span className="file-name">{fileName}</span>
          <span className="file-type">{fileType.toUpperCase()}</span>
          {isTempAttachment && (
            <div className="upload-progress">
              <div className="progress-bar"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const onEmojiClick = (emojiData) => {
    setState(prev => ({
      ...prev,
      newMessage: prev.newMessage + emojiData.emoji,
      showEmojiPicker: false
    }));
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  const ActionDropdown = ({ chatRoomId }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const handleClickOutside = useCallback((e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }, []);

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    const handleMarkAsPaid = () => {
      // Implement actual mark as paid functionality
      toast.success("Marked as paid. Waiting for confirmation.");
      setShowMenu(false);
      
      // Navigate to the review page
      navigate('/give-review');
    };

    const handleOpenDispute = () => {
      // Implement actual dispute functionality
      toast.info("Dispute opened. Our team will contact you shortly.");
      setShowMenu(false);
    };

    const handleReport = () => {
      // Implement actual report functionality
      toast.warn("User reported. Our team will review the case.");
      setShowMenu(false);
    };


    return (

      <div className="action-dropdown-container" ref={menuRef}>
        <button
          className="menu-button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(prev => !prev);
          }}
        >
          <BsThreeDotsVertical size={20} />
        </button>

        {showMenu && (
          <div className="dropdown-menu">
            <button
              className="dropdown-item"
              onClick={handleMarkAsPaid}
            >
              I have paid
            </button>
            <button
              className="dropdown-item"
              onClick={handleOpenDispute}
            >
              Open dispute
            </button>
            <button
              className="dropdown-item danger"
              onClick={handleReport}
            >
              Report seller
            </button>
          </div>
        )}
      </div>
    );
  };




  return (
    <div className={`messages-app ${state.darkMode ? 'dark-mode' : ''}`}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={state.darkMode ? "dark" : "light"}
      />
      {/* Mobile header */}
      {state.isMobileView && (
        <div className="mobile-header">
          {state.currentChat && !state.showChatList ? (
            <div className="mobile-chat-header">
              <button
                className="back-button"
                onClick={() => setState(prev => ({ ...prev, showChatList: true }))}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
              <div className="user-info">
                <h3>{state.currentChat.counterparty.username}</h3>
                <p className="active-status">
                  {state.isTyping ? "Typing..." : "Online"}
                </p>
              </div>
              {/* Use the ActionDropdown component here */}
              <ActionDropdown chatRoomId={state.currentChat.id} />
            </div>
          ) : (
            <div className="mobile-list-header">
              <h2>Messages</h2>
              <button
                className="new-chat-btn"
                onClick={() => navigate('/fiat-p2p')}
              >
                <FiPlus size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="messages-container">
        {/* Conversation list */}
        {(state.showChatList || !state.isMobileView) && (
          <div className="conversation-list">
            <div className="conversation-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search messages..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
            </div>

            <div className="conversation-items">
              {filteredChats.length > 0 ? (
                filteredChats.map(room => {
                  const counterparty = room.buyer.id === user?.id ? room.seller : room.buyer;
                  const isActive = state.currentChat?.id === room.id;
                  const unreadCount = state.unreadCounts[room.id] || 0;

                  return (
                    <div
                      key={room.id}
                      className={`conversation-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setState(prev => ({
                          ...prev,
                          currentChat: {
                            id: room.id,
                            counterparty,
                            tradeId: room.trade_id,
                            orderDetails: room.order_details
                          },
                          showChatList: false // On mobile, show chat after selection
                        }));
                        connectToChat(room.id);
                        markMessagesAsRead(room.id);
                      }}
                    >
                      <div className="avatar-container">
                        <img
                          src={counterparty.profile_picture || 'https://i.ibb.co/PsXqD7Xd/groom-6925756.png'}
                          alt={counterparty.username}
                          className="conversation-avatar"
                        />
                        {room.is_online && <span className="online-badge"></span>}
                      </div>
                      <div className="conversation-info">
                        <div className="conversation-header">
                          <h3>{counterparty.username}</h3>
                          <span className="conversation-time">
                            {formatTime(room.last_message?.timestamp)}
                          </span>
                        </div>
                        <p className="conversation-snippet">
                          {room.last_message?.content?.substring(0, 40) || 'No messages yet'}
                          {room.last_message?.attachments?.length > 0 && ' 📎'}
                        </p>
                        <div className="conversation-footer">
                          <span className="last-active">
                            {room.is_online ? 'Online' : getActiveStatus(room.last_message?.timestamp)}
                          </span>
                          {unreadCount > 0 && (
                            <span className="unread-badge">{unreadCount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-conversations">
                  <p>No conversations found</p>
                  <button
                    className="start-chat-btn"
                    onClick={() => navigate('/fiat-p2p')}
                  >
                    Start New Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message area */}
        <div className={`message-area ${!state.currentChat ? 'empty' : ''}`}>
          {state.currentChat ? (
            <>
              {!state.isMobileView && (
                <div className="message-header">
                  <div className="header-left">
                    <div className="avatar-container">
                      <img
                        src={state.currentChat.counterparty.profile_picture || 'https://i.ibb.co/PsXqD7Xd/groom-6925756.png'}
                        alt={state.currentChat.counterparty.username}
                        className="message-avatar"
                      />
                      <span className="online-badge"></span>
                    </div>
                    <div className="user-info">
                      <h3>{state.currentChat.counterparty.username}</h3>
                      <p className="active-status">
                        {state.isTyping ? "Typing..." : "Online"}
                      </p>
                    </div>
                  </div>
                  <div className="header-right">
                    <div className="trade-details">
                      Trade #{state.currentChat.tradeId}
                    </div>
                    <ActionDropdown chatRoomId={state.currentChat.id} />
                  </div>
                </div>
              )}

              <div className="message-container">
                <div className="message-list">
                  {state.messages.length > 0 ? (
                    state.messages.map((msg, index) => {
                      const showDateSeparator = index === 0 ||
                        formatDate(msg.time) !== formatDate(state.messages[index - 1]?.time);

                      return (
                        <div key={msg.id || index} className="message-group">
                          {showDateSeparator && (
                            <div className="date-separator">
                              <span>{formatDate(msg.time)}</span>
                            </div>
                          )}
                          <div className={`message-bubble ${msg.sender === 'me' ? 'outgoing' : 'incoming'}`}>
                            <div className="message-content">
                              {msg.text && <p>{msg.text}</p>}
                              {msg.attachments?.length > 0 && (
                                <div className="message-attachments">
                                  {msg.attachments.map(attachment => (
                                    <div key={attachment.id} className="attachment-container">
                                      {renderAttachment(attachment)}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="message-meta">
                                <span className="message-time">{formatTime(msg.time)}</span>
                                {msg.sender === 'me' && (
                                  <span className={`message-status ${msg.read ? 'read' : 'delivered'}`}>
                                    {msg.read ? <BsCheck2All size={16} /> : <FiCheck size={16} />}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-conversation">
                      <p>No messages yet</p>
                      <p>Start the conversation with {state.currentChat.counterparty.username}</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="message-composer">
                  {state.showEmojiPicker && (
                    <div className="emoji-picker-container">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        width="100%"
                        height={300}
                        skinTonesDisabled
                        searchDisabled
                        previewConfig={{ showPreview: false }}
                        theme={state.darkMode ? 'dark' : 'light'}
                      />
                    </div>
                  )}

                  {state.attachment && (
                    <div className="attachment-preview">
                      <div className="attachment-info">
                        <span>{state.attachment.name}</span>
                        <span className="file-size">
                          {(state.attachment.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        className="remove-attachment"
                        onClick={() => setState(prev => ({ ...prev, attachment: null }))}
                      >
                        <IoClose size={18} />
                      </button>
                    </div>
                  )}

                  <div className="composer-inputs">
                    <button
                      className="emoji-btn"
                      onClick={() => setState(prev => ({ ...prev, showEmojiPicker: !prev.showEmojiPicker }))}
                      disabled={state.isUploading}
                    >
                      <FiSmile size={22} />
                    </button>

                    <button
                      className="attachment-btn"
                      onClick={triggerFileInput}
                      disabled={state.isUploading}
                    >
                      <FiPaperclip size={22} />
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      accept="image/*, .pdf, .doc, .docx, .txt"
                    />

                    <input
                      type="text"
                      ref={messageInputRef}
                      placeholder={state.attachment ? state.attachment.name : "Type a message..."}
                      value={state.newMessage}
                      onChange={(e) => {
                        setState(prev => ({ ...prev, newMessage: e.target.value }));
                        handleTyping();
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={state.isUploading}
                    />

                    <button
                      className="send-btn"
                      onClick={sendMessage}
                      disabled={(!state.newMessage.trim() && !state.attachment) || state.isUploading}
                    >
                      {state.isUploading ? (
                        <div className="spinner"></div>
                      ) : (
                        <FiSend size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-illustration">
                <svg viewBox="0 0 24 24" width="80" height="80">
                  <path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                </svg>
              </div>
              <h3>No conversation selected</h3>
              <p>Choose a chat from the list or start a new one</p>
              <button
                className="start-chat-btn"
                onClick={() => navigate('/fiat-p2p')}
              >
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
