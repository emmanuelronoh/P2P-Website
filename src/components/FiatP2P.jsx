import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaShieldAlt, FaExchangeAlt, FaBell, FaFilter, FaChartLine, FaRegClock, FaLock, FaCheckCircle, FaRegCommentDots } from 'react-icons/fa';
import { MdPayment, MdAccountBalance, MdAttachMoney } from 'react-icons/md';
import { RiRefund2Fill } from 'react-icons/ri';
import { BsArrowLeftRight, BsThreeDotsVertical } from 'react-icons/bs';
import '../styles/fiatP2P.css';

const FiatP2P = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    userBalance: {
      fiat: 12500.75,
      crypto: 2.4567,
      currency: 'USD',
      cryptoCurrency: 'Ksh'  // Initialize cryptoCurrency here
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

    const messagesEndRef = useRef(null);
    const orderFormRef = useRef(null);

    // Mock data initialization with more comprehensive data
    useEffect(() => {
        // Simulate API calls with more realistic data
        const loadData = async () => {
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockOrders = [
                {
                    id: 1,
                    type: 'sell',
                    user: 'TrustedTrader',
                    avatar: 'TT',
                    amount: 2500,
                    available: 2500,
                    price: 1.015,
                    currency: 'USD',
                    cryptoCurrency: 'Ksh',
                    paymentMethods: ['Bank Transfer', 'PayPal', 'Wise'],
                    limit: '100-2500 USD',
                    rating: 4.9,
                    trades: 342,
                    completionRate: 99.5,
                    avgReleaseTime: '15 min',
                    verificationLevel: 3,
                    terms: 'I only accept payments from verified accounts. Payment must be made within 15 minutes.',
                    online: true,
                    minAmount: 100
                },
                {
                    id: 2,
                    type: 'sell',
                    user: 'FastExchange',
                    avatar: 'FE',
                    amount: 1800,
                    available: 1200,
                    price: 1.02,
                    currency: 'USD',
                    cryptoCurrency: 'Ksh',
                    paymentMethods: ['Revolut', 'Cash App'],
                    limit: '50-2000 USD',
                    rating: 4.7,
                    trades: 187,
                    completionRate: 97.2,
                    avgReleaseTime: '8 min',
                    verificationLevel: 2,
                    terms: 'No third-party payments. Must send payment receipt immediately.',
                    online: true,
                    minAmount: 50
                },
                {
                    id: 3,
                    type: 'buy',
                    user: 'CryptoBuyerPro',
                    avatar: 'CB',
                    amount: 3500,
                    available: 3500,
                    price: 0.985,
                    currency: 'USD',
                    cryptoCurrency: 'Ksh',
                    paymentMethods: ['Bank Transfer', 'Zelle'],
                    limit: '200-3500 USD',
                    rating: 4.8,
                    trades: 256,
                    completionRate: 98.8,
                    avgReleaseTime: '12 min',
                    verificationLevel: 3,
                    terms: 'I will pay immediately upon confirmation. No chargebacks.',
                    online: false,
                    lastOnline: '5 min ago',
                    minAmount: 200
                },
                {
                    id: 4,
                    type: 'buy',
                    user: 'MarketMaker',
                    avatar: 'MM',
                    amount: 10000,
                    available: 7500,
                    price: 0.992,
                    currency: 'EUR',
                    cryptoCurrency: 'Ksh',
                    paymentMethods: ['SEPA', 'Revolut', 'Wise'],
                    limit: '500-10000 EUR',
                    rating: 4.95,
                    trades: 512,
                    completionRate: 99.8,
                    avgReleaseTime: '10 min',
                    verificationLevel: 3,
                    terms: 'Large volume specialist. KYC required for trades >2000 EUR.',
                    online: true,
                    minAmount: 500
                }
            ];

            const mockPaymentMethods = [
                { id: 'bank', name: 'Bank Transfer', icon: <MdAccountBalance />, processingTime: '1-3 business days', fee: 0 },
                { id: 'paypal', name: 'PayPal', icon: <MdPayment />, processingTime: 'Instant', fee: 0.029, minAmount: 20 },
                { id: 'wise', name: 'Wise', icon: <MdPayment />, processingTime: 'Instant', fee: 0.005, minAmount: 10 },
                { id: 'revolut', name: 'Revolut', icon: <MdPayment />, processingTime: 'Instant', fee: 0, minAmount: 1 },
                { id: 'zelle', name: 'Zelle', icon: <MdPayment />, processingTime: 'Instant', fee: 0, minAmount: 10 },
                { id: 'sepa', name: 'SEPA', icon: <MdAccountBalance />, processingTime: '1 business day', fee: 0, minAmount: 50 },
                { id: 'cashapp', name: 'Cash App', icon: <MdPayment />, processingTime: 'Instant', fee: 0.015, minAmount: 5 }
            ];

            const mockUserOrders = [
                {
                    id: 101,
                    type: 'buy',
                    amount: 200,
                    filled: 200,
                    price: 1.02,
                    currency: 'USD',
                    cryptoCurrency: 'Ksh',
                    status: 'completed',
                    counterparty: 'SellerPro',
                    date: '2023-05-15 14:30',
                    paymentMethod: 'Bank Transfer',
                    escrow: true,
                    dispute: false
                },
                {
                    id: 102,
                    type: 'sell',
                    amount: 350,
                    filled: 350,
                    price: 1.01,
                    currency: 'USD',
                    cryptoCurrency: 'Ksh',
                    status: 'completed',
                    counterparty: 'NewBuyer',
                    date: '2023-05-16 09:45',
                    paymentMethod: 'PayPal',
                    escrow: true,
                    dispute: false
                },
                {
                    id: 103,
                    type: 'buy',
                    amount: 500,
                    filled: 320,
                    price: 1.015,
                    currency: 'USD',
                    cryptoCurrency: 'Ksh',
                    status: 'partially_filled',
                    counterparty: 'Multiple',
                    date: '2023-05-17 16:20',
                    paymentMethod: 'Wise',
                    escrow: true,
                    dispute: false
                },
                {
                    id: 104,
                    type: 'sell',
                    amount: 750,
                    filled: 0,
                    price: 0.995,
                    currency: 'USD',
                    cryptoCurrency: 'Ksh',
                    status: 'pending',
                    counterparty: '',
                    date: '2023-05-18 11:15',
                    paymentMethod: 'Bank Transfer',
                    escrow: false,
                    dispute: false
                }
            ];

            const priceTrends = {
                Ksh_USD: {
                    labels: ['1h', '6h', '12h', '24h', '3d', '1w'],
                    data: [1.012, 1.015, 1.013, 1.017, 1.02, 1.018],
                    change: 0.005
                },
                Ksh_EUR: {
                    labels: ['1h', '6h', '12h', '24h', '3d', '1w'],
                    data: [0.952, 0.948, 0.945, 0.95, 0.947, 0.943],
                    change: -0.003
                }
            };

            const marketStats = {
                totalTrades24h: 12458,
                totalVolume24h: 12450000,
                avgPrice: 1.0165,
                activeTraders: 3421
            };

            setState(prev => ({
                ...prev,
                orders: mockOrders,
                paymentMethods: mockPaymentMethods,
                userOrders: mockUserOrders,
                priceTrends,
                marketStats,
                securityDeposit: 200
            }));
        };

        loadData();
    }, []);

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

    // Handle order creation
    const handleCreateOrder = (e) => {
        e.preventDefault();
        if (!state.termsAccepted) {
            alert('You must accept the terms and conditions');
            return;
        }

        // In a real app, this would call your backend API
        console.log('Creating order:', {
            type: state.activeTab,
            amount: state.amount,
            price: state.price,
            paymentMethod: state.selectedPayment,
            orderType: state.selectedOrderType,
            expiry: state.orderExpiry
        });

        // Simulate order creation
        const newOrder = {
            id: Date.now(),
            type: state.activeTab,
            amount: parseFloat(state.amount),
            filled: 0,
            price: parseFloat(state.price),
            currency: state.filter.currency,
            cryptoCurrency: 'Ksh',
            status: 'pending',
            counterparty: '',
            date: new Date().toISOString(),
            paymentMethod: state.paymentMethods.find(m => m.id === state.selectedPayment)?.name || '',
            escrow: true,
            dispute: false
        };

        setState(prev => ({
            ...prev,
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
    };

    // Initiate trade with an order
    const handleTrade = (order) => {
        if (!state.kycVerified && order.verificationLevel > 1) {
            alert('This trader requires KYC verification to trade. Please complete your verification first.');
            return;
        }

        setState(prev => ({
            ...prev,
            tradeInProgress: order,
            chatOpen: true,
            currentChat: {
                orderId: order.id,
                counterparty: order.user,
                status: 'pending'
            },
            messages: [
                {
                    id: 1,
                    sender: 'system',
                    text: `Trade initiated for ${order.amount} ${order.currency} at ${order.price} ${order.currency}/${order.cryptoCurrency}`,
                    time: new Date().toISOString()
                },
                {
                    id: 2,
                    sender: 'system',
                    text: `Please communicate with ${order.user} to complete the payment process.`,
                    time: new Date().toISOString()
                }
            ]
        }));
    };

    // Send a chat message
    const sendMessage = () => {
        if (!state.newMessage.trim()) return;

        const newMsg = {
            id: Date.now(),
            sender: 'me',
            text: state.newMessage,
            time: new Date().toISOString()
        };

        setState(prev => ({
            ...prev,
            messages: [...prev.messages, newMsg],
            newMessage: ''
        }));

        // Simulate reply after 1-3 seconds
        if (Math.random() > 0.3) {
            const replies = [
                "I've just sent the payment, please check.",
                "Can you send me your payment details?",
                "I'll complete the payment within 10 minutes.",
                "Payment received, releasing crypto now.",
                "Please confirm you've received the payment."
            ];

            setTimeout(() => {
                const replyMsg = {
                    id: Date.now() + 1,
                    sender: 'them',
                    text: replies[Math.floor(Math.random() * replies.length)],
                    time: new Date().toISOString()
                };

                setState(prev => ({
                    ...prev,
                    messages: [...prev.messages, replyMsg]
                }));
            }, 1000 + Math.random() * 2000);
        }
    };

    // Mark trade as paid
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
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="message-input">
                            <input
                                type="text"
                                value={state.newMessage}
                                onChange={(e) => setState(prev => ({ ...prev, newMessage: e.target.value }))}
                                placeholder="Type your message..."
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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

            <header className="fiat-p2p-header">
                <div className="header-content">
                    <h1>
                        <BsArrowLeftRight className="exchange-icon" />
                        P2P Trading Platform
                    </h1>

                    <div className="header-actions">
                        <button className="tutorial-btn" onClick={startTutorial}>
                            How It Works
                        </button>

                        <div className="notification-bell">
                            <FaBell />
                            {state.notificationCount > 0 && (
                                <span className="notification-count">{state.notificationCount}</span>
                            )}
                        </div>

                        <div className="user-status">
                            <div className="status-indicator online" />
                            <span>Verified Trader</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="market-stats-bar">
                <div className="stats-container">
                    <div className="stat">
                        <span>24h Volume:</span>
                        <strong>
                            {state.marketStats.totalVolume24h ?
                                `$${(state.marketStats.totalVolume24h / 1000000).toFixed(1)}M` :
                                'Loading...'}
                        </strong>
                    </div>
                    <div className="stat">
                        <span>24h Trades:</span>
                        <strong>
                            {state.marketStats.totalTrades24h ?
                                state.marketStats.totalTrades24h.toLocaleString() :
                                'Loading...'}
                        </strong>
                    </div>
                    <div className="stat">
                        <span>Avg Price (Ksh/USD):</span>
                        <strong className={state.priceTrends.Ksh_USD?.change >= 0 ? 'positive' : 'negative'}>
                            {state.priceTrends.Ksh_USD ?
                                `${state.priceTrends.Ksh_USD.data[state.priceTrends.Ksh_USD.data.length - 1]} ` :
                                'Loading...'}
                            {state.priceTrends.Ksh_USD?.change !== undefined && (
                                <span>({state.priceTrends.Ksh_USD.change >= 0 ? '+' : ''}{state.priceTrends.Ksh_USD.change})</span>
                            )}
                        </strong>
                    </div>
                    <div className="stat">
                        <span>Active Traders:</span>
                        <strong>
                            {state.marketStats.activeTraders ?
                                state.marketStats.activeTraders.toLocaleString() :
                                'Loading...'}
                        </strong>
                    </div>
                </div>
            </div>

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
                                    <strong>{calculateMarketPrice()} {state.filter.currency}/{state.state.cryptoCurrency}</strong>
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
                                                    <span className="trader-name">{order.user}</span>
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
                                                {state.activeTab === 'buy' ? 'Buy' : 'Sell'} Now
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