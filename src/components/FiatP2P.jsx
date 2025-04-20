// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaStar, FaShieldAlt, FaExchangeAlt, FaBell, FaFilter, FaChartLine, FaRegClock, FaLock, FaCheckCircle, FaRegCommentDots } from 'react-icons/fa';
// import { MdPayment, MdAccountBalance, MdAttachMoney } from 'react-icons/md';
// import { RiRefund2Fill } from 'react-icons/ri';
// import { BsArrowLeftRight, BsThreeDotsVertical } from 'react-icons/bs';
// import '../styles/fiatP2P.css';
// import axios from 'axios';
// import { useAuth, loadData } from '../contexts/AuthContext';


// const FiatP2P = () => {
//     const { isAuthenticated, loading: authLoading, logout } = useAuth();
//     const navigate = useNavigate();
//     const [state, setState] = useState({
//         userBalance: {
//             fiat: 12500.75,
//             crypto: 2.4567,
//             currency: 'USD',
//             cryptoCurrency: 'Ksh'
//         },
//         activeTab: 'buy',
//         orders: [],
//         userOrders: [],
//         paymentMethods: [],
//         selectedPayment: '',
//         amount: '',
//         price: '',
//         filter: {
//             currency: 'USD',
//             paymentMethod: 'all',
//             amountRange: [0, 10000],
//             sortBy: 'price',
//             sortOrder: 'asc'
//         },
//         showAdvancedFilters: false,
//         notificationCount: 3,
//         tradeInProgress: null,
//         chatOpen: false,
//         currentChat: null,
//         messages: [],
//         newMessage: '',
//         twoFactorAuth: true,
//         kycVerified: true,
//         showOrderDetails: null,
//         priceTrends: {},
//         marketStats: {},
//         securityDeposit: 0,
//         selectedOrderType: 'limit',
//         orderExpiry: '24h',
//         termsAccepted: false,
//         showTutorial: false,
//         activeStep: 0
//     });
//     // Add these new state variables
//     const [socket, setSocket] = useState(null);
//     const [isTyping, setIsTyping] = useState(false);
//     const [typingUser, setTypingUser] = useState('');
//     const [unreadMessages, setUnreadMessages] = useState({});

//     useEffect(() => {
//         if (!isAuthenticated || !state.currentChat?.id) return;

//         const token = localStorage.getItem('accessToken');
//         const wsUrl = `ws://localhost:8001/ws/chat/${state.currentChat.id}/?token=${token}`;

//         const newSocket = new WebSocket(wsUrl);

//         newSocket.onopen = () => {
//             console.log('WebSocket connected');
//             setSocket(newSocket);
//         };

//         newSocket.onmessage = (e) => {
//             const data = JSON.parse(e.data);
//             handleWebSocketMessage(data);
//         };

//         newSocket.onerror = (error) => {
//             console.error('WebSocket error:', error);
//         };

//         newSocket.onclose = () => {
//             console.log('WebSocket disconnected');
//             // Attempt to reconnect after a delay
//             setTimeout(() => {
//                 if (!socket) {
//                     setSocket(new WebSocket(wsUrl));
//                 }
//             }, 5000);
//         };

//         return () => {
//             if (newSocket.readyState === WebSocket.OPEN) {
//                 newSocket.close();
//             }
//         };
//     }, [isAuthenticated, state.currentChat?.id]);

//     const handleTyping = () => {
//         if (!socket || !state.currentChat?.id) return;

//         try {
//             const typingData = {
//                 type: 'typing',
//                 chat_room_id: state.currentChat.id,
//                 is_typing: true
//             };

//             socket.send(JSON.stringify(typingData));

//             // Set a timeout to send 'stopped typing' after 3 seconds of inactivity
//             clearTimeout(typingTimeout.current);
//             typingTimeout.current = setTimeout(() => {
//                 if (socket.readyState === WebSocket.OPEN) {
//                     const stopTypingData = {
//                         type: 'typing',
//                         chat_room_id: state.currentChat.id,
//                         is_typing: false
//                     };
//                     socket.send(JSON.stringify(stopTypingData));
//                 }
//             }, 3000);
//         } catch (error) {
//             console.error('Error sending typing indicator:', error);
//         }
//     };

//     // Add this near your other useRef declarations
//     const typingTimeout = useRef(null);

//     // Also make sure to clear the timeout when component unmounts
//     useEffect(() => {
//         return () => {
//             if (typingTimeout.current) {
//                 clearTimeout(typingTimeout.current);
//             }
//         };
//     }, []);

//     const sendMessage = async () => {
//         if (!state.newMessage.trim() || !socket || !state.currentChat) return;

//         try {
//             const messageData = {
//                 type: 'chat_message',
//                 chat_room_id: state.currentChat.id,
//                 message: state.newMessage.trim()
//             };

//             // Optimistically add to UI
//             const newMsg = {
//                 id: `temp-${Date.now()}`,
//                 sender: 'me',
//                 text: state.newMessage.trim(),
//                 time: new Date().toISOString(),
//                 read: false
//             };

//             setState(prev => ({
//                 ...prev,
//                 messages: [...prev.messages, newMsg],
//                 newMessage: ''
//             }));

//             // Send via WebSocket
//             socket.send(JSON.stringify(messageData));

//         } catch (error) {
//             console.error('Error sending message:', error);
//             // Remove optimistic message if failed
//             setState(prev => ({
//                 ...prev,
//                 messages: prev.messages.filter(msg => msg.id !== newMsg.id)
//             }));
//         }
//     };

//     const handleTrade = async (order) => {
//         if (!state.kycVerified && order.verificationLevel > 1) {
//             alert('This trader requires KYC verification to trade. Please complete your verification first.');
//             return;
//         }

//         try {
//             const token = localStorage.getItem('accessToken');

//             // Create or get existing chat room
//             const response = await axios.post(
//                 'http://localhost:8000/chat-room/',
//                 {
//                     trade_id: order.id,
//                     seller_id: order.userId,
//                     trade_type: state.activeTab
//                 },
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             const chatRoom = response.data;

//             // Navigate to messages page with the chat room ID
//             navigate(`/chat-room-fiat?chatId=${chatRoom.id}`);

//         } catch (error) {
//             console.error('Error initiating chat:', error);
//             if (error.response?.status === 400 && error.response?.data?.chat_room_id) {
//                 // Chat room already exists - navigate to it
//                 navigate(`/chat-room-fiat?chatId=${error.response.data.chat_room_id}`);
//             } else {
//                 alert(`Failed to start chat: ${error.response?.data?.error || error.message}`);
//             }
//         }
//     };

//     const connectToExistingChat = async (chatRoomId, order) => {
//         try {
//             const token = localStorage.getItem('accessToken');

//             // Get chat room details
//             const response = await axios.get(
//                 `http://localhost:8000/chat-room/${chatRoomId}/`,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`
//                     }
//                 }
//             );

//             const chatRoom = response.data;

//             // Connect to WebSocket
//             const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//             const wsUrl = `ws://localhost:8001/ws/chat/${chatRoomId}/`;
//             const newSocket = new WebSocket(wsUrl);

//             newSocket.onopen = () => {
//                 console.log('WebSocket connected to existing chat');
//                 setSocket(newSocket);

//                 newSocket.onmessage = (e) => {
//                     const data = JSON.parse(e.data);
//                     handleWebSocketMessage(data);
//                 };

//                 loadMessages(chatRoomId);
//             };

//             setState(prev => ({
//                 ...prev,
//                 chatOpen: true,
//                 currentChat: {
//                     id: chatRoomId,
//                     counterparty: order.user,
//                     orderId: order.id
//                 },
//                 messages: [],
//                 socket: newSocket
//             }));

//         } catch (error) {
//             console.error('Error connecting to existing chat:', error);
//             alert('Failed to connect to existing chat. Please try again.');
//         }
//     };

//     const handleWebSocketMessage = (data) => {
//         if (!data) return;

//         try {
//             switch (data.type) {
//                 case 'chat_message':
//                     setState(prev => ({
//                         ...prev,
//                         messages: [...prev.messages, {
//                             id: data.message?.id || Date.now(),
//                             sender: data.sender === state.userId ? 'me' : 'them',
//                             text: data.message?.content || data.message?.text || '',
//                             time: data.message?.timestamp || new Date().toISOString(),
//                             read: true
//                         }]
//                     }));
//                     break;

//                 case 'typing':
//                     setIsTyping(data.is_typing);
//                     setTypingUser(data.user || '');
//                     break;

//                 case 'error':
//                     console.error('WebSocket error:', data.message);
//                     break;

//                 default:
//                     console.log('Unknown message type:', data);
//             }
//         } catch (error) {
//             console.error('Error handling WebSocket message:', error);
//         }
//     };

//     const loadMessages = async (chatRoomId) => {
//         try {
//             const token = localStorage.getItem('accessToken');
//             const response = await axios.get(
//                 `http://localhost:8000/chat-room/${chatRoomId}/messages/`,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`
//                     }
//                 }
//             );

//             setState(prev => ({
//                 ...prev,
//                 messages: response.data.map(msg => ({
//                     id: msg.id,
//                     sender: msg.sender.id === state.userId ? 'me' : 'them',
//                     text: msg.content,
//                     time: msg.timestamp,
//                     read: msg.read
//                 }))
//             }));
//         } catch (error) {
//             console.error('Error loading messages:', error);
//         }
//     };

//     const messagesEndRef = useRef(null);
//     const orderFormRef = useRef(null);



//     useEffect(() => {
//         const loadData = async () => {
//             if (authLoading || !isAuthenticated) return;

//             try {
//                 const token = localStorage.getItem('accessToken');

//                 if (!token) {
//                     navigate('/login');
//                     return;
//                 }

//                 const headers = {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 };

//                 const [ordersResponse, paymentMethodsResponse, userOrdersResponse, priceTrendsResponse, marketStatsResponse] =
//                     await Promise.all([
//                         axios.get('http://localhost:8000/escrow/orders/', { headers }),
//                         axios.get('http://localhost:8000/escrow/payment-methods/', { headers }),
//                         axios.get('http://localhost:8000/escrow/user-orders/', { headers }),
//                         axios.get('http://localhost:8000/escrow/price-trends/', { headers }),
//                         axios.get('http://localhost:8000/escrow/market-stats/', { headers })
//                     ]);


//                 const transformedOrders = ordersResponse.data.map(order => {
//                     let userDisplay;
//                     let userId;

//                     if (typeof order.user === 'object') {
//                         userDisplay = order.user.username || order.user.email || String(order.user.id);
//                         userId = order.user.id;  // Capture the user ID
//                     } else {
//                         userDisplay = order.user || 'Unknown';
//                         userId = null;
//                     }


//                     // Handle payment methods safely
//                     const paymentMethods = Array.isArray(order.payment_methods)
//                         ? order.payment_methods.map(pm =>
//                             typeof pm === 'object' ? pm.name : String(pm)
//                         )
//                         : [];

//                     return {
//                         id: order.id,
//                         userId,
//                         type: order.order_type || 'buy', // Default to 'buy' if missing
//                         user: userDisplay,
//                         amount: parseFloat(order.amount) || 0,
//                         available: parseFloat(order.available) || 0,
//                         price: parseFloat(order.price) || 0,
//                         currency: order.currency || 'USD',
//                         cryptoCurrency: order.crypto_currency || 'BTC',
//                         paymentMethods,
//                         limit: order.min_limit && order.max_limit
//                             ? `${order.min_limit}-${order.max_limit} ${order.currency || 'USD'}`
//                             : 'N/A',
//                         rating: parseFloat(order.rating) || 0,
//                         trades: order.trades_count || 0,
//                         completionRate: parseFloat(order.completion_rate) || 0,
//                         avgReleaseTime: order.avg_release_time || 'N/A',
//                         terms: order.terms || '',
//                         online: Boolean(order.is_online),
//                         verificationLevel: 2 // Default value
//                     };
//                 });

//                 setState(prev => ({
//                     ...prev,
//                     orders: transformedOrders,
//                     paymentMethods: paymentMethodsResponse.data,
//                     userOrders: userOrdersResponse.data,
//                     priceTrends: priceTrendsResponse.data,
//                     marketStats: marketStatsResponse.data,
//                     securityDeposit: 200
//                 }));

//                 // Debug logging
//                 console.log('Transformed orders:', transformedOrders);
//                 console.log('Raw orders response:', ordersResponse.data);
//             } catch (error) {
//                 console.error('Error loading data:', error);
//                 if (error.response?.status === 401) {
//                     logout();
//                     navigate('/login');
//                 }
//             }
//         };

//         loadData();
//     }, [navigate, isAuthenticated, authLoading, logout]);

//     // Auto-scroll chat to bottom
//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [state.messages]);

//     // Calculate order totals
//     const calculateOrderTotal = () => {
//         if (state.amount && state.price) {
//             return (parseFloat(state.amount) * parseFloat(state.price)).toFixed(2);
//         }
//         return '0.00';
//     };

//     const handleCreateOrder = async (e) => {
//         e.preventDefault();
//         if (!state.termsAccepted) {
//             alert('You must accept the terms and conditions');
//             return;
//         }

//         try {
//             const token = localStorage.getItem('accessToken');
//             if (!token) {
//                 navigate('/login');
//                 return;
//             }

//             const orderData = {
//                 order_type: state.activeTab,
//                 amount: state.amount,
//                 price: state.price,
//                 currency: state.filter.currency,
//                 crypto_currency: state.userBalance.cryptoCurrency,
//                 payment_methods: [parseInt(state.selectedPayment)],
//                 min_limit: (state.activeTab === 'buy' ? '10.00' : '5.00'),
//                 max_limit: '10000.00',
//                 terms: state.selectedOrderType === 'limit' ?
//                     `This is a limit order that expires in ${state.orderExpiry}` :
//                     'This is a market order',
//                 avg_release_time: '15 minutes'
//             };

//             const response = await axios.post(
//                 'http://localhost:8000/escrow/orders/',
//                 orderData,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             // Properly transform the backend response to match frontend structure
//             const newOrder = {
//                 id: response.data.id,
//                 type: response.data.order_type,
//                 user: response.data.user?.username || 'You',
//                 amount: parseFloat(response.data.amount),
//                 available: parseFloat(response.data.available),
//                 price: parseFloat(response.data.price),
//                 currency: response.data.currency,
//                 cryptoCurrency: response.data.crypto_currency,
//                 paymentMethods: response.data.payment_methods.map(pm => pm.name),
//                 limit: response.data.limit_range || 'N/A',
//                 terms: response.data.terms,
//                 avgReleaseTime: response.data.avg_release_time,
//                 status: 'pending',
//                 date: new Date().toISOString()
//             };

//             setState(prev => ({
//                 ...prev,
//                 orders: [...prev.orders, newOrder],
//                 userOrders: [newOrder, ...prev.userOrders],
//                 amount: '',
//                 price: '',
//                 selectedPayment: '',
//                 showOrderDetails: newOrder.id
//             }));

//             // Scroll to the new order
//             setTimeout(() => {
//                 const element = document.getElementById(`order-${newOrder.id}`);
//                 if (element) {
//                     element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
//                 }
//             }, 100);

//         } catch (error) {
//             console.error('Error creating order:', error);
//             if (error.response?.status === 401) {
//                 logout();
//                 navigate('/login');
//             } else {
//                 alert(`Failed to create order: ${error.response?.data?.error || error.message}`);
//             }
//         }
//     };

//     // Initial data load
//     useEffect(() => {
//         if (!authLoading && isAuthenticated) {
//             loadData();
//         }
//     }, []);

//     // Filter orders based on current filters
//     const filteredOrders = state.orders
//         .filter(order => order.type === (state.activeTab === 'buy' ? 'sell' : 'buy'))
//         .filter(order => state.filter.currency === 'all' || order.currency === state.filter.currency)
//         .filter(order => state.filter.paymentMethod === 'all' ||
//             order.paymentMethods.some(method =>
//                 state.paymentMethods.find(pm => pm.id === state.filter.paymentMethod)?.name === method
//             ))
//         .sort((a, b) => {
//             if (state.filter.sortBy === 'price') {
//                 return state.filter.sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
//             } else if (state.filter.sortBy === 'rating') {
//                 return state.filter.sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
//             } else if (state.filter.sortBy === 'amount') {
//                 return state.filter.sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
//             }
//             return 0;
//         });

//     // Calculate average price for market orders
//     const calculateMarketPrice = () => {
//         const relevantOrders = filteredOrders.filter(o => o.type === (state.activeTab === 'buy' ? 'sell' : 'buy'));
//         if (relevantOrders.length === 0) return 0;

//         const total = relevantOrders.reduce((sum, order) => sum + order.price, 0);
//         return (total / relevantOrders.length).toFixed(4);
//     };

//     // Get payment method details
//     const getPaymentMethodDetails = (id) => {
//         return state.paymentMethods.find(m => m.id === id) || {};
//     };


//     return (
//         <div className="fiat-p2p-container">

//             {/* Order Details Modal */}
//             {state.showOrderDetails && (
//                 <div className="order-details-modal">
//                     <div className="order-details-content">
//                         <button
//                             onClick={() => setState(prev => ({ ...prev, showOrderDetails: null }))}
//                             className="close-details"
//                         >
//                             &times;
//                         </button>

//                         {(() => {
//                             const order = state.userOrders.find(o => o.id === state.showOrderDetails);
//                             if (!order) return null;

//                             return (
//                                 <>
//                                     <h3>Order Details #{order.id}</h3>
//                                     <div className="order-details-grid">
//                                         <div className="detail">
//                                             <span>Type:</span>
//                                             <strong className={order.type}>{order.type}</strong>
//                                         </div>
//                                         <div className="detail">
//                                             <span>Amount:</span>
//                                             <strong>{order.amount} {order.currency}</strong>
//                                         </div>
//                                         <div className="detail">
//                                             <span>Filled:</span>
//                                             <strong>{order.filled} {order.currency}</strong>
//                                         </div>
//                                         <div className="detail">
//                                             <span>Price:</span>
//                                             <strong>{order.price} {order.currency}/{order.cryptoCurrency}</strong>
//                                         </div>
//                                         <div className="detail">
//                                             <span>Total:</span>
//                                             <strong>{(order.amount * order.price).toFixed(2)} {order.cryptoCurrency}</strong>
//                                         </div>
//                                         <div className="detail">
//                                             <span>Status:</span>
//                                             <strong className={`status-${order.status}`}>
//                                                 {order.status.replace('_', ' ')}
//                                             </strong>
//                                         </div>
//                                         <div className="detail">
//                                             <span>Payment Method:</span>
//                                             <strong>{order.paymentMethod}</strong>
//                                         </div>
//                                         <div className="detail">
//                                             <span>Date:</span>
//                                             <strong>{new Date(order.date).toLocaleString()}</strong>
//                                         </div>
//                                         {order.counterparty && (
//                                             <div className="detail">
//                                                 <span>Counterparty:</span>
//                                                 <strong>{order.counterparty}</strong>
//                                             </div>
//                                         )}
//                                         <div className="detail">
//                                             <span>Escrow:</span>
//                                             <strong>{order.escrow ? 'Yes' : 'No'}</strong>
//                                         </div>
//                                     </div>

//                                     <div className="order-actions">
//                                         {order.status === 'pending' && (
//                                             <button
//                                                 onClick={() => cancelOrder(order.id)}
//                                                 className="cancel-order-btn"
//                                             >
//                                                 Cancel Order
//                                             </button>
//                                         )}
//                                         {order.status === 'completed' && (
//                                             <button className="leave-feedback-btn">
//                                                 <FaRegCommentDots /> Leave Feedback
//                                             </button>
//                                         )}
//                                     </div>
//                                 </>
//                             );
//                         })()}
//                     </div>
//                 </div>
//             )}

//             <div className="fiat-p2p-content">
//                 <div className="trading-tabs">
//                     <button
//                         className={`tab-button ${state.activeTab === 'buy' ? 'active' : ''}`}
//                         onClick={() => setState(prev => ({ ...prev, activeTab: 'buy' }))}
//                     >
//                         <MdAttachMoney /> Buy Fiat
//                     </button>
//                     <button
//                         className={`tab-button ${state.activeTab === 'sell' ? 'active' : ''}`}
//                         onClick={() => setState(prev => ({ ...prev, activeTab: 'sell' }))}
//                     >
//                         <MdAttachMoney /> Sell Fiat
//                     </button>
//                 </div>

//                 <div className="main-content-grid">
//                     <div className="order-creation-section">
//                         <div className="section-header">
//                             <h2>
//                                 {state.activeTab === 'buy' ? 'Buy' : 'Sell'} {state.userBalance.cryptoCurrency}
//                                 <span className="order-type-toggle">
//                                     <button
//                                         className={`type-btn ${state.selectedOrderType === 'limit' ? 'active' : ''}`}
//                                         onClick={() => setState(prev => ({ ...prev, selectedOrderType: 'limit' }))}
//                                     >
//                                         Limit Order
//                                     </button>
//                                     <button
//                                         className={`type-btn ${state.selectedOrderType === 'market' ? 'active' : ''}`}
//                                         onClick={() => setState(prev => ({ ...prev, selectedOrderType: 'market' }))}
//                                     >
//                                         Market Order
//                                     </button>
//                                 </span>
//                             </h2>
//                         </div>

//                         <form onSubmit={handleCreateOrder} className="order-form" ref={orderFormRef}>
//                             {state.selectedOrderType === 'market' && (
//                                 <div className="market-price-info">
//                                     <span>Current Market Price:</span>
//                                     <strong>{calculateMarketPrice()} {state.filter.currency}/{state.userBalance.cryptoCurrency}</strong>
//                                 </div>
//                             )}

//                             <div className="form-group">
//                                 <label>
//                                     Amount ({state.filter.currency})
//                                     {state.selectedOrderType === 'limit' && (
//                                         <span className="hint">(Min: {state.activeTab === 'buy' ? '10' : '5'} {state.filter.currency})</span>
//                                     )}
//                                 </label>
//                                 <input
//                                     type="number"
//                                     value={state.amount}
//                                     onChange={(e) => setState(prev => ({ ...prev, amount: e.target.value }))}
//                                     placeholder={`Enter amount in ${state.filter.currency}`}
//                                     min={state.activeTab === 'buy' ? 10 : 5}
//                                     required
//                                 />
//                             </div>

//                             {state.selectedOrderType === 'limit' && (
//                                 <div className="form-group">
//                                     <label>Price ({state.filter.currency}/{state.userBalance.cryptoCurrency})</label>
//                                     <input
//                                         type="number"
//                                         value={state.price}
//                                         onChange={(e) => setState(prev => ({ ...prev, price: e.target.value }))}
//                                         placeholder={`Enter price per ${state.userBalance.cryptoCurrency}`}
//                                         step="0.0001"
//                                         required
//                                     />
//                                 </div>
//                             )}

//                             <div className="form-group">
//                                 <label>Payment Method</label>
//                                 <select
//                                     value={state.selectedPayment}
//                                     onChange={(e) => setState(prev => ({ ...prev, selectedPayment: e.target.value }))}
//                                     required
//                                 >
//                                     <option value="">Select payment method</option>
//                                     {state.paymentMethods.map(method => (
//                                         <option key={method.id} value={method.id}>
//                                             {method.name} {method.fee > 0 ? `(${(method.fee * 100).toFixed(1)}% fee)` : ''}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {state.selectedPayment && (
//                                 <div className="payment-method-info">
//                                     <div className="info-item">
//                                         <span>Processing Time:</span>
//                                         <strong>{getPaymentMethodDetails(state.selectedPayment).processingTime || 'N/A'}</strong>
//                                     </div>
//                                     {getPaymentMethodDetails(state.selectedPayment).fee > 0 && (
//                                         <div className="info-item">
//                                             <span>Fee:</span>
//                                             <strong>{(getPaymentMethodDetails(state.selectedPayment).fee * 100).toFixed(1)}%</strong>
//                                         </div>
//                                     )}
//                                     {getPaymentMethodDetails(state.selectedPayment).minAmount && (
//                                         <div className="info-item">
//                                             <span>Min Amount:</span>
//                                             <strong>{getPaymentMethodDetails(state.selectedPayment).minAmount} {state.filter.currency}</strong>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {state.selectedOrderType === 'limit' && (
//                                 <div className="form-group">
//                                     <label>Order Expiry</label>
//                                     <select
//                                         value={state.orderExpiry}
//                                         onChange={(e) => setState(prev => ({ ...prev, orderExpiry: e.target.value }))}
//                                     >
//                                         <option value="1h">1 Hour</option>
//                                         <option value="6h">6 Hours</option>
//                                         <option value="12h">12 Hours</option>
//                                         <option value="24h">24 Hours</option>
//                                         <option value="3d">3 Days</option>
//                                         <option value="7d">7 Days</option>
//                                     </select>
//                                 </div>
//                             )}

//                             <div className="order-summary">
//                                 <div className="summary-item">
//                                     <span>Total {state.activeTab === 'buy' ? 'Cost' : 'Receive'}:</span>
//                                     <strong>
//                                         {calculateOrderTotal()} {state.activeTab === 'buy' ? state.userBalance.cryptoCurrency : state.filter.currency}
//                                     </strong>
//                                 </div>
//                                 {state.securityDeposit > 0 && (
//                                     <div className="summary-item">
//                                         <span>Security Deposit:</span>
//                                         <strong>{state.securityDeposit} {state.filter.currency}</strong>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="terms-checkbox">
//                                 <input
//                                     type="checkbox"
//                                     id="terms-agree"
//                                     checked={state.termsAccepted}
//                                     onChange={(e) => setState(prev => ({ ...prev, termsAccepted: e.target.checked }))}
//                                 />
//                                 <label htmlFor="terms-agree">
//                                     I agree to the <a href="#">Terms of Service</a> and confirm that I'm not from a restricted jurisdiction.
//                                 </label>
//                             </div>

//                             <button type="submit" className="create-order-btn">
//                                 {state.selectedOrderType === 'market' ? (
//                                     <>
//                                         <FaExchangeAlt /> {state.activeTab === 'buy' ? 'Buy' : 'Sell'} Now at Market Price
//                                     </>
//                                 ) : (
//                                     <>
//                                         <FaRegClock /> Place {state.activeTab === 'buy' ? 'Buy' : 'Sell'} Order
//                                     </>
//                                 )}
//                             </button>
//                         </form>
//                     </div>

//                     <div className="orders-section">
//                         <div className="section-header">
//                             <h2>Available {state.activeTab === 'buy' ? 'Sellers' : 'Buyers'}</h2>
//                             <div className="section-actions">
//                                 <button
//                                     className={`filter-btn ${state.showAdvancedFilters ? 'active' : ''}`}
//                                     onClick={() => setState(prev => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }))}
//                                 >
//                                     <FaFilter /> Filters
//                                 </button>
//                             </div>
//                         </div>

//                         {state.showAdvancedFilters && (
//                             <div className="advanced-filters">
//                                 <div className="filter-group">
//                                     <label>Currency:</label>
//                                     <select
//                                         value={state.filter.currency}
//                                         onChange={(e) => setState(prev => ({
//                                             ...prev,
//                                             filter: { ...prev.filter, currency: e.target.value }
//                                         }))}
//                                     >
//                                         <option value="USD">USD</option>
//                                         <option value="EUR">EUR</option>
//                                         <option value="GBP">GBP</option>
//                                         <option value="CAD">CAD</option>
//                                         <option value="AUD">AUD</option>
//                                     </select>
//                                 </div>

//                                 <div className="filter-group">
//                                     <label>Payment Method:</label>
//                                     <select
//                                         value={state.filter.paymentMethod}
//                                         onChange={(e) => setState(prev => ({
//                                             ...prev,
//                                             filter: { ...prev.filter, paymentMethod: e.target.value }
//                                         }))}
//                                     >
//                                         <option value="all">All Methods</option>
//                                         {state.paymentMethods.map(method => (
//                                             <option key={method.id} value={method.id}>{method.name}</option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 <div className="filter-group">
//                                     <label>Amount Range:</label>
//                                     <div className="range-inputs">
//                                         <input
//                                             type="number"
//                                             value={state.filter.amountRange[0]}
//                                             onChange={(e) => setState(prev => ({
//                                                 ...prev,
//                                                 filter: {
//                                                     ...prev.filter,
//                                                     amountRange: [
//                                                         parseFloat(e.target.value) || 0,
//                                                         prev.filter.amountRange[1]
//                                                     ]
//                                                 }
//                                             }))}
//                                             placeholder="Min"
//                                         />
//                                         <span>to</span>
//                                         <input
//                                             type="number"
//                                             value={state.filter.amountRange[1]}
//                                             onChange={(e) => setState(prev => ({
//                                                 ...prev,
//                                                 filter: {
//                                                     ...prev.filter,
//                                                     amountRange: [
//                                                         prev.filter.amountRange[0],
//                                                         parseFloat(e.target.value) || 10000
//                                                     ]
//                                                 }
//                                             }))}
//                                             placeholder="Max"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="filter-group">
//                                     <label>Sort By:</label>
//                                     <select
//                                         value={state.filter.sortBy}
//                                         onChange={(e) => setState(prev => ({
//                                             ...prev,
//                                             filter: { ...prev.filter, sortBy: e.target.value }
//                                         }))}
//                                     >
//                                         <option value="price">Price</option>
//                                         <option value="rating">Rating</option>
//                                         <option value="amount">Amount</option>
//                                     </select>
//                                     <button
//                                         className="sort-order-btn"
//                                         onClick={() => setState(prev => ({
//                                             ...prev,
//                                             filter: {
//                                                 ...prev.filter,
//                                                 sortOrder: prev.filter.sortOrder === 'asc' ? 'desc' : 'asc'
//                                             }
//                                         }))}
//                                     >
//                                         {state.filter.sortOrder === 'asc' ? '↑' : '↓'}
//                                     </button>
//                                 </div>

//                                 <div className="filter-group">
//                                     <label>Verification:</label>
//                                     <select
//                                         value={state.filter.verification}
//                                         onChange={(e) => setState(prev => ({
//                                             ...prev,
//                                             filter: { ...prev.filter, verification: e.target.value }
//                                         }))}
//                                     >
//                                         <option value="any">Any Level</option>
//                                         <option value="1">Level 1+</option>
//                                         <option value="2">Level 2+</option>
//                                         <option value="3">Level 3</option>
//                                     </select>
//                                 </div>
//                             </div>
//                         )}

//                         <div className="orders-list">
//                             {filteredOrders.length === 0 ? (
//                                 <div className="no-orders">
//                                     <p>No {state.activeTab === 'buy' ? 'sell' : 'buy'} orders matching your filters.</p>
//                                     <button
//                                         onClick={() => setState(prev => ({
//                                             ...prev,
//                                             filter: {
//                                                 currency: 'USD',
//                                                 paymentMethod: 'all',
//                                                 amountRange: [0, 10000]
//                                             }
//                                         }))}
//                                         className="reset-filters-btn"
//                                     >
//                                         Reset Filters
//                                     </button>
//                                 </div>
//                             ) : (
//                                 filteredOrders.map(order => (
//                                     <div key={order.id} className="order-card">
//                                         <div className="order-header">
//                                             <div className="trader-avatar">
//                                                 {order.avatar}
//                                                 {order.online && <span className="online-dot" />}
//                                             </div>
//                                             <div className="trader-info">
//                                                 <div className="trader-name-rating">
//                                                     <span
//                                                         className="trader-name"
//                                                         onClick={(e) => {
//                                                             e.stopPropagation();
//                                                             if (order.userId) {
//                                                                 navigate(`/profile-details-user/${order.userId}`);
//                                                             }
//                                                         }}
//                                                         style={{
//                                                             cursor: order.userId ? 'pointer' : 'default',
//                                                             color: order.userId ? '#3498db' : 'inherit',
//                                                             textDecoration: 'none',
//                                                             transition: 'color 0.2s'
//                                                         }}
//                                                         onMouseEnter={(e) => order.userId && (e.target.style.textDecoration = 'underline')}
//                                                         onMouseLeave={(e) => order.userId && (e.target.style.textDecoration = 'none')}
//                                                     >
//                                                         {order.user}
//                                                     </span>
//                                                     <span className="trader-rating">
//                                                         <FaStar /> {order.rating} ({order.trades} trades)
//                                                     </span>
//                                                 </div>
//                                                 <div className="trader-stats">
//                                                     <span className="completion-rate">
//                                                         {order.completionRate}% completion
//                                                     </span>
//                                                     <span className="release-time">
//                                                         <FaRegClock /> {order.avgReleaseTime} avg release
//                                                     </span>
//                                                     {order.verificationLevel > 0 && (
//                                                         <span className="verification-level">
//                                                             <FaLock /> Level {order.verificationLevel} Verified
//                                                         </span>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="order-details">
//                                             <div className="detail price">
//                                                 <span>Price:</span>
//                                                 <strong>{order.price} {order.currency}/{order.cryptoCurrency}</strong>
//                                             </div>
//                                             <div className="detail available">
//                                                 <span>Available:</span>
//                                                 <strong>{order.available} {order.currency}</strong>
//                                             </div>
//                                             <div className="detail limit">
//                                                 <span>Limit:</span>
//                                                 <strong>{order.limit}</strong>
//                                             </div>
//                                             <div className="detail payment">
//                                                 <span>Payment:</span>
//                                                 <div className="payment-methods">
//                                                     {order.paymentMethods.map((method, idx) => (
//                                                         <span key={idx} className="payment-method">
//                                                             {method}
//                                                         </span>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="order-actions">
//                                             <button
//                                                 onClick={() => handleTrade(order)}
//                                                 className="trade-button"
//                                             >
//                                                 {state.activeTab === 'buy' ? 'Chat to Buy' : 'Chat to Sell'}
//                                             </button>
//                                             <button className="more-details-btn">
//                                                 <BsThreeDotsVertical />
//                                             </button>
//                                         </div>

//                                         {order.terms && (
//                                             <div className="order-terms">
//                                                 <p>{order.terms}</p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="user-orders-section">
//                     <div className="section-header">
//                         <h2>Your Orders</h2>
//                         <div className="tabs">
//                             <button className="tab active">All</button>
//                             <button className="tab">Open</button>
//                             <button className="tab">Completed</button>
//                             <button className="tab">Cancelled</button>
//                         </div>
//                     </div>

//                     <div className="orders-table-container">
//                         <table className="orders-table">
//                             <thead>
//                                 <tr>
//                                     <th>Type</th>
//                                     <th>Amount/Filled</th>
//                                     <th>Price</th>
//                                     <th>Total</th>
//                                     <th>Payment</th>
//                                     <th>Status</th>
//                                     <th>Date</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {state.userOrders.map(order => (
//                                     <tr
//                                         key={order.id}
//                                         id={`order-${order.id}`}
//                                         className={`order-row ${order.status} ${order.id === state.showOrderDetails ? 'highlighted' : ''}`}
//                                         onClick={() => setState(prev => ({ ...prev, showOrderDetails: order.id }))}
//                                     >
//                                         <td className={`type ${order.type}`}>
//                                             {order.type}
//                                         </td>
//                                         <td>
//                                             <div className="amount-filled">
//                                                 <span>{order.amount} {order.currency}</span>
//                                                 {order.amount !== order.filled && (
//                                                     <span className="filled-amount">
//                                                         ({order.filled} filled)
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </td>
//                                         <td>
//                                             {order.price} {order.currency}/{order.cryptoCurrency}
//                                         </td>
//                                         <td>
//                                             {(order.amount * order.price).toFixed(2)} {order.cryptoCurrency}
//                                         </td>
//                                         <td>
//                                             {order.paymentMethod}
//                                         </td>
//                                         <td>
//                                             <span className={`status status-${order.status}`}>
//                                                 {order.status.replace('_', ' ')}
//                                             </span>
//                                         </td>
//                                         <td>
//                                             {new Date(order.date).toLocaleDateString()}
//                                         </td>
//                                         <td>
//                                             <button
//                                                 className="details-btn"
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     setState(prev => ({ ...prev, showOrderDetails: order.id }));
//                                                 }}
//                                             >
//                                                 Details
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>

//             <div className="security-banner">
//                 <div className="security-content">
//                     <FaShieldAlt className="shield-icon" />
//                     <div className="security-text">
//                         <h3>Secure P2P Trading</h3>
//                         <p>All trades are protected by escrow. Your funds are safe with us.</p>
//                     </div>
//                     <button className="learn-more-btn">
//                         Learn More About Security
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default FiatP2P;


// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaStar, FaShieldAlt, FaExchangeAlt, FaBell, FaFilter, FaChartLine, FaRegClock, FaLock, FaCheckCircle, FaRegCommentDots, FaSearch } from 'react-icons/fa';
// import { MdPayment, MdAccountBalance, MdAttachMoney } from 'react-icons/md';
// import { RiRefund2Fill } from 'react-icons/ri';
// import { BsArrowLeftRight, BsThreeDotsVertical, BsMoon, BsSun } from 'react-icons/bs';
// import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
// import '../styles/fiatP2P.css';
// import axios from 'axios';
// import { useAuth } from '../contexts/AuthContext';

// const FiatP2P = () => {
//     const { isAuthenticated, loading: authLoading, logout } = useAuth();
//     const navigate = useNavigate();
//     const [darkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
//     const [state, setState] = useState({
//         userBalance: {
//             fiat: 12500.75,
//             crypto: 2.4567,
//             currency: 'USD',
//             cryptoCurrency: 'KSH'
//         },
//         activeTab: 'buy',
//         orders: [],
//         userOrders: [],
//         paymentMethods: [],
//         selectedPayment: '',
//         amount: '',
//         price: '',
//         filter: {
//             currency: 'USD',
//             paymentMethod: 'all',
//             amountRange: [0, 10000],
//             sortBy: 'price',
//             sortOrder: 'asc',
//             searchQuery: ''
//         },
//         showAdvancedFilters: false,
//         notificationCount: 3,
//         tradeInProgress: null,
//         chatOpen: false,
//         currentChat: null,
//         messages: [],
//         newMessage: '',
//         twoFactorAuth: true,
//         kycVerified: true,
//         showOrderDetails: null,
//         priceTrends: {},
//         marketStats: {},
//         securityDeposit: 0,
//         selectedOrderType: 'limit',
//         orderExpiry: '24h',
//         termsAccepted: false,
//         showTutorial: false,
//         activeStep: 0
//     });

//     // Toggle dark mode
//     const toggleDarkMode = () => {
//         setDarkMode(!darkMode);
//         document.documentElement.setAttribute('data-theme', !darkMode ? 'dark' : 'light');
//     };

//     // Load data from API
//     const loadData = async () => {
//         if (authLoading || !isAuthenticated) return;

//         try {
//             const token = localStorage.getItem('accessToken');
//             if (!token) {
//                 navigate('/login');
//                 return;
//             }

//             const headers = {
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             };

//             const [ordersResponse, paymentMethodsResponse, userOrdersResponse, priceTrendsResponse, marketStatsResponse] =
//                 await Promise.all([
//                     axios.get('http://localhost:8000/escrow/orders/', { headers }),
//                     axios.get('http://localhost:8000/escrow/payment-methods/', { headers }),
//                     axios.get('http://localhost:8000/escrow/user-orders/', { headers }),
//                     axios.get('http://localhost:8000/escrow/price-trends/', { headers }),
//                     axios.get('http://localhost:8000/escrow/market-stats/', { headers })
//                 ]);

//             const transformedOrders = ordersResponse.data.map(order => {
//                 let userDisplay;
//                 let userId;

//                 if (typeof order.user === 'object') {
//                     userDisplay = order.user.username || order.user.email || String(order.user.id);
//                     userId = order.user.id;
//                 } else {
//                     userDisplay = order.user || 'Unknown';
//                     userId = null;
//                 }

//                 const paymentMethods = Array.isArray(order.payment_methods)
//                     ? order.payment_methods.map(pm =>
//                         typeof pm === 'object' ? pm.name : String(pm)
//                     )
//                     : [];

//                 return {
//                     id: order.id,
//                     userId,
//                     type: order.order_type || 'buy',
//                     user: userDisplay,
//                     amount: parseFloat(order.amount) || 0,
//                     available: parseFloat(order.available) || 0,
//                     price: parseFloat(order.price) || 0,
//                     currency: order.currency || 'USD',
//                     cryptoCurrency: order.crypto_currency || 'KSH',
//                     paymentMethods,
//                     limit: order.min_limit && order.max_limit
//                         ? `${order.min_limit}-${order.max_limit} ${order.currency || 'USD'}`
//                         : 'N/A',
//                     rating: parseFloat(order.rating) || 0,
//                     trades: order.trades_count || 0,
//                     completionRate: parseFloat(order.completion_rate) || 0,
//                     avgReleaseTime: order.avg_release_time || 'N/A',
//                     terms: order.terms || '',
//                     online: Boolean(order.is_online),
//                     verificationLevel: order.verification_level || 1
//                 };
//             });

//             setState(prev => ({
//                 ...prev,
//                 orders: transformedOrders,
//                 paymentMethods: paymentMethodsResponse.data,
//                 userOrders: userOrdersResponse.data,
//                 priceTrends: priceTrendsResponse.data,
//                 marketStats: marketStatsResponse.data,
//                 securityDeposit: 200
//             }));

//         } catch (error) {
//             console.error('Error loading data:', error);
//             if (error.response?.status === 401) {
//                 logout();
//                 navigate('/login');
//             }
//         }
//     };

//     // Initial data load
//     useEffect(() => {
//         document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
//         if (!authLoading && isAuthenticated) {
//             loadData();
//         }
//     }, [authLoading, isAuthenticated, navigate, logout]);

//     // Filter and sort orders
//     const filteredOrders = state.orders
//         .filter(order => order.type === (state.activeTab === 'buy' ? 'sell' : 'buy'))
//         .filter(order => state.filter.currency === 'all' || order.currency === state.filter.currency)
//         .filter(order => state.filter.paymentMethod === 'all' ||
//             order.paymentMethods.some(method =>
//                 state.paymentMethods.find(pm => pm.id === state.filter.paymentMethod)?.name === method
//             ))
//         .filter(order => 
//             state.filter.searchQuery === '' ||
//             order.user.toLowerCase().includes(state.filter.searchQuery.toLowerCase()) ||
//             order.paymentMethods.some(method => 
//                 method.toLowerCase().includes(state.filter.searchQuery.toLowerCase())
//             )
//         )
//         .sort((a, b) => {
//             if (state.filter.sortBy === 'price') {
//                 return state.filter.sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
//             } else if (state.filter.sortBy === 'rating') {
//                 return state.filter.sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
//             } else if (state.filter.sortBy === 'amount') {
//                 return state.filter.sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
//             }
//             return 0;
//         });

//     // Calculate market price
//     const calculateMarketPrice = () => {
//         const relevantOrders = filteredOrders.filter(o => o.type === (state.activeTab === 'buy' ? 'sell' : 'buy'));
//         if (relevantOrders.length === 0) return 0;
//         const total = relevantOrders.reduce((sum, order) => sum + order.price, 0);
//         return (total / relevantOrders.length).toFixed(4);
//     };

//     // Get payment method details
//     const getPaymentMethodDetails = (id) => {
//         return state.paymentMethods.find(m => m.id === id) || {};
//     };

//     // Calculate order total
//     const calculateOrderTotal = () => {
//         if (state.amount && state.price) {
//             return (parseFloat(state.amount) * parseFloat(state.price)).toFixed(2);
//         }
//         return '0.00';
//     };

//     // Handle trade initiation
//     const handleTrade = async (order) => {
//         try {
//             const token = localStorage.getItem('accessToken');
//             const response = await axios.post(
//                 'http://localhost:8000/chat-room/api/trades/initiate/',
//                 {
//                     order_id: order.id,
//                     trade_type: state.activeTab
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     }
//                 }
//             );

//             navigate('/messages-p2p', {
//                 state: {
//                     tradeId: response.data.trade_id,
//                     chatRoomId: response.data.chat_room_id,
//                     counterparty: order.user,
//                     orderDetails: order,
//                     tradeType: state.activeTab,
//                     currency: order.currency,
//                     cryptoCurrency: order.cryptoCurrency,
//                     price: order.price
//                 }
//             });

//         } catch (error) {
//             console.error('Trade initiation failed:', error);
//             alert(`Failed to initiate trade: ${error.response?.data?.message || error.message}`);
//         }
//     };

//     // Handle order creation
//     const handleCreateOrder = async (e) => {
//         e.preventDefault();
//         if (!state.termsAccepted) {
//             alert('You must accept the terms and conditions');
//             return;
//         }

//         try {
//             const token = localStorage.getItem('accessToken');
//             if (!token) {
//                 navigate('/login');
//                 return;
//             }

//             const orderData = {
//                 order_type: state.activeTab,
//                 amount: state.amount,
//                 price: state.price,
//                 currency: state.filter.currency,
//                 crypto_currency: state.userBalance.cryptoCurrency,
//                 payment_methods: [parseInt(state.selectedPayment)],
//                 min_limit: (state.activeTab === 'buy' ? '10.00' : '5.00'),
//                 max_limit: '10000.00',
//                 terms: state.selectedOrderType === 'limit' ?
//                     `This is a limit order that expires in ${state.orderExpiry}` :
//                     'This is a market order',
//                 avg_release_time: '15 minutes'
//             };

//             const response = await axios.post(
//                 'http://localhost:8000/escrow/orders/',
//                 orderData,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             const newOrder = {
//                 id: response.data.id,
//                 type: response.data.order_type,
//                 user: response.data.user?.username || 'You',
//                 amount: parseFloat(response.data.amount),
//                 available: parseFloat(response.data.available),
//                 price: parseFloat(response.data.price),
//                 currency: response.data.currency,
//                 cryptoCurrency: response.data.crypto_currency,
//                 paymentMethods: response.data.payment_methods.map(pm => pm.name),
//                 limit: response.data.limit_range || 'N/A',
//                 terms: response.data.terms,
//                 avgReleaseTime: response.data.avg_release_time,
//                 status: 'pending',
//                 date: new Date().toISOString()
//             };

//             setState(prev => ({
//                 ...prev,
//                 orders: [...prev.orders, newOrder],
//                 userOrders: [newOrder, ...prev.userOrders],
//                 amount: '',
//                 price: '',
//                 selectedPayment: '',
//                 showOrderDetails: newOrder.id
//             }));

//         } catch (error) {
//             console.error('Error creating order:', error);
//             if (error.response?.status === 401) {
//                 logout();
//                 navigate('/login');
//             } else {
//                 alert(`Failed to create order: ${error.response?.data?.error || error.message}`);
//             }
//         }
//     };

//     return (
//         <div className={`fiat-p2p-container ${darkMode ? 'dark' : 'light'}`}>


//             {/* Main Content */}
//             <main className="p2p-main-content">
//                 {/* Trading Tabs */}
//                 <div className="trading-tabs-container">
//                     <div className="trading-tabs">
//                         <button
//                             className={`tab-button ${state.activeTab === 'buy' ? 'active' : ''}`}
//                             onClick={() => setState(prev => ({ ...prev, activeTab: 'buy' }))}
//                         >
//                             <MdAttachMoney /> Buy {state.userBalance.cryptoCurrency}
//                         </button>
//                         <button
//                             className={`tab-button ${state.activeTab === 'sell' ? 'active' : ''}`}
//                             onClick={() => setState(prev => ({ ...prev, activeTab: 'sell' }))}
//                         >
//                             <MdAttachMoney /> Sell {state.userBalance.cryptoCurrency}
//                         </button>
//                     </div>
//                     <div className="market-stats">
//                         <span>Market Price: {calculateMarketPrice()} {state.filter.currency}/{state.userBalance.cryptoCurrency}</span>
//                         <span>24h Volume: {state.marketStats.volume || '0'} {state.filter.currency}</span>
//                     </div>
//                 </div>

//                 {/* Two Column Layout */}
//                 <div className="p2p-grid-layout">
//                     {/* Order Creation Panel */}
//                     <div className="order-creation-panel">
//                         <div className="panel-header">
//                             <h2>
//                                 {state.activeTab === 'buy' ? 'Buy' : 'Sell'} Order
//                                 <span className="order-type-toggle">
//                                     <button
//                                         className={`type-btn ${state.selectedOrderType === 'limit' ? 'active' : ''}`}
//                                         onClick={() => setState(prev => ({ ...prev, selectedOrderType: 'limit' }))}
//                                     >
//                                         Limit
//                                     </button>
//                                     <button
//                                         className={`type-btn ${state.selectedOrderType === 'market' ? 'active' : ''}`}
//                                         onClick={() => setState(prev => ({ ...prev, selectedOrderType: 'market' }))}
//                                     >
//                                         Market
//                                     </button>
//                                 </span>
//                             </h2>
//                         </div>

//                         <form onSubmit={handleCreateOrder} className="order-form">
//                             {state.selectedOrderType === 'market' && (
//                                 <div className="market-price-notice">
//                                     <FaChartLine />
//                                     <span>You will {state.activeTab === 'buy' ? 'buy' : 'sell'} at the best available market price</span>
//                                 </div>
//                             )}

//                             <div className="form-group">
//                                 <label>
//                                     Amount ({state.filter.currency})
//                                     {state.selectedOrderType === 'limit' && (
//                                         <span className="hint">Min: {state.activeTab === 'buy' ? '10' : '5'}</span>
//                                     )}
//                                 </label>
//                                 <div className="input-with-actions">
//                                     <input
//                                         type="number"
//                                         value={state.amount}
//                                         onChange={(e) => setState(prev => ({ ...prev, amount: e.target.value }))}
//                                         placeholder={`0.00 ${state.filter.currency}`}
//                                         min={state.activeTab === 'buy' ? 10 : 5}
//                                         required
//                                     />
//                                     <div className="amount-actions">
//                                         <button type="button" onClick={() => setState(prev => ({ ...prev, amount: '25' }))}>25</button>
//                                         <button type="button" onClick={() => setState(prev => ({ ...prev, amount: '50' }))}>50</button>
//                                         <button type="button" onClick={() => setState(prev => ({ ...prev, amount: '100' }))}>100</button>
//                                     </div>
//                                 </div>
//                             </div>

//                             {state.selectedOrderType === 'limit' && (
//                                 <div className="form-group">
//                                     <label>Price ({state.filter.currency}/{state.userBalance.cryptoCurrency})</label>
//                                     <input
//                                         type="number"
//                                         value={state.price}
//                                         onChange={(e) => setState(prev => ({ ...prev, price: e.target.value }))}
//                                         placeholder={`0.00 ${state.filter.currency}`}
//                                         step="0.0001"
//                                         required
//                                     />
//                                 </div>
//                             )}

//                             <div className="form-group">
//                                 <label>Payment Method</label>
//                                 <select
//                                     value={state.selectedPayment}
//                                     onChange={(e) => setState(prev => ({ ...prev, selectedPayment: e.target.value }))}
//                                     required
//                                 >
//                                     <option value="">Select payment method</option>
//                                     {state.paymentMethods.map(method => (
//                                         <option key={method.id} value={method.id}>
//                                             {method.name} {method.fee > 0 ? `(${(method.fee * 100).toFixed(1)}% fee)` : ''}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {state.selectedPayment && (
//                                 <div className="payment-method-details">
//                                     <div className="detail-row">
//                                         <span>Processing Time:</span>
//                                         <strong>{getPaymentMethodDetails(state.selectedPayment).processingTime || 'Instant'}</strong>
//                                     </div>
//                                     {getPaymentMethodDetails(state.selectedPayment).fee > 0 && (
//                                         <div className="detail-row">
//                                             <span>Fee:</span>
//                                             <strong className="fee">{(getPaymentMethodDetails(state.selectedPayment).fee * 100)}%</strong>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {state.selectedOrderType === 'limit' && (
//                                 <div className="form-group">
//                                     <label>Order Expiry</label>
//                                     <select
//                                         value={state.orderExpiry}
//                                         onChange={(e) => setState(prev => ({ ...prev, orderExpiry: e.target.value }))}
//                                     >
//                                         <option value="1h">1 Hour</option>
//                                         <option value="6h">6 Hours</option>
//                                         <option value="12h">12 Hours</option>
//                                         <option value="24h">24 Hours</option>
//                                         <option value="3d">3 Days</option>
//                                         <option value="7d">7 Days</option>
//                                     </select>
//                                 </div>
//                             )}

//                             <div className="order-summary">
//                                 <div className="summary-row">
//                                     <span>Total {state.activeTab === 'buy' ? 'Cost' : 'Receive'}</span>
//                                     <strong>
//                                         {calculateOrderTotal()} {state.activeTab === 'buy' ? state.userBalance.cryptoCurrency : state.filter.currency}
//                                     </strong>
//                                 </div>
//                                 {state.securityDeposit > 0 && (
//                                     <div className="summary-row">
//                                         <span>Security Deposit</span>
//                                         <strong>{state.securityDeposit} {state.filter.currency}</strong>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="terms-agreement">
//                                 <input
//                                     type="checkbox"
//                                     id="terms-agree"
//                                     checked={state.termsAccepted}
//                                     onChange={(e) => setState(prev => ({ ...prev, termsAccepted: e.target.checked }))}
//                                 />
//                                 <label htmlFor="terms-agree">
//                                     I agree to the <a href="#">Terms of Service</a> and confirm I'm not from a restricted jurisdiction.
//                                 </label>
//                             </div>

//                             <button type="submit" className="submit-order-btn">
//                                 {state.selectedOrderType === 'market' ? (
//                                     <>
//                                         <FaExchangeAlt /> {state.activeTab === 'buy' ? 'Buy' : 'Sell'} Now
//                                     </>
//                                 ) : (
//                                     <>
//                                         <FaRegClock /> Place {state.activeTab === 'buy' ? 'Buy' : 'Sell'} Order
//                                     </>
//                                 )}
//                             </button>
//                         </form>
//                     </div>

//                     {/* Orders List Panel */}
//                     <div className="orders-list-panel">
//                         <div className="panel-header">
//                             <h2>Available {state.activeTab === 'buy' ? 'Sellers' : 'Buyers'}</h2>
//                             <div className="panel-actions">
//                                 <div className="search-box">
//                                     <FaSearch />
//                                     <input
//                                         type="text"
//                                         placeholder="Search traders or payment methods..."
//                                         value={state.filter.searchQuery}
//                                         onChange={(e) => setState(prev => ({
//                                             ...prev,
//                                             filter: { ...prev.filter, searchQuery: e.target.value }
//                                         }))}
//                                     />
//                                 </div>
//                                 <button
//                                     className={`filter-btn ${state.showAdvancedFilters ? 'active' : ''}`}
//                                     onClick={() => setState(prev => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }))}
//                                 >
//                                     <FaFilter /> Filters
//                                     {state.showAdvancedFilters ? <IoIosArrowUp /> : <IoIosArrowDown />}
//                                 </button>
//                             </div>
//                         </div>

//                         {state.showAdvancedFilters && (
//                             <div className="advanced-filters-panel">
//                                 <div className="filter-column">
//                                     <div className="filter-group">
//                                         <label>Currency</label>
//                                         <select
//                                             value={state.filter.currency}
//                                             onChange={(e) => setState(prev => ({
//                                                 ...prev,
//                                                 filter: { ...prev.filter, currency: e.target.value }
//                                             }))}
//                                         >
//                                             <option value="USD">USD</option>
//                                             <option value="EUR">EUR</option>
//                                             <option value="GBP">GBP</option>
//                                             <option value="KES">KES</option>
//                                             <option value="UGX">UGX</option>
//                                             <option value="TSH">TSH</option>
//                                         </select>
//                                     </div>

//                                     <div className="filter-group">
//                                         <label>Payment Method</label>
//                                         <select
//                                             value={state.filter.paymentMethod}
//                                             onChange={(e) => setState(prev => ({
//                                                 ...prev,
//                                                 filter: { ...prev.filter, paymentMethod: e.target.value }
//                                             }))}
//                                         >
//                                             <option value="all">All Methods</option>
//                                             {state.paymentMethods.map(method => (
//                                                 <option key={method.id} value={method.id}>{method.name}</option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                 </div>

//                                 <div className="filter-column">
//                                     <div className="filter-group">
//                                         <label>Amount Range ({state.filter.currency})</label>
//                                         <div className="range-inputs">
//                                             <input
//                                                 type="number"
//                                                 value={state.filter.amountRange[0]}
//                                                 onChange={(e) => setState(prev => ({
//                                                     ...prev,
//                                                     filter: {
//                                                         ...prev.filter,
//                                                         amountRange: [
//                                                             parseFloat(e.target.value) || 0,
//                                                             prev.filter.amountRange[1]
//                                                         ]
//                                                     }
//                                                 }))}
//                                                 placeholder="Min"
//                                             />
//                                             <span>to</span>
//                                             <input
//                                                 type="number"
//                                                 value={state.filter.amountRange[1]}
//                                                 onChange={(e) => setState(prev => ({
//                                                     ...prev,
//                                                     filter: {
//                                                         ...prev.filter,
//                                                         amountRange: [
//                                                             prev.filter.amountRange[0],
//                                                             parseFloat(e.target.value) || 10000
//                                                         ]
//                                                     }
//                                                 }))}
//                                                 placeholder="Max"
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="filter-group">
//                                         <label>Verification Level</label>
//                                         <select
//                                             value={state.filter.verification}
//                                             onChange={(e) => setState(prev => ({
//                                                 ...prev,
//                                                 filter: { ...prev.filter, verification: e.target.value }
//                                             }))}
//                                         >
//                                             <option value="any">Any Level</option>
//                                             <option value="1">Level 1+</option>
//                                             <option value="2">Level 2+</option>
//                                             <option value="3">Level 3</option>
//                                         </select>
//                                     </div>
//                                 </div>

//                                 <div className="filter-column">
//                                     <div className="filter-group">
//                                         <label>Sort By</label>
//                                         <div className="sort-controls">
//                                             <select
//                                                 value={state.filter.sortBy}
//                                                 onChange={(e) => setState(prev => ({
//                                                     ...prev,
//                                                     filter: { ...prev.filter, sortBy: e.target.value }
//                                                 }))}
//                                             >
//                                                 <option value="price">Price</option>
//                                                 <option value="rating">Rating</option>
//                                                 <option value="amount">Amount</option>
//                                                 <option value="trades">Trade Count</option>
//                                             </select>
//                                             <button
//                                                 className="sort-direction"
//                                                 onClick={() => setState(prev => ({
//                                                     ...prev,
//                                                     filter: {
//                                                         ...prev.filter,
//                                                         sortOrder: prev.filter.sortOrder === 'asc' ? 'desc' : 'asc'
//                                                     }
//                                                 }))}
//                                             >
//                                                 {state.filter.sortOrder === 'asc' ? '↑' : '↓'}
//                                             </button>
//                                         </div>
//                                     </div>

//                                     <button
//                                         className="reset-filters"
//                                         onClick={() => setState(prev => ({
//                                             ...prev,
//                                             filter: {
//                                                 currency: 'USD',
//                                                 paymentMethod: 'all',
//                                                 amountRange: [0, 10000],
//                                                 sortBy: 'price',
//                                                 sortOrder: 'asc',
//                                                 searchQuery: ''
//                                             }
//                                         }))}
//                                     >
//                                         Reset Filters
//                                     </button>
//                                 </div>
//                             </div>
//                         )}

//                         <div className="orders-table-container">
//                             <table className="orders-table">
//                                 <thead>
//                                     <tr>
//                                         <th>Trader</th>
//                                         <th>Price</th>
//                                         <th>Available</th>
//                                         <th>Payment</th>
//                                         <th>Trade</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredOrders.length === 0 ? (
//                                         <tr className="no-orders">
//                                             <td colSpan="5">
//                                                 No {state.activeTab === 'buy' ? 'sell' : 'buy'} orders matching your filters.
//                                             </td>
//                                         </tr>
//                                     ) : (
//                                         filteredOrders.map(order => (
//                                             <tr key={order.id} className="order-row">
//                                                 <td className="trader-cell">
//                                                     <div className="trader-info">
//                                                         <div className={`avatar ${order.online ? 'online' : ''}`}>
//                                                             {order.user.charAt(0).toUpperCase()}
//                                                         </div>
//                                                         <div className="trader-details">
//                                                             <span 
//                                                                 className="trader-name"
//                                                                 onClick={() => order.userId && navigate(`/profile-details-user/${order.userId}`)}
//                                                             >
//                                                                 {order.user}
//                                                             </span>
//                                                             <div className="trader-stats">
//                                                                 <span className="rating">
//                                                                     <FaStar /> {order.rating}
//                                                                 </span>
//                                                                 <span className="trades">
//                                                                     {order.trades} trades
//                                                                 </span>
//                                                                 <span className="completion">
//                                                                     {order.completionRate}%
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td className="price-cell">
//                                                     <strong>{order.price}</strong>
//                                                     <span>{order.currency}/{order.cryptoCurrency}</span>
//                                                 </td>
//                                                 <td className="available-cell">
//                                                     <strong>{order.available}</strong>
//                                                     <span>{order.currency}</span>
//                                                 </td>
//                                                 <td className="payment-cell">
//                                                     <div className="payment-methods">
//                                                         {order.paymentMethods.slice(0, 2).map((method, idx) => (
//                                                             <span key={idx} className="payment-method">
//                                                                 {method}
//                                                             </span>
//                                                         ))}
//                                                         {order.paymentMethods.length > 2 && (
//                                                             <span className="more-methods">
//                                                                 +{order.paymentMethods.length - 2} more
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </td>
//                                                 <td className="action-cell">
//                                                     <button
//                                                         onClick={() => handleTrade(order)}
//                                                         className="trade-btn"
//                                                     >
//                                                         {state.activeTab === 'buy' ? 'Buy' : 'Sell'}
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>

//                 {/* User Orders Section */}
//                 <div className="user-orders-section">
//                     <div className="section-header">
//                         <h2>Your Orders</h2>
//                         <div className="order-tabs">
//                             <button className="tab active">All</button>
//                             <button className="tab">Open</button>
//                             <button className="tab">Completed</button>
//                             <button className="tab">Cancelled</button>
//                         </div>
//                     </div>

//                     <div className="user-orders-table-container">
//                         <table className="user-orders-table">
//                             <thead>
//                                 <tr>
//                                     <th>Type</th>
//                                     <th>Amount/Filled</th>
//                                     <th>Price</th>
//                                     <th>Total</th>
//                                     <th>Status</th>
//                                     <th>Date</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {state.userOrders.map(order => (
//                                     <tr key={order.id} className={`user-order-row ${order.status}`}>
//                                         <td className={`type ${order.type}`}>
//                                             {order.type}
//                                         </td>
//                                         <td className="amount">
//                                             <div className="progress-bar-container">
//                                                 <div 
//                                                     className="progress-bar"
//                                                     style={{ width: `${(order.filled / order.amount) * 100}%` }}
//                                                 ></div>
//                                                 <span>
//                                                     {order.filled}/{order.amount} {order.currency}
//                                                 </span>
//                                             </div>
//                                         </td>
//                                         <td className="price">
//                                             {order.price} {order.currency}/{order.cryptoCurrency}
//                                         </td>
//                                         <td className="total">
//                                             {(order.amount * order.price).toFixed(2)} {order.cryptoCurrency}
//                                         </td>
//                                         <td className="status">
//                                             <span className={`status-badge ${order.status}`}>
//                                                 {order.status.replace('_', ' ')}
//                                             </span>
//                                         </td>
//                                         <td className="date">
//                                             {new Date(order.date).toLocaleDateString()}
//                                         </td>
//                                         <td className="actions">
//                                             <button
//                                                 className="details-btn"
//                                                 onClick={() => setState(prev => ({ ...prev, showOrderDetails: order.id }))}
//                                             >
//                                                 Details
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </main>

//             {/* Order Details Modal */}
//             {state.showOrderDetails && (
//                 <div className="modal-overlay">
//                     <div className="order-details-modal">
//                         <div className="modal-header">
//                             <h3>Order Details</h3>
//                             <button
//                                 onClick={() => setState(prev => ({ ...prev, showOrderDetails: null }))}
//                                 className="close-modal"
//                             >
//                                 &times;
//                             </button>
//                         </div>

//                         <div className="modal-body">
//                             {(() => {
//                                 const order = state.userOrders.find(o => o.id === state.showOrderDetails);
//                                 if (!order) return null;

//                                 return (
//                                     <div className="order-details-grid">
//                                         <div className="detail-item">
//                                             <span>Order ID</span>
//                                             <strong>#{order.id}</strong>
//                                         </div>
//                                         <div className="detail-item">
//                                             <span>Type</span>
//                                             <strong className={`type ${order.type}`}>{order.type}</strong>
//                                         </div>
//                                         <div className="detail-item">
//                                             <span>Amount</span>
//                                             <strong>{order.amount} {order.currency}</strong>
//                                         </div>
//                                         <div className="detail-item">
//                                             <span>Filled</span>
//                                             <strong>{order.filled} {order.currency}</strong>
//                                         </div>
//                                         <div className="detail-item">
//                                             <span>Price</span>
//                                             <strong>{order.price} {order.currency}/{order.cryptoCurrency}</strong>
//                                         </div>
//                                         <div className="detail-item">
//                                             <span>Total Value</span>
//                                             <strong>{(order.amount * order.price).toFixed(2)} {order.cryptoCurrency}</strong>
//                                         </div>
//                                         <div className="detail-item">
//                                             <span>Status</span>
//                                             <strong className={`status ${order.status}`}>
//                                                 {order.status.replace('_', ' ')}
//                                             </strong>
//                                         </div>
//                                         <div className="detail-item">
//                                             <span>Payment Method</span>
//                                             <strong>{order.paymentMethods.join(', ')}</strong>
//                                         </div>
//                                         <div className="detail-item">
//                                             <span>Created</span>
//                                             <strong>{new Date(order.date).toLocaleString()}</strong>
//                                         </div>
//                                         {order.counterparty && (
//                                             <div className="detail-item">
//                                                 <span>Counterparty</span>
//                                                 <strong>{order.counterparty}</strong>
//                                             </div>
//                                         )}
//                                         {order.terms && (
//                                             <div className="detail-item full-width">
//                                                 <span>Terms</span>
//                                                 <p>{order.terms}</p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 );
//                             })()}
//                         </div>

//                         <div className="modal-footer">
//                             {(() => {
//                                 const order = state.userOrders.find(o => o.id === state.showOrderDetails);
//                                 if (!order) return null;

//                                 return (
//                                     <div className="modal-actions">
//                                         {order.status === 'pending' && (
//                                             <button className="cancel-order-btn">
//                                                 Cancel Order
//                                             </button>
//                                         )}
//                                         {order.status === 'completed' && (
//                                             <button className="feedback-btn">
//                                                 <FaRegCommentDots /> Leave Feedback
//                                             </button>
//                                         )}
//                                         <button 
//                                             className="close-btn"
//                                             onClick={() => setState(prev => ({ ...prev, showOrderDetails: null }))}
//                                         >
//                                             Close
//                                         </button>
//                                     </div>
//                                 );
//                             })()}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Security Banner */}
//             <div className="security-banner">
//                 <div className="banner-content">
//                     <div className="security-icon">
//                         <FaShieldAlt />
//                     </div>
//                     <div className="security-text">
//                         <h3>Secure P2P Trading with Escrow Protection</h3>
//                         <p>All trades are protected by CheetahX escrow system. Your funds are held securely until the transaction is completed.</p>
//                     </div>
//                     <button className="learn-more-btn">
//                         How It Works
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default FiatP2P;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaShieldAlt, FaExchangeAlt, FaBell, FaFilter, FaChartLine, FaRegClock, FaLock, FaCheckCircle, FaRegCommentDots, FaSearch } from 'react-icons/fa';
import { MdPayment, MdAccountBalance, MdAttachMoney } from 'react-icons/md';
import { RiRefund2Fill } from 'react-icons/ri';
import { BsArrowLeftRight, BsThreeDotsVertical, BsMoon, BsSun } from 'react-icons/bs';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import '../styles/fiatP2P.css';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const FiatP2P = () => {
    const { isAuthenticated, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const [state, setState] = useState({
        userBalance: {
            fiat: 12500.75,
            crypto: 2.4567,
            currency: 'USD',
            cryptoCurrency: 'KSH'
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
            sortOrder: 'asc',
            searchQuery: '',
            sellCurrency: 'USD',  // New field for sell currency
            receiveCurrency: 'KES' // New field for receive currency
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

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.setAttribute('data-theme', !darkMode ? 'dark' : 'light');
    };

    // Load data from API
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
                    userId = order.user.id;
                } else {
                    userDisplay = order.user || 'Unknown';
                    userId = null;
                }

                const paymentMethods = Array.isArray(order.payment_methods)
                    ? order.payment_methods.map(pm =>
                        typeof pm === 'object' ? pm.name : String(pm)
                    )
                    : [];

                return {
                    id: order.id,
                    userId,
                    type: order.order_type || 'buy',
                    user: userDisplay,
                    amount: parseFloat(order.amount) || 0,
                    available: parseFloat(order.available) || 0,
                    price: parseFloat(order.price) || 0,
                    currency: order.currency || 'USD',
                    cryptoCurrency: order.crypto_currency || 'KSH',
                    sellCurrency: order.sell_currency || 'USD', // New field
                    receiveCurrency: order.receive_currency || 'KES', // New field
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
                    verificationLevel: order.verification_level || 1
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

        } catch (error) {
            console.error('Error loading data:', error);
            if (error.response?.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    // Initial data load
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        if (!authLoading && isAuthenticated) {
            loadData();
        }
    }, [authLoading, isAuthenticated, navigate, logout]);

    // Filter and sort orders
    const filteredOrders = state.orders
        .filter(order => order.type === (state.activeTab === 'buy' ? 'sell' : 'buy'))
        .filter(order => 
            (state.filter.sellCurrency === 'all' || order.sellCurrency === state.filter.sellCurrency) &&
            (state.filter.receiveCurrency === 'all' || order.receiveCurrency === state.filter.receiveCurrency)
        )
        .filter(order => state.filter.paymentMethod === 'all' ||
            order.paymentMethods.some(method =>
                state.paymentMethods.find(pm => pm.id === state.filter.paymentMethod)?.name === method
            ))
        .filter(order => 
            state.filter.searchQuery === '' ||
            order.user.toLowerCase().includes(state.filter.searchQuery.toLowerCase()) ||
            order.paymentMethods.some(method => 
                method.toLowerCase().includes(state.filter.searchQuery.toLowerCase())
            )
        )
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

    // Calculate market price
    const calculateMarketPrice = () => {
        const relevantOrders = filteredOrders.filter(o => 
            o.type === (state.activeTab === 'buy' ? 'sell' : 'buy') &&
            o.sellCurrency === state.filter.sellCurrency &&
            o.receiveCurrency === state.filter.receiveCurrency
        );
        if (relevantOrders.length === 0) return 0;
        const total = relevantOrders.reduce((sum, order) => sum + order.price, 0);
        return (total / relevantOrders.length).toFixed(4);
    };

    // Get payment method details
    const getPaymentMethodDetails = (id) => {
        return state.paymentMethods.find(m => m.id === id) || {};
    };

    // Calculate order total based on custom exchange rate
    const calculateOrderTotal = () => {
        if (state.amount && state.price) {
            if (state.activeTab === 'buy') {
                // When buying, amount is in sell currency, total is in receive currency
                return (parseFloat(state.amount) * parseFloat(state.price)).toFixed(2);
            } else {
                // When selling, amount is in receive currency, total is in sell currency
                return (parseFloat(state.amount) / parseFloat(state.price)).toFixed(2);
            }
        }
        return '0.00';
    };

    // Handle trade initiation
    const handleTrade = async (order) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(
                'http://localhost:8000/chat-room/api/trades/initiate/',
                {
                    order_id: order.id,
                    trade_type: state.activeTab,
                    sell_currency: order.sellCurrency,
                    receive_currency: order.receiveCurrency,
                    exchange_rate: order.price
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            navigate('/messages-p2p', {
                state: {
                    tradeId: response.data.trade_id,
                    chatRoomId: response.data.chat_room_id,
                    counterparty: order.user,
                    orderDetails: order,
                    tradeType: state.activeTab,
                    sellCurrency: order.sellCurrency,
                    receiveCurrency: order.receiveCurrency,
                    exchangeRate: order.price
                }
            });

        } catch (error) {
            console.error('Trade initiation failed:', error);
            alert(`Failed to initiate trade: ${error.response?.data?.message || error.message}`);
        }
    };

    // Handle order creation with custom currency exchange
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
                currency: state.filter.sellCurrency, // Using sell currency as primary currency
                crypto_currency: state.userBalance.cryptoCurrency,
                sell_currency: state.filter.sellCurrency,
                receive_currency: state.filter.receiveCurrency,
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

            const newOrder = {
                id: response.data.id,
                type: response.data.order_type,
                user: response.data.user?.username || 'You',
                amount: parseFloat(response.data.amount),
                available: parseFloat(response.data.available),
                price: parseFloat(response.data.price),
                currency: response.data.currency,
                cryptoCurrency: response.data.crypto_currency,
                sellCurrency: response.data.sell_currency,
                receiveCurrency: response.data.receive_currency,
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

    // Currency options - you can expand this list
    const currencyOptions = ['USD', 'EUR', 'GBP', 'KES', 'UGX', 'TZS', 'NGN', 'ZAR', 'GHS', 'XAF'];

    return (
        <div className={`fiat-p2p-container ${darkMode ? 'dark' : 'light'}`}>
            {/* Main Content */}
            <main className="p2p-main-content">
                {/* Trading Tabs */}
                <div className="trading-tabs-container">
                    <div className="trading-tabs">
                        <button
                            className={`tab-button ${state.activeTab === 'buy' ? 'active' : ''}`}
                            onClick={() => setState(prev => ({ ...prev, activeTab: 'buy' }))}
                        >
                            <MdAttachMoney /> Buy {state.filter.receiveCurrency}
                        </button>
                        <button
                            className={`tab-button ${state.activeTab === 'sell' ? 'active' : ''}`}
                            onClick={() => setState(prev => ({ ...prev, activeTab: 'sell' }))}
                        >
                            <MdAttachMoney /> Sell {state.filter.sellCurrency}
                        </button>
                    </div>
                    <div className="market-stats">
                        <span>Market Rate: 1 {state.filter.sellCurrency} = {calculateMarketPrice()} {state.filter.receiveCurrency}</span>
                        <span>24h Volume: {state.marketStats.volume || '0'} {state.filter.sellCurrency}</span>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="p2p-grid-layout">
                    {/* Order Creation Panel */}
                    <div className="order-creation-panel">
                        <div className="panel-header">
                            <h2>
                                {state.activeTab === 'buy' ? 'Buy' : 'Sell'} Order
                                <span className="order-type-toggle">
                                    <button
                                        className={`type-btn ${state.selectedOrderType === 'limit' ? 'active' : ''}`}
                                        onClick={() => setState(prev => ({ ...prev, selectedOrderType: 'limit' }))}
                                    >
                                        Limit
                                    </button>
                                    <button
                                        className={`type-btn ${state.selectedOrderType === 'market' ? 'active' : ''}`}
                                        onClick={() => setState(prev => ({ ...prev, selectedOrderType: 'market' }))}
                                    >
                                        Market
                                    </button>
                                </span>
                            </h2>
                        </div>

                        <form onSubmit={handleCreateOrder} className="order-form">
                            {state.selectedOrderType === 'market' && (
                                <div className="market-price-notice">
                                    <FaChartLine />
                                    <span>You will {state.activeTab === 'buy' ? 'buy' : 'sell'} at the best available market price</span>
                                </div>
                            )}

                            {/* Currency selection for exchange */}
                            <div className="form-group">
                                <label>Exchange Currencies</label>
                                <div className="currency-exchange-selector">
                                    <select
                                        value={state.filter.sellCurrency}
                                        onChange={(e) => setState(prev => ({
                                            ...prev,
                                            filter: {
                                                ...prev.filter,
                                                sellCurrency: e.target.value
                                            }
                                        }))}
                                    >
                                        {currencyOptions.map(currency => (
                                            <option key={`sell-${currency}`} value={currency}>{currency}</option>
                                        ))}
                                    </select>
                                    <div className="exchange-icon">
                                        <BsArrowLeftRight />
                                    </div>
                                    <select
                                        value={state.filter.receiveCurrency}
                                        onChange={(e) => setState(prev => ({
                                            ...prev,
                                            filter: {
                                                ...prev.filter,
                                                receiveCurrency: e.target.value
                                            }
                                        }))}
                                    >
                                        {currencyOptions.map(currency => (
                                            <option key={`receive-${currency}`} value={currency}>{currency}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    {state.activeTab === 'buy' ? 'You Spend' : 'You Receive'} ({state.activeTab === 'buy' ? state.filter.sellCurrency : state.filter.receiveCurrency})
                                    {state.selectedOrderType === 'limit' && (
                                        <span className="hint">Min: {state.activeTab === 'buy' ? '10' : '5'}</span>
                                    )}
                                </label>
                                <div className="input-with-actions">
                                    <input
                                        type="number"
                                        value={state.amount}
                                        onChange={(e) => setState(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder={`0.00 ${state.activeTab === 'buy' ? state.filter.sellCurrency : state.filter.receiveCurrency}`}
                                        min={state.activeTab === 'buy' ? 10 : 5}
                                        required
                                    />
                                    <div className="amount-actions">
                                        <button type="button" onClick={() => setState(prev => ({ ...prev, amount: '25' }))}>25</button>
                                        <button type="button" onClick={() => setState(prev => ({ ...prev, amount: '50' }))}>50</button>
                                        <button type="button" onClick={() => setState(prev => ({ ...prev, amount: '100' }))}>100</button>
                                    </div>
                                </div>
                            </div>

                            {state.selectedOrderType === 'limit' && (
                                <div className="form-group">
                                    <label>Exchange Rate (1 {state.filter.sellCurrency} = X {state.filter.receiveCurrency})</label>
                                    <input
                                        type="number"
                                        value={state.price}
                                        onChange={(e) => setState(prev => ({ ...prev, price: e.target.value }))}
                                        placeholder={`Rate in ${state.filter.receiveCurrency}`}
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
                                <div className="payment-method-details">
                                    <div className="detail-row">
                                        <span>Processing Time:</span>
                                        <strong>{getPaymentMethodDetails(state.selectedPayment).processingTime || 'Instant'}</strong>
                                    </div>
                                    {getPaymentMethodDetails(state.selectedPayment).fee > 0 && (
                                        <div className="detail-row">
                                            <span>Fee:</span>
                                            <strong className="fee">{(getPaymentMethodDetails(state.selectedPayment).fee * 100)}%</strong>
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
                                <div className="summary-row">
                                    <span>Total {state.activeTab === 'buy' ? 'You Get' : 'You Pay'}</span>
                                    <strong>
                                        {calculateOrderTotal()} {state.activeTab === 'buy' ? state.filter.receiveCurrency : state.filter.sellCurrency}
                                    </strong>
                                </div>
                                {state.securityDeposit > 0 && (
                                    <div className="summary-row">
                                        <span>Security Deposit</span>
                                        <strong>{state.securityDeposit} {state.filter.sellCurrency}</strong>
                                    </div>
                                )}
                            </div>

                            <div className="terms-agreement">
                                <input
                                    type="checkbox"
                                    id="terms-agree"
                                    checked={state.termsAccepted}
                                    onChange={(e) => setState(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                                />
                                <label htmlFor="terms-agree">
                                    I agree to the <a href="#">Terms of Service</a> and confirm I'm not from a restricted jurisdiction.
                                </label>
                            </div>

                            <button type="submit" className="submit-order-btn">
                                {state.selectedOrderType === 'market' ? (
                                    <>
                                        <FaExchangeAlt /> {state.activeTab === 'buy' ? 'Buy' : 'Sell'} Now
                                    </>
                                ) : (
                                    <>
                                        <FaRegClock /> Place {state.activeTab === 'buy' ? 'Buy' : 'Sell'} Order
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Orders List Panel */}
                    <div className="orders-list-panel">
                        <div className="panel-header">
                            <h2>Available {state.activeTab === 'buy' ? 'Sellers' : 'Buyers'}</h2>
                            <div className="panel-actions">
                                <div className="search-box">
                                    <FaSearch />
                                    <input
                                        type="text"
                                        placeholder="Search traders or payment methods..."
                                        value={state.filter.searchQuery}
                                        onChange={(e) => setState(prev => ({
                                            ...prev,
                                            filter: { ...prev.filter, searchQuery: e.target.value }
                                        }))}
                                    />
                                </div>
                                <button
                                    className={`filter-btn ${state.showAdvancedFilters ? 'active' : ''}`}
                                    onClick={() => setState(prev => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }))}
                                >
                                    <FaFilter /> Filters
                                    {state.showAdvancedFilters ? <IoIosArrowUp /> : <IoIosArrowDown />}
                                </button>
                            </div>
                        </div>

                        {state.showAdvancedFilters && (
                            <div className="advanced-filters-panel">
                                <div className="filter-column">
                                    <div className="filter-group">
                                        <label>Sell Currency</label>
                                        <select
                                            value={state.filter.sellCurrency}
                                            onChange={(e) => setState(prev => ({
                                                ...prev,
                                                filter: { ...prev.filter, sellCurrency: e.target.value }
                                            }))}
                                        >
                                            <option value="all">All Currencies</option>
                                            {currencyOptions.map(currency => (
                                                <option key={`filter-sell-${currency}`} value={currency}>{currency}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="filter-group">
                                        <label>Receive Currency</label>
                                        <select
                                            value={state.filter.receiveCurrency}
                                            onChange={(e) => setState(prev => ({
                                                ...prev,
                                                filter: { ...prev.filter, receiveCurrency: e.target.value }
                                            }))}
                                        >
                                            <option value="all">All Currencies</option>
                                            {currencyOptions.map(currency => (
                                                <option key={`filter-receive-${currency}`} value={currency}>{currency}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="filter-column">
                                    <div className="filter-group">
                                        <label>Payment Method</label>
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
                                        <label>Amount Range ({state.filter.sellCurrency})</label>
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
                                </div>

                                <div className="filter-column">
                                    <div className="filter-group">
                                        <label>Sort By</label>
                                        <div className="sort-controls">
                                            <select
                                                value={state.filter.sortBy}
                                                onChange={(e) => setState(prev => ({
                                                    ...prev,
                                                    filter: { ...prev.filter, sortBy: e.target.value }
                                                }))}
                                            >
                                                <option value="price">Exchange Rate</option>
                                                <option value="rating">Rating</option>
                                                <option value="amount">Amount</option>
                                                <option value="trades">Trade Count</option>
                                            </select>
                                            <button
                                                className="sort-direction"
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
                                    </div>

                                    <button
                                        className="reset-filters"
                                        onClick={() => setState(prev => ({
                                            ...prev,
                                            filter: {
                                                ...prev.filter,
                                                sellCurrency: 'USD',
                                                receiveCurrency: 'KES',
                                                paymentMethod: 'all',
                                                amountRange: [0, 10000],
                                                sortBy: 'price',
                                                sortOrder: 'asc',
                                                searchQuery: ''
                                            }
                                        }))}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="orders-table-container">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Trader</th>
                                        <th>Exchange Rate</th>
                                        <th>Available</th>
                                        <th>Payment</th>
                                        <th>Trade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.length === 0 ? (
                                        <tr className="no-orders">
                                            <td colSpan="5">
                                                No {state.activeTab === 'buy' ? 'sell' : 'buy'} orders matching your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map(order => (
                                            <tr key={order.id} className="order-row">
                                                <td className="trader-cell">
                                                    <div className="trader-info">
                                                        <div className={`avatar ${order.online ? 'online' : ''}`}>
                                                            {order.user.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="trader-details">
                                                            <span 
                                                                className="trader-name"
                                                                onClick={() => order.userId && navigate(`/profile-details-user/${order.userId}`)}
                                                            >
                                                                {order.user}
                                                            </span>
                                                            <div className="trader-stats">
                                                                <span className="rating">
                                                                    <FaStar /> {order.rating}
                                                                </span>
                                                                <span className="trades">
                                                                    {order.trades} trades
                                                                </span>
                                                                <span className="completion">
                                                                    {order.completionRate}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="price-cell">
                                                    <strong>1 {order.sellCurrency} = {order.price} {order.receiveCurrency}</strong>
                                                </td>
                                                <td className="available-cell">
                                                    <strong>{order.available}</strong>
                                                    <span>{order.sellCurrency}</span>
                                                </td>
                                                <td className="payment-cell">
                                                    <div className="payment-methods">
                                                        {order.paymentMethods.slice(0, 2).map((method, idx) => (
                                                            <span key={idx} className="payment-method">
                                                                {method}
                                                            </span>
                                                        ))}
                                                        {order.paymentMethods.length > 2 && (
                                                            <span className="more-methods">
                                                                +{order.paymentMethods.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="action-cell">
                                                    <button
                                                        onClick={() => handleTrade(order)}
                                                        className="trade-btn"
                                                    >
                                                        {state.activeTab === 'buy' ? 'Buy' : 'Sell'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* User Orders Section */}
                <div className="user-orders-section">
                    <div className="section-header">
                        <h2>Your Orders</h2>
                        <div className="order-tabs">
                            <button className="tab active">All</button>
                            <button className="tab">Open</button>
                            <button className="tab">Completed</button>
                            <button className="tab">Cancelled</button>
                        </div>
                    </div>

                    <div className="user-orders-table-container">
                        <table className="user-orders-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Amount/Filled</th>
                                    <th>Exchange Rate</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.userOrders.map(order => (
                                    <tr key={order.id} className={`user-order-row ${order.status}`}>
                                        <td className={`type ${order.type}`}>
                                            {order.type} {order.sellCurrency} for {order.receiveCurrency}
                                        </td>
                                        <td className="amount">
                                            <div className="progress-bar-container">
                                                <div 
                                                    className="progress-bar"
                                                    style={{ width: `${(order.filled / order.amount) * 100}%` }}
                                                ></div>
                                                <span>
                                                    {order.filled}/{order.amount} {order.sellCurrency}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="price">
                                            1 {order.sellCurrency} = {order.price} {order.receiveCurrency}
                                        </td>
                                        <td className="total">
                                            {order.type === 'buy' 
                                                ? (order.amount * order.price).toFixed(2) 
                                                : (order.amount / order.price).toFixed(2)} 
                                            {order.type === 'buy' ? order.receiveCurrency : order.sellCurrency}
                                        </td>
                                        <td className="status">
                                            <span className={`status-badge ${order.status}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="date">
                                            {new Date(order.date).toLocaleDateString()}
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="details-btn"
                                                onClick={() => setState(prev => ({ ...prev, showOrderDetails: order.id }))}
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
            </main>

            {/* Order Details Modal */}
            {state.showOrderDetails && (
                <div className="modal-overlay">
                    <div className="order-details-modal">
                        <div className="modal-header">
                            <h3>Order Details</h3>
                            <button
                                onClick={() => setState(prev => ({ ...prev, showOrderDetails: null }))}
                                className="close-modal"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="modal-body">
                            {(() => {
                                const order = state.userOrders.find(o => o.id === state.showOrderDetails);
                                if (!order) return null;

                                return (
                                    <div className="order-details-grid">
                                        <div className="detail-item">
                                            <span>Order ID</span>
                                            <strong>#{order.id}</strong>
                                        </div>
                                        <div className="detail-item">
                                            <span>Type</span>
                                            <strong className={`type ${order.type}`}>
                                                {order.type} {order.sellCurrency} for {order.receiveCurrency}
                                            </strong>
                                        </div>
                                        <div className="detail-item">
                                            <span>Amount</span>
                                            <strong>{order.amount} {order.sellCurrency}</strong>
                                        </div>
                                        <div className="detail-item">
                                            <span>Filled</span>
                                            <strong>{order.filled} {order.sellCurrency}</strong>
                                        </div>
                                        <div className="detail-item">
                                            <span>Exchange Rate</span>
                                            <strong>1 {order.sellCurrency} = {order.price} {order.receiveCurrency}</strong>
                                        </div>
                                        <div className="detail-item">
                                            <span>Total Value</span>
                                            <strong>
                                                {order.type === 'buy' 
                                                    ? (order.amount * order.price).toFixed(2) 
                                                    : (order.amount / order.price).toFixed(2)} 
                                                {order.type === 'buy' ? order.receiveCurrency : order.sellCurrency}
                                            </strong>
                                        </div>
                                        <div className="detail-item">
                                            <span>Status</span>
                                            <strong className={`status ${order.status}`}>
                                                {order.status.replace('_', ' ')}
                                            </strong>
                                        </div>
                                        <div className="detail-item">
                                            <span>Payment Method</span>
                                            <strong>{order.paymentMethods?.join(', ') || 'N/A'}</strong>
                                        </div>
                                        <div className="detail-item">
                                            <span>Created</span>
                                            <strong>{new Date(order.date).toLocaleString()}</strong>
                                        </div>
                                        {order.counterparty && (
                                            <div className="detail-item">
                                                <span>Counterparty</span>
                                                <strong>{order.counterparty}</strong>
                                            </div>
                                        )}
                                        {order.terms && (
                                            <div className="detail-item full-width">
                                                <span>Terms</span>
                                                <p>{order.terms}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="modal-footer">
                            {(() => {
                                const order = state.userOrders.find(o => o.id === state.showOrderDetails);
                                if (!order) return null;

                                return (
                                    <div className="modal-actions">
                                        {order.status === 'pending' && (
                                            <button className="cancel-order-btn">
                                                Cancel Order
                                            </button>
                                        )}
                                        {order.status === 'completed' && (
                                            <button className="feedback-btn">
                                                <FaRegCommentDots /> Leave Feedback
                                            </button>
                                        )}
                                        <button 
                                            className="close-btn"
                                            onClick={() => setState(prev => ({ ...prev, showOrderDetails: null }))}
                                        >
                                            Close
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Security Banner */}
            <div className="security-banner">
                <div className="banner-content">
                    <div className="security-icon">
                        <FaShieldAlt />
                    </div>
                    <div className="security-text">
                        <h3>Secure P2P Trading with Escrow Protection</h3>
                        <p>All trades are protected by CheetahX escrow system. Your funds are held securely until the transaction is completed.</p>
                    </div>
                    <button className="learn-more-btn">
                        How It Works
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FiatP2P;