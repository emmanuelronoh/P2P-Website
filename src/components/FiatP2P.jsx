import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaShieldAlt, FaExchangeAlt, FaBell, FaFilter, FaChartLine, FaRegClock, FaLock, FaCheckCircle, FaRegCommentDots } from 'react-icons/fa';
import { MdPayment, MdAccountBalance, MdAttachMoney } from 'react-icons/md';
import { RiRefund2Fill } from 'react-icons/ri';
import { BsArrowLeftRight, BsThreeDotsVertical } from 'react-icons/bs';
import '../styles/fiatP2P.css';
import axios from 'axios';
import { useAuth, loadData } from '../contexts/AuthContext';


const FiatP2P = () => {
    const { isAuthenticated, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [state, setState] = useState({
        userBalance: {
            fiat: 12500.75,
            crypto: 2.4567,
            currency: 'USD',
            cryptoCurrency: 'Ksh'
        },
        activeTab: 'buy',
        orders: [],
        userOrders: [],
        paymentMethods: [],
        selectedPayment: '',
        amount: '',
        price: '',
        filter: {
            currency: 'USD',
            paymentMethod: 'all',
            amountRange: [0, 10000],
            sortBy: 'price',
            sortOrder: 'asc'
        },
        showAdvancedFilters: false,
        notificationCount: 3,
        tradeInProgress: null,
        chatOpen: false,
        currentChat: null,
        messages: [],
        newMessage: '',
        twoFactorAuth: true,
        kycVerified: true,
        showOrderDetails: null,
        priceTrends: {},
        marketStats: {},
        securityDeposit: 0,
        selectedOrderType: 'limit',
        orderExpiry: '24h',
        termsAccepted: false,
        showTutorial: false,
        activeStep: 0
    });
    // Add these new state variables
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState('');
    const [unreadMessages, setUnreadMessages] = useState({});

    useEffect(() => {
        if (!isAuthenticated || !state.currentChat?.id) return;

        const token = localStorage.getItem('accessToken');
        const wsUrl = `ws://localhost:8001/ws/chat/${state.currentChat.id}/?token=${token}`;

        const newSocket = new WebSocket(wsUrl);

        newSocket.onopen = () => {
            console.log('WebSocket connected');
            setSocket(newSocket);
        };

        newSocket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            handleWebSocketMessage(data);
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        newSocket.onclose = () => {
            console.log('WebSocket disconnected');
            // Attempt to reconnect after a delay
            setTimeout(() => {
                if (!socket) {
                    setSocket(new WebSocket(wsUrl));
                }
            }, 5000);
        };

        return () => {
            if (newSocket.readyState === WebSocket.OPEN) {
                newSocket.close();
            }
        };
    }, [isAuthenticated, state.currentChat?.id]);

    const handleTyping = () => {
        if (!socket || !state.currentChat?.id) return;

        try {
            const typingData = {
                type: 'typing',
                chat_room_id: state.currentChat.id,
                is_typing: true
            };

            socket.send(JSON.stringify(typingData));

            // Set a timeout to send 'stopped typing' after 3 seconds of inactivity
            clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    const stopTypingData = {
                        type: 'typing',
                        chat_room_id: state.currentChat.id,
                        is_typing: false
                    };
                    socket.send(JSON.stringify(stopTypingData));
                }
            }, 3000);
        } catch (error) {
            console.error('Error sending typing indicator:', error);
        }
    };

    // Add this near your other useRef declarations
    const typingTimeout = useRef(null);

    // Also make sure to clear the timeout when component unmounts
    useEffect(() => {
        return () => {
            if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
            }
        };
    }, []);

    const sendMessage = async () => {
        if (!state.newMessage.trim() || !socket || !state.currentChat) return;

        try {
            const messageData = {
                type: 'chat_message',
                chat_room_id: state.currentChat.id,
                message: state.newMessage.trim()
            };

            // Optimistically add to UI
            const newMsg = {
                id: `temp-${Date.now()}`,
                sender: 'me',
                text: state.newMessage.trim(),
                time: new Date().toISOString(),
                read: false
            };

            setState(prev => ({
                ...prev,
                messages: [...prev.messages, newMsg],
                newMessage: ''
            }));

            // Send via WebSocket
            socket.send(JSON.stringify(messageData));

        } catch (error) {
            console.error('Error sending message:', error);
            // Remove optimistic message if failed
            setState(prev => ({
                ...prev,
                messages: prev.messages.filter(msg => msg.id !== newMsg.id)
            }));
        }
    };

    const handleTrade = async (order) => {
        if (!state.kycVerified && order.verificationLevel > 1) {
            alert('This trader requires KYC verification to trade. Please complete your verification first.');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');

            // Create or get existing chat room
            const response = await axios.post(
                'http://localhost:8000/chat-room/',
                {
                    trade_id: order.id,
                    seller_id: order.userId,
                    trade_type: state.activeTab
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const chatRoom = response.data;

            // Navigate to messages page with the chat room ID
            navigate(`/chat-room-fiat?chatId=${chatRoom.id}`);

        } catch (error) {
            console.error('Error initiating chat:', error);
            if (error.response?.status === 400 && error.response?.data?.chat_room_id) {
                // Chat room already exists - navigate to it
                navigate(`/chat-room-fiat?chatId=${error.response.data.chat_room_id}`);
            } else {
                alert(`Failed to start chat: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    const connectToExistingChat = async (chatRoomId, order) => {
        try {
            const token = localStorage.getItem('accessToken');

            // Get chat room details
            const response = await axios.get(
                `http://localhost:8000/chat-room/${chatRoomId}/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const chatRoom = response.data;

            // Connect to WebSocket
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `ws://localhost:8001/ws/chat/${chatRoomId}/`;
            const newSocket = new WebSocket(wsUrl);

            newSocket.onopen = () => {
                console.log('WebSocket connected to existing chat');
                setSocket(newSocket);

                newSocket.onmessage = (e) => {
                    const data = JSON.parse(e.data);
                    handleWebSocketMessage(data);
                };

                loadMessages(chatRoomId);
            };

            setState(prev => ({
                ...prev,
                chatOpen: true,
                currentChat: {
                    id: chatRoomId,
                    counterparty: order.user,
                    orderId: order.id
                },
                messages: [],
                socket: newSocket
            }));

        } catch (error) {
            console.error('Error connecting to existing chat:', error);
            alert('Failed to connect to existing chat. Please try again.');
        }
    };

    const handleWebSocketMessage = (data) => {
        if (!data) return;

        try {
            switch (data.type) {
                case 'chat_message':
                    setState(prev => ({
                        ...prev,
                        messages: [...prev.messages, {
                            id: data.message?.id || Date.now(),
                            sender: data.sender === state.userId ? 'me' : 'them',
                            text: data.message?.content || data.message?.text || '',
                            time: data.message?.timestamp || new Date().toISOString(),
                            read: true
                        }]
                    }));
                    break;

                case 'typing':
                    setIsTyping(data.is_typing);
                    setTypingUser(data.user || '');
                    break;

                case 'error':
                    console.error('WebSocket error:', data.message);
                    break;

                default:
                    console.log('Unknown message type:', data);
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    };

    const loadMessages = async (chatRoomId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(
                `http://localhost:8000/chat-room/${chatRoomId}/messages/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setState(prev => ({
                ...prev,
                messages: response.data.map(msg => ({
                    id: msg.id,
                    sender: msg.sender.id === state.userId ? 'me' : 'them',
                    text: msg.content,
                    time: msg.timestamp,
                    read: msg.read
                }))
            }));
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const messagesEndRef = useRef(null);
    const orderFormRef = useRef(null);



    useEffect(() => {
        const loadData = async () => {
            if (authLoading || !isAuthenticated) return;

            try {
                const token = localStorage.getItem('accessToken');

                if (!token) {
                    navigate('/login');
                    return;
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const [ordersResponse, paymentMethodsResponse, userOrdersResponse, priceTrendsResponse, marketStatsResponse] =
                    await Promise.all([
                        axios.get('http://localhost:8000/escrow/orders/', { headers }),
                        axios.get('http://localhost:8000/escrow/payment-methods/', { headers }),
                        axios.get('http://localhost:8000/escrow/user-orders/', { headers }),
                        axios.get('http://localhost:8000/escrow/price-trends/', { headers }),
                        axios.get('http://localhost:8000/escrow/market-stats/', { headers })
                    ]);


                const transformedOrders = ordersResponse.data.map(order => {
                    let userDisplay;
                    let userId;

                    if (typeof order.user === 'object') {
                        userDisplay = order.user.username || order.user.email || String(order.user.id);
                        userId = order.user.id;  // Capture the user ID
                    } else {
                        userDisplay = order.user || 'Unknown';
                        userId = null;
                    }


                    // Handle payment methods safely
                    const paymentMethods = Array.isArray(order.payment_methods)
                        ? order.payment_methods.map(pm =>
                            typeof pm === 'object' ? pm.name : String(pm)
                        )
                        : [];

                    return {
                        id: order.id,
                        userId,
                        type: order.order_type || 'buy', // Default to 'buy' if missing
                        user: userDisplay,
                        amount: parseFloat(order.amount) || 0,
                        available: parseFloat(order.available) || 0,
                        price: parseFloat(order.price) || 0,
                        currency: order.currency || 'USD',
                        cryptoCurrency: order.crypto_currency || 'BTC',
                        paymentMethods,
                        limit: order.min_limit && order.max_limit
                            ? `${order.min_limit}-${order.max_limit} ${order.currency || 'USD'}`
                            : 'N/A',
                        rating: parseFloat(order.rating) || 0,
                        trades: order.trades_count || 0,
                        completionRate: parseFloat(order.completion_rate) || 0,
                        avgReleaseTime: order.avg_release_time || 'N/A',
                        terms: order.terms || '',
                        online: Boolean(order.is_online),
                        verificationLevel: 2 // Default value
                    };
                });

                setState(prev => ({
                    ...prev,
                    orders: transformedOrders,
                    paymentMethods: paymentMethodsResponse.data,
                    userOrders: userOrdersResponse.data,
                    priceTrends: priceTrendsResponse.data,
                    marketStats: marketStatsResponse.data,
                    securityDeposit: 200
                }));

                // Debug logging
                console.log('Transformed orders:', transformedOrders);
                console.log('Raw orders response:', ordersResponse.data);
            } catch (error) {
                console.error('Error loading data:', error);
                if (error.response?.status === 401) {
                    logout();
                    navigate('/login');
                }
            }
        };

        loadData();
    }, [navigate, isAuthenticated, authLoading, logout]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.messages]);

    // Calculate order totals
    const calculateOrderTotal = () => {
        if (state.amount && state.price) {
            return (parseFloat(state.amount) * parseFloat(state.price)).toFixed(2);
        }
        return '0.00';
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!state.termsAccepted) {
            alert('You must accept the terms and conditions');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/login');
                return;
            }

            const orderData = {
                order_type: state.activeTab,
                amount: state.amount,
                price: state.price,
                currency: state.filter.currency,
                crypto_currency: state.userBalance.cryptoCurrency,
                payment_methods: [parseInt(state.selectedPayment)],
                min_limit: (state.activeTab === 'buy' ? '10.00' : '5.00'),
                max_limit: '10000.00',
                terms: state.selectedOrderType === 'limit' ?
                    `This is a limit order that expires in ${state.orderExpiry}` :
                    'This is a market order',
                avg_release_time: '15 minutes'
            };

            const response = await axios.post(
                'http://localhost:8000/escrow/orders/',
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Properly transform the backend response to match frontend structure
            const newOrder = {
                id: response.data.id,
                type: response.data.order_type,
                user: response.data.user?.username || 'You',
                amount: parseFloat(response.data.amount),
                available: parseFloat(response.data.available),
                price: parseFloat(response.data.price),
                currency: response.data.currency,
                cryptoCurrency: response.data.crypto_currency,
                paymentMethods: response.data.payment_methods.map(pm => pm.name),
                limit: response.data.limit_range || 'N/A',
                terms: response.data.terms,
                avgReleaseTime: response.data.avg_release_time,
                status: 'pending',
                date: new Date().toISOString()
            };

            setState(prev => ({
                ...prev,
                orders: [...prev.orders, newOrder],
                userOrders: [newOrder, ...prev.userOrders],
                amount: '',
                price: '',
                selectedPayment: '',
                showOrderDetails: newOrder.id
            }));

            // Scroll to the new order
            setTimeout(() => {
                const element = document.getElementById(`order-${newOrder.id}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);

        } catch (error) {
            console.error('Error creating order:', error);
            if (error.response?.status === 401) {
                logout();
                navigate('/login');
            } else {
                alert(`Failed to create order: ${error.response?.data?.error || error.message}`);
            }
        }
    };



    // Initial data load
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            loadData();
        }
    }, []);


    const markAsPaid = () => {
        setState(prev => ({
            ...prev,
            messages: [
                ...prev.messages,
                {
                    id: Date.now(),
                    sender: 'system',
                    text: 'You have marked this trade as paid. The seller will now release the crypto.',
                    time: new Date().toISOString()
                }
            ]
        }));
    };

    // Release crypto
    const releaseCrypto = () => {
        setState(prev => ({
            ...prev,
            messages: [
                ...prev.messages,
                {
                    id: Date.now(),
                    sender: 'system',
                    text: 'You have released the crypto to the buyer. Trade complete!',
                    time: new Date().toISOString()
                }
            ],
            tradeInProgress: null
        }));

        // Update the order status
        setTimeout(() => {
            setState(prev => ({
                ...prev,
                chatOpen: false
            }));
        }, 2000);
    };

    // Open dispute
    const openDispute = () => {
        setState(prev => ({
            ...prev,
            messages: [
                ...prev.messages,
                {
                    id: Date.now(),
                    sender: 'system',
                    text: 'A dispute has been opened. Our support team will review the case shortly.',
                    time: new Date().toISOString()
                }
            ]
        }));
    };

    // Cancel order
    const cancelOrder = (orderId) => {
        setState(prev => ({
            ...prev,
            userOrders: prev.userOrders.map(order =>
                order.id === orderId ? { ...order, status: 'cancelled' } : order
            )
        }));
    };

    // Filter orders based on current filters
    const filteredOrders = state.orders
        .filter(order => order.type === (state.activeTab === 'buy' ? 'sell' : 'buy'))
        .filter(order => state.filter.currency === 'all' || order.currency === state.filter.currency)
        .filter(order => state.filter.paymentMethod === 'all' ||
            order.paymentMethods.some(method =>
                state.paymentMethods.find(pm => pm.id === state.filter.paymentMethod)?.name === method
            ))
        .sort((a, b) => {
            if (state.filter.sortBy === 'price') {
                return state.filter.sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
            } else if (state.filter.sortBy === 'rating') {
                return state.filter.sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
            } else if (state.filter.sortBy === 'amount') {
                return state.filter.sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            }
            return 0;
        });

    // Calculate average price for market orders
    const calculateMarketPrice = () => {
        const relevantOrders = filteredOrders.filter(o => o.type === (state.activeTab === 'buy' ? 'sell' : 'buy'));
        if (relevantOrders.length === 0) return 0;

        const total = relevantOrders.reduce((sum, order) => sum + order.price, 0);
        return (total / relevantOrders.length).toFixed(4);
    };

    // Get payment method details
    const getPaymentMethodDetails = (id) => {
        return state.paymentMethods.find(m => m.id === id) || {};
    };

    // Start tutorial
    const startTutorial = () => {
        setState(prev => ({
            ...prev,
            showTutorial: true,
            activeStep: 0
        }));
    };

    // Next tutorial step
    const nextTutorialStep = () => {
        setState(prev => ({
            ...prev,
            activeStep: prev.activeStep + 1
        }));
    };

    // Prev tutorial step
    const prevTutorialStep = () => {
        setState(prev => ({
            ...prev,
            activeStep: prev.activeStep - 1
        }));
    };

    // Close tutorial
    const closeTutorial = () => {
        setState(prev => ({
            ...prev,
            showTutorial: false
        }));
    };

    // Tutorial steps
    const tutorialSteps = [
        {
            title: "Welcome to P2P Trading",
            content: "This tutorial will guide you through the process of buying and selling crypto with other users.",
            target: null
        },
        {
            title: "Buy/Sell Tabs",
            content: "Switch between buying and selling crypto using these tabs.",
            target: ".trading-tabs"
        },
        {
            title: "Order Book",
            content: "View available offers from other traders. You can filter and sort them to find the best deals.",
            target: ".orders-list"
        },
        {
            title: "Create Orders",
            content: "Place your own buy or sell orders that other traders can see and accept.",
            target: ".order-creation-section"
        },
        {
            title: "Your Orders",
            content: "Track all your active and past orders in this section.",
            target: ".user-orders-section"
        },
        {
            title: "Trade Chat",
            content: "When you initiate a trade, a secure chat opens where you can communicate with the other trader.",
            target: ".chat-container"
        }
    ];


    return (
        <div className="fiat-p2p-container">
            {/* Tutorial Modal */}
            {state.showTutorial && (
                <div className="tutorial-modal">
                    <div className="tutorial-content">
                        <h2>{tutorialSteps[state.activeStep].title}</h2>
                        <p>{tutorialSteps[state.activeStep].content}</p>
                        <div className="tutorial-progress">
                            {state.activeStep > 0 && (
                                <button onClick={prevTutorialStep} className="tutorial-nav-btn prev">
                                    Previous
                                </button>
                            )}
                            {state.activeStep < tutorialSteps.length - 1 ? (
                                <button onClick={nextTutorialStep} className="tutorial-nav-btn next">
                                    Next
                                </button>
                            ) : (
                                <button onClick={closeTutorial} className="tutorial-nav-btn finish">
                                    Finish Tutorial
                                </button>
                            )}
                        </div>
                        <div className="tutorial-steps">
                            {tutorialSteps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`step-indicator ${index === state.activeStep ? 'active' : ''}`}
                                    onClick={() => setState(prev => ({ ...prev, activeStep: index }))}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Trade Chat Modal */}
            {state.chatOpen && (
                <div className="chat-modal">
                    <div className="chat-container">
                        <div className="chat-header">
                            <h3>Trade with {state.currentChat?.counterparty}</h3>
                            <button
                                onClick={() => setState(prev => ({ ...prev, chatOpen: false }))}
                                className="close-chat"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="trade-details">
                            <div className="detail">
                                <span>Amount:</span>
                                <strong>{state.tradeInProgress.amount} {state.tradeInProgress.currency}</strong>
                            </div>
                            <div className="detail">
                                <span>Price:</span>
                                <strong>{state.tradeInProgress.price} {state.tradeInProgress.currency}/{state.tradeInProgress.cryptoCurrency}</strong>
                            </div>
                            <div className="detail">
                                <span>Total:</span>
                                <strong>{(state.tradeInProgress.amount * state.tradeInProgress.price).toFixed(2)} {state.tradeInProgress.cryptoCurrency}</strong>
                            </div>
                            <div className="detail">
                                <span>Payment:</span>
                                <strong>{state.tradeInProgress.paymentMethods.join(', ')}</strong>
                            </div>
                        </div>

                        <div className="trade-actions">
                            {state.activeTab === 'buy' ? (
                                <>
                                    <button onClick={markAsPaid} className="action-btn confirm">
                                        <FaCheckCircle /> I've Paid
                                    </button>
                                    <button onClick={openDispute} className="action-btn dispute">
                                        <RiRefund2Fill /> Open Dispute
                                    </button>
                                </>
                            ) : (
                                <button onClick={releaseCrypto} className="action-btn confirm">
                                    <FaCheckCircle /> Release Crypto
                                </button>
                            )}
                        </div>


                        <div className="messages-container">
                            {state.messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`message ${msg.sender === 'me' ? 'sent' : msg.sender === 'system' ? 'system' : 'received'}`}
                                >
                                    <div className="message-content">
                                        {msg.text}
                                    </div>
                                    <div className="message-time">
                                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.sender === 'me' && (
                                            <span className="read-status">
                                                {msg.read ? '✓✓' : '✓'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message typing-indicator">
                                    <div className="typing-content">
                                        {typingUser} is typing...
                                        <span className="typing-dots">
                                            <span>.</span>
                                            <span>.</span>
                                            <span>.</span>
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="message-input">
                            <input
                                type="text"
                                value={state.newMessage}
                                onChange={(e) => {
                                    setState(prev => ({ ...prev, newMessage: e.target.value }));
                                    handleTyping();
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type your message..."
                            />
                            <button onClick={sendMessage} className="send-btn">
                                Send
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {state.showOrderDetails && (
                <div className="order-details-modal">
                    <div className="order-details-content">
                        <button
                            onClick={() => setState(prev => ({ ...prev, showOrderDetails: null }))}
                            className="close-details"
                        >
                            &times;
                        </button>

                        {(() => {
                            const order = state.userOrders.find(o => o.id === state.showOrderDetails);
                            if (!order) return null;

                            return (
                                <>
                                    <h3>Order Details #{order.id}</h3>
                                    <div className="order-details-grid">
                                        <div className="detail">
                                            <span>Type:</span>
                                            <strong className={order.type}>{order.type}</strong>
                                        </div>
                                        <div className="detail">
                                            <span>Amount:</span>
                                            <strong>{order.amount} {order.currency}</strong>
                                        </div>
                                        <div className="detail">
                                            <span>Filled:</span>
                                            <strong>{order.filled} {order.currency}</strong>
                                        </div>
                                        <div className="detail">
                                            <span>Price:</span>
                                            <strong>{order.price} {order.currency}/{order.cryptoCurrency}</strong>
                                        </div>
                                        <div className="detail">
                                            <span>Total:</span>
                                            <strong>{(order.amount * order.price).toFixed(2)} {order.cryptoCurrency}</strong>
                                        </div>
                                        <div className="detail">
                                            <span>Status:</span>
                                            <strong className={`status-${order.status}`}>
                                                {order.status.replace('_', ' ')}
                                            </strong>
                                        </div>
                                        <div className="detail">
                                            <span>Payment Method:</span>
                                            <strong>{order.paymentMethod}</strong>
                                        </div>
                                        <div className="detail">
                                            <span>Date:</span>
                                            <strong>{new Date(order.date).toLocaleString()}</strong>
                                        </div>
                                        {order.counterparty && (
                                            <div className="detail">
                                                <span>Counterparty:</span>
                                                <strong>{order.counterparty}</strong>
                                            </div>
                                        )}
                                        <div className="detail">
                                            <span>Escrow:</span>
                                            <strong>{order.escrow ? 'Yes' : 'No'}</strong>
                                        </div>
                                    </div>

                                    <div className="order-actions">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => cancelOrder(order.id)}
                                                className="cancel-order-btn"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                        {order.status === 'completed' && (
                                            <button className="leave-feedback-btn">
                                                <FaRegCommentDots /> Leave Feedback
                                            </button>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            <div className="fiat-p2p-content">
                <div className="trading-tabs">
                    <button
                        className={`tab-button ${state.activeTab === 'buy' ? 'active' : ''}`}
                        onClick={() => setState(prev => ({ ...prev, activeTab: 'buy' }))}
                    >
                        <MdAttachMoney /> Buy Fiat
                    </button>
                    <button
                        className={`tab-button ${state.activeTab === 'sell' ? 'active' : ''}`}
                        onClick={() => setState(prev => ({ ...prev, activeTab: 'sell' }))}
                    >
                        <MdAttachMoney /> Sell Fiat
                    </button>
                </div>

                <div className="main-content-grid">
                    <div className="order-creation-section">
                        <div className="section-header">
                            <h2>
                                {state.activeTab === 'buy' ? 'Buy' : 'Sell'} {state.userBalance.cryptoCurrency}
                                <span className="order-type-toggle">
                                    <button
                                        className={`type-btn ${state.selectedOrderType === 'limit' ? 'active' : ''}`}
                                        onClick={() => setState(prev => ({ ...prev, selectedOrderType: 'limit' }))}
                                    >
                                        Limit Order
                                    </button>
                                    <button
                                        className={`type-btn ${state.selectedOrderType === 'market' ? 'active' : ''}`}
                                        onClick={() => setState(prev => ({ ...prev, selectedOrderType: 'market' }))}
                                    >
                                        Market Order
                                    </button>
                                </span>
                            </h2>
                        </div>

                        <form onSubmit={handleCreateOrder} className="order-form" ref={orderFormRef}>
                            {state.selectedOrderType === 'market' && (
                                <div className="market-price-info">
                                    <span>Current Market Price:</span>
                                    <strong>{calculateMarketPrice()} {state.filter.currency}/{state.userBalance.cryptoCurrency}</strong>
                                </div>
                            )}

                            <div className="form-group">
                                <label>
                                    Amount ({state.filter.currency})
                                    {state.selectedOrderType === 'limit' && (
                                        <span className="hint">(Min: {state.activeTab === 'buy' ? '10' : '5'} {state.filter.currency})</span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    value={state.amount}
                                    onChange={(e) => setState(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder={`Enter amount in ${state.filter.currency}`}
                                    min={state.activeTab === 'buy' ? 10 : 5}
                                    required
                                />
                            </div>

                            {state.selectedOrderType === 'limit' && (
                                <div className="form-group">
                                    <label>Price ({state.filter.currency}/{state.userBalance.cryptoCurrency})</label>
                                    <input
                                        type="number"
                                        value={state.price}
                                        onChange={(e) => setState(prev => ({ ...prev, price: e.target.value }))}
                                        placeholder={`Enter price per ${state.userBalance.cryptoCurrency}`}
                                        step="0.0001"
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Payment Method</label>
                                <select
                                    value={state.selectedPayment}
                                    onChange={(e) => setState(prev => ({ ...prev, selectedPayment: e.target.value }))}
                                    required
                                >
                                    <option value="">Select payment method</option>
                                    {state.paymentMethods.map(method => (
                                        <option key={method.id} value={method.id}>
                                            {method.name} {method.fee > 0 ? `(${(method.fee * 100).toFixed(1)}% fee)` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {state.selectedPayment && (
                                <div className="payment-method-info">
                                    <div className="info-item">
                                        <span>Processing Time:</span>
                                        <strong>{getPaymentMethodDetails(state.selectedPayment).processingTime || 'N/A'}</strong>
                                    </div>
                                    {getPaymentMethodDetails(state.selectedPayment).fee > 0 && (
                                        <div className="info-item">
                                            <span>Fee:</span>
                                            <strong>{(getPaymentMethodDetails(state.selectedPayment).fee * 100).toFixed(1)}%</strong>
                                        </div>
                                    )}
                                    {getPaymentMethodDetails(state.selectedPayment).minAmount && (
                                        <div className="info-item">
                                            <span>Min Amount:</span>
                                            <strong>{getPaymentMethodDetails(state.selectedPayment).minAmount} {state.filter.currency}</strong>
                                        </div>
                                    )}
                                </div>
                            )}

                            {state.selectedOrderType === 'limit' && (
                                <div className="form-group">
                                    <label>Order Expiry</label>
                                    <select
                                        value={state.orderExpiry}
                                        onChange={(e) => setState(prev => ({ ...prev, orderExpiry: e.target.value }))}
                                    >
                                        <option value="1h">1 Hour</option>
                                        <option value="6h">6 Hours</option>
                                        <option value="12h">12 Hours</option>
                                        <option value="24h">24 Hours</option>
                                        <option value="3d">3 Days</option>
                                        <option value="7d">7 Days</option>
                                    </select>
                                </div>
                            )}

                            <div className="order-summary">
                                <div className="summary-item">
                                    <span>Total {state.activeTab === 'buy' ? 'Cost' : 'Receive'}:</span>
                                    <strong>
                                        {calculateOrderTotal()} {state.activeTab === 'buy' ? state.userBalance.cryptoCurrency : state.filter.currency}
                                    </strong>
                                </div>
                                {state.securityDeposit > 0 && (
                                    <div className="summary-item">
                                        <span>Security Deposit:</span>
                                        <strong>{state.securityDeposit} {state.filter.currency}</strong>
                                    </div>
                                )}
                            </div>

                            <div className="terms-checkbox">
                                <input
                                    type="checkbox"
                                    id="terms-agree"
                                    checked={state.termsAccepted}
                                    onChange={(e) => setState(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                                />
                                <label htmlFor="terms-agree">
                                    I agree to the <a href="#">Terms of Service</a> and confirm that I'm not from a restricted jurisdiction.
                                </label>
                            </div>

                            <button type="submit" className="create-order-btn">
                                {state.selectedOrderType === 'market' ? (
                                    <>
                                        <FaExchangeAlt /> {state.activeTab === 'buy' ? 'Buy' : 'Sell'} Now at Market Price
                                    </>
                                ) : (
                                    <>
                                        <FaRegClock /> Place {state.activeTab === 'buy' ? 'Buy' : 'Sell'} Order
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="orders-section">
                        <div className="section-header">
                            <h2>Available {state.activeTab === 'buy' ? 'Sellers' : 'Buyers'}</h2>
                            <div className="section-actions">
                                <button
                                    className={`filter-btn ${state.showAdvancedFilters ? 'active' : ''}`}
                                    onClick={() => setState(prev => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }))}
                                >
                                    <FaFilter /> Filters
                                </button>
                            </div>
                        </div>

                        {state.showAdvancedFilters && (
                            <div className="advanced-filters">
                                <div className="filter-group">
                                    <label>Currency:</label>
                                    <select
                                        value={state.filter.currency}
                                        onChange={(e) => setState(prev => ({
                                            ...prev,
                                            filter: { ...prev.filter, currency: e.target.value }
                                        }))}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                        <option value="CAD">CAD</option>
                                        <option value="AUD">AUD</option>
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label>Payment Method:</label>
                                    <select
                                        value={state.filter.paymentMethod}
                                        onChange={(e) => setState(prev => ({
                                            ...prev,
                                            filter: { ...prev.filter, paymentMethod: e.target.value }
                                        }))}
                                    >
                                        <option value="all">All Methods</option>
                                        {state.paymentMethods.map(method => (
                                            <option key={method.id} value={method.id}>{method.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label>Amount Range:</label>
                                    <div className="range-inputs">
                                        <input
                                            type="number"
                                            value={state.filter.amountRange[0]}
                                            onChange={(e) => setState(prev => ({
                                                ...prev,
                                                filter: {
                                                    ...prev.filter,
                                                    amountRange: [
                                                        parseFloat(e.target.value) || 0,
                                                        prev.filter.amountRange[1]
                                                    ]
                                                }
                                            }))}
                                            placeholder="Min"
                                        />
                                        <span>to</span>
                                        <input
                                            type="number"
                                            value={state.filter.amountRange[1]}
                                            onChange={(e) => setState(prev => ({
                                                ...prev,
                                                filter: {
                                                    ...prev.filter,
                                                    amountRange: [
                                                        prev.filter.amountRange[0],
                                                        parseFloat(e.target.value) || 10000
                                                    ]
                                                }
                                            }))}
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <label>Sort By:</label>
                                    <select
                                        value={state.filter.sortBy}
                                        onChange={(e) => setState(prev => ({
                                            ...prev,
                                            filter: { ...prev.filter, sortBy: e.target.value }
                                        }))}
                                    >
                                        <option value="price">Price</option>
                                        <option value="rating">Rating</option>
                                        <option value="amount">Amount</option>
                                    </select>
                                    <button
                                        className="sort-order-btn"
                                        onClick={() => setState(prev => ({
                                            ...prev,
                                            filter: {
                                                ...prev.filter,
                                                sortOrder: prev.filter.sortOrder === 'asc' ? 'desc' : 'asc'
                                            }
                                        }))}
                                    >
                                        {state.filter.sortOrder === 'asc' ? '↑' : '↓'}
                                    </button>
                                </div>

                                <div className="filter-group">
                                    <label>Verification:</label>
                                    <select
                                        value={state.filter.verification}
                                        onChange={(e) => setState(prev => ({
                                            ...prev,
                                            filter: { ...prev.filter, verification: e.target.value }
                                        }))}
                                    >
                                        <option value="any">Any Level</option>
                                        <option value="1">Level 1+</option>
                                        <option value="2">Level 2+</option>
                                        <option value="3">Level 3</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="orders-list">
                            {filteredOrders.length === 0 ? (
                                <div className="no-orders">
                                    <p>No {state.activeTab === 'buy' ? 'sell' : 'buy'} orders matching your filters.</p>
                                    <button
                                        onClick={() => setState(prev => ({
                                            ...prev,
                                            filter: {
                                                currency: 'USD',
                                                paymentMethod: 'all',
                                                amountRange: [0, 10000]
                                            }
                                        }))}
                                        className="reset-filters-btn"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                filteredOrders.map(order => (
                                    <div key={order.id} className="order-card">
                                        <div className="order-header">
                                            <div className="trader-avatar">
                                                {order.avatar}
                                                {order.online && <span className="online-dot" />}
                                            </div>
                                            <div className="trader-info">
                                                <div className="trader-name-rating">
                                                    <span
                                                        className="trader-name"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (order.userId) {
                                                                navigate(`/profile-details-user/${order.userId}`);
                                                            }
                                                        }}
                                                        style={{
                                                            cursor: order.userId ? 'pointer' : 'default',
                                                            color: order.userId ? '#3498db' : 'inherit',
                                                            textDecoration: 'none',
                                                            transition: 'color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => order.userId && (e.target.style.textDecoration = 'underline')}
                                                        onMouseLeave={(e) => order.userId && (e.target.style.textDecoration = 'none')}
                                                    >
                                                        {order.user}
                                                    </span>
                                                    <span className="trader-rating">
                                                        <FaStar /> {order.rating} ({order.trades} trades)
                                                    </span>
                                                </div>
                                                <div className="trader-stats">
                                                    <span className="completion-rate">
                                                        {order.completionRate}% completion
                                                    </span>
                                                    <span className="release-time">
                                                        <FaRegClock /> {order.avgReleaseTime} avg release
                                                    </span>
                                                    {order.verificationLevel > 0 && (
                                                        <span className="verification-level">
                                                            <FaLock /> Level {order.verificationLevel} Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="order-details">
                                            <div className="detail price">
                                                <span>Price:</span>
                                                <strong>{order.price} {order.currency}/{order.cryptoCurrency}</strong>
                                            </div>
                                            <div className="detail available">
                                                <span>Available:</span>
                                                <strong>{order.available} {order.currency}</strong>
                                            </div>
                                            <div className="detail limit">
                                                <span>Limit:</span>
                                                <strong>{order.limit}</strong>
                                            </div>
                                            <div className="detail payment">
                                                <span>Payment:</span>
                                                <div className="payment-methods">
                                                    {order.paymentMethods.map((method, idx) => (
                                                        <span key={idx} className="payment-method">
                                                            {method}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="order-actions">
                                            <button
                                                onClick={() => handleTrade(order)}
                                                className="trade-button"
                                            >
                                                {state.activeTab === 'buy' ? 'Chat to Buy' : 'Chat to Sell'}
                                            </button>
                                            <button className="more-details-btn">
                                                <BsThreeDotsVertical />
                                            </button>
                                        </div>

                                        {order.terms && (
                                            <div className="order-terms">
                                                <p>{order.terms}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="user-orders-section">
                    <div className="section-header">
                        <h2>Your Orders</h2>
                        <div className="tabs">
                            <button className="tab active">All</button>
                            <button className="tab">Open</button>
                            <button className="tab">Completed</button>
                            <button className="tab">Cancelled</button>
                        </div>
                    </div>

                    <div className="orders-table-container">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Amount/Filled</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.userOrders.map(order => (
                                    <tr
                                        key={order.id}
                                        id={`order-${order.id}`}
                                        className={`order-row ${order.status} ${order.id === state.showOrderDetails ? 'highlighted' : ''}`}
                                        onClick={() => setState(prev => ({ ...prev, showOrderDetails: order.id }))}
                                    >
                                        <td className={`type ${order.type}`}>
                                            {order.type}
                                        </td>
                                        <td>
                                            <div className="amount-filled">
                                                <span>{order.amount} {order.currency}</span>
                                                {order.amount !== order.filled && (
                                                    <span className="filled-amount">
                                                        ({order.filled} filled)
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {order.price} {order.currency}/{order.cryptoCurrency}
                                        </td>
                                        <td>
                                            {(order.amount * order.price).toFixed(2)} {order.cryptoCurrency}
                                        </td>
                                        <td>
                                            {order.paymentMethod}
                                        </td>
                                        <td>
                                            <span className={`status status-${order.status}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            {new Date(order.date).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <button
                                                className="details-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setState(prev => ({ ...prev, showOrderDetails: order.id }));
                                                }}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="security-banner">
                <div className="security-content">
                    <FaShieldAlt className="shield-icon" />
                    <div className="security-text">
                        <h3>Secure P2P Trading</h3>
                        <p>All trades are protected by escrow. Your funds are safe with us.</p>
                    </div>
                    <button className="learn-more-btn">
                        Learn More About Security
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FiatP2P;