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
    const handleLearnMoreClick = () => {
        navigate('/tutorials');
    };

    // Separate state for order placement and filtering
    const [orderState, setOrderState] = useState({
        selectedPayment: '',
        amount: '',
        price: '',
        selectedOrderType: 'limit',
        orderExpiry: '24h',
        termsAccepted: false,
        sellCurrency: 'USD',
        receiveCurrency: 'KES'
    });

    const [filterState, setFilterState] = useState({
        currency: 'USD',
        paymentMethod: 'all',
        amountRange: [0, 10000],
        sortBy: 'price',
        sortOrder: 'asc',
        searchQuery: '',
        sellCurrency: 'USD',
        receiveCurrency: 'KES'
    });

    const [uiState, setUiState] = useState({
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
        showTutorial: false,
        activeStep: 0
    });

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.setAttribute('data-theme', !darkMode ? 'dark' : 'light');
    };

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

            // Fetch all data in parallel
            const [ordersResponse, paymentMethodsResponse, userOrdersResponse, priceTrendsResponse] = await Promise.all([
                axios.get('http://localhost:8000/escrow/orders/', { headers }),
                axios.get('http://localhost:8000/escrow/payment-methods-fiat/', { headers }),
                axios.get('http://localhost:8000/escrow/user-orders/', { headers }),
                axios.get('http://localhost:8000/escrow/price-trends/', { headers }),
            ]);

            // Transform market orders
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

                // Handle payment methods - ensure we always get an array of method names
                let paymentMethods = [];
                if (Array.isArray(order.payment_methods)) {
                    paymentMethods = order.payment_methods; // Keep the full objects
                }

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
                    sellCurrency: order.sell_currency || 'USD',
                    receiveCurrency: order.receive_currency || 'KES',
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

            // Transform user orders
            const transformedUserOrders = userOrdersResponse.data.map(order => {
                let paymentMethods = [];
                if (Array.isArray(order.payment_methods)) {
                    paymentMethods = order.payment_methods.map(method =>
                        typeof method === 'object' ? method.name : method
                    );
                } else if (order.payment_method) {
                    paymentMethods = [typeof order.payment_method === 'object'
                        ? order.payment_method.name
                        : order.payment_method];
                }

                return {
                    id: order.id,
                    type: order.order_type,
                    amount: parseFloat(order.amount),
                    filled: parseFloat(order.filled),
                    price: parseFloat(order.price),
                    currency: order.currency,
                    cryptoCurrency: order.crypto_currency,
                    sellCurrency: order.sell_currency,
                    receiveCurrency: order.receive_currency,
                    paymentMethods,
                    limit: order.limit_range || 'N/A',
                    terms: order.terms,
                    status: order.status,
                    date: order.created_at || order.date,
                    counterparty: order.counterparty,
                    isEscrow: order.is_escrow,
                    hasDispute: order.has_dispute
                };
            });

            setUiState(prev => ({
                ...prev,
                orders: transformedOrders,
                paymentMethods: paymentMethodsResponse.data,
                userOrders: transformedUserOrders,
                priceTrends: priceTrendsResponse.data,
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

    // Filter and sort orders - now only uses filterState
    const filteredOrders = uiState.orders
        .filter(order => order.type === (uiState.activeTab === 'buy' ? 'sell' : 'buy'))
        .filter(order =>
            (filterState.sellCurrency === 'all' || order.sellCurrency === filterState.sellCurrency) &&
            (filterState.receiveCurrency === 'all' || order.receiveCurrency === filterState.receiveCurrency)
        )
        .filter(order => filterState.paymentMethod === 'all' ||
            order.paymentMethods.some(method => method.id === parseInt(filterState.paymentMethod))
        )
        .filter(order =>
            filterState.searchQuery === '' ||
            order.user.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
            order.paymentMethods.some(method =>
                method.name.toLowerCase().includes(filterState.searchQuery.toLowerCase())
            )
        )
        .sort((a, b) => {
            if (filterState.sortBy === 'price') {
                return filterState.sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
            } else if (filterState.sortBy === 'rating') {
                return filterState.sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
            } else if (filterState.sortBy === 'amount') {
                return filterState.sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            }
            return 0;
        });

    // Calculate market price
    const calculateMarketPrice = () => {
        const relevantOrders = filteredOrders.filter(o =>
            o.type === (uiState.activeTab === 'buy' ? 'sell' : 'buy') &&
            o.sellCurrency === filterState.sellCurrency &&
            o.receiveCurrency === filterState.receiveCurrency
        );
        if (relevantOrders.length === 0) return 0;
        const total = relevantOrders.reduce((sum, order) => sum + order.price, 0);
        return total / relevantOrders.length;
    };

    // Get payment method details
    const getPaymentMethodDetails = (id) => {
        return uiState.paymentMethods.find(m => m.id === id) || {};
    };

    const calculateOrderTotal = () => {
        if (orderState.amount && orderState.price) {
            if (uiState.activeTab === 'buy') {
                return (parseFloat(orderState.amount) * parseFloat(orderState.price)).toFixed(2);
            } else {
                return (parseFloat(orderState.amount) / parseFloat(orderState.price)).toFixed(2);
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
                    trade_type: uiState.activeTab,
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
                    tradeType: uiState.activeTab,
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

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!orderState.termsAccepted) {
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
                order_type: uiState.activeTab,
                amount: orderState.amount,
                price: orderState.price,
                currency: orderState.sellCurrency,
                crypto_currency: uiState.userBalance.cryptoCurrency,
                sell_currency: orderState.sellCurrency,
                receive_currency: orderState.receiveCurrency,
                payment_methods: [parseInt(orderState.selectedPayment)],
                min_limit: (uiState.activeTab === 'buy' ? '10.00' : '5.00'),
                max_limit: '10000.00',
                terms: orderState.selectedOrderType === 'limit'
                    ? `This is a limit order that expires in ${orderState.orderExpiry}`
                    : 'This is a market order',
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

            // Reset the form first
            setOrderState(prev => ({
                ...prev,
                amount: '',
                price: '',
                selectedPayment: ''
            }));

            // Then fetch fresh data from the server
            const refreshedOrders = await axios.get('http://localhost:8000/escrow/user-orders/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Transform and update only the userOrders part of the state
            const transformedUserOrders = refreshedOrders.data.map(order => {
                let paymentMethods = [];
                if (Array.isArray(order.payment_methods)) {
                    paymentMethods = order.payment_methods.map(method =>
                        typeof method === 'object' ? method.name : method
                    );
                } else if (order.payment_method) {
                    paymentMethods = [typeof order.payment_method === 'object'
                        ? order.payment_method.name
                        : order.payment_method];
                }

                return {
                    id: order.id,
                    type: order.order_type,
                    amount: parseFloat(order.amount),
                    filled: parseFloat(order.filled),
                    price: parseFloat(order.price),
                    currency: order.currency,
                    cryptoCurrency: order.crypto_currency,
                    sellCurrency: order.sell_currency,
                    receiveCurrency: order.receive_currency,
                    paymentMethods,
                    limit: order.limit_range || 'N/A',
                    terms: order.terms,
                    status: order.status,
                    date: order.created_at || order.date,
                    counterparty: order.counterparty,
                    isEscrow: order.is_escrow,
                    hasDispute: order.has_dispute
                };
            });

            setUiState(prev => ({
                ...prev,
                userOrders: transformedUserOrders,
                showOrderDetails: response.data.id
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
    // Currency options
    const currencyOptions = ['USD', 'EUR', 'GBP', 'KES', 'UGX', 'TZS', 'NGN', 'ZAR', 'GHS', 'XAF'];

    return (
        <div className={`fiat-p2p-container ${darkMode ? 'dark' : 'light'}`}>
            {/* Main Content */}
            <main className="p2p-main-content">
                {/* Trading Tabs */}
                <div className="trading-tabs-container">
                    <div className="trading-tabs">
                        <button
                            className={`tab-button ${uiState.activeTab === 'buy' ? 'active' : ''}`}
                            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'buy' }))}
                        >
                            <MdAttachMoney /> Buy {filterState.receiveCurrency}
                        </button>
                        <button
                            className={`tab-button ${uiState.activeTab === 'sell' ? 'active' : ''}`}
                            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'sell' }))}
                        >
                            <MdAttachMoney /> Sell {filterState.sellCurrency}
                        </button>
                    </div>
                    <div className="market-stats">
                        <span>Market Rate: 1 {filterState.sellCurrency} = {calculateMarketPrice().toFixed(2)} {filterState.receiveCurrency}</span>
                        <span>24h Volume: {uiState.marketStats.volume || '0'} {filterState.sellCurrency}</span>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="p2p-grid-layout">
                    {/* Order Creation Panel */}
                    <div className="order-creation-panel">
                        <div className="panel-header">
                            <h2>
                                {uiState.activeTab === 'buy' ? 'Buy' : 'Sell'} Order
                                <span className="order-type-toggle">
                                    <button
                                        className={`type-btn ${orderState.selectedOrderType === 'limit' ? 'active' : ''}`}
                                        onClick={() => setOrderState(prev => ({ ...prev, selectedOrderType: 'limit' }))}
                                    >
                                        Limit
                                    </button>

                                </span>
                            </h2>
                        </div>

                        <form onSubmit={handleCreateOrder} className="order-form">
                            {orderState.selectedOrderType === 'market' && (
                                <div className="market-price-notice">
                                    <FaChartLine />
                                    <span>You will {uiState.activeTab === 'buy' ? 'buy' : 'sell'} at the best available market price</span>
                                </div>
                            )}

                            {/* Currency selection for exchange */}
                            <div className="form-group">
                                <label>Exchange Currencies</label>
                                <div className="currency-exchange-selector">
                                    <select
                                        value={orderState.sellCurrency}
                                        onChange={(e) => setOrderState(prev => ({
                                            ...prev,
                                            sellCurrency: e.target.value
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
                                        value={orderState.receiveCurrency}
                                        onChange={(e) => setOrderState(prev => ({
                                            ...prev,
                                            receiveCurrency: e.target.value
                                        }))}
                                    >
                                        {currencyOptions.map(currency => (
                                            <option key={`receive-${currency}`} value={currency}>{currency}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {orderState.selectedOrderType === 'limit' && (
                                <div className="form-group">
                                    <label>Exchange Rate (1 {orderState.sellCurrency} = X {orderState.receiveCurrency})</label>
                                    <input
                                        type="number"
                                        value={orderState.price}
                                        onChange={(e) => setOrderState(prev => ({ ...prev, price: e.target.value }))}
                                        placeholder={`Rate in ${orderState.receiveCurrency}`}
                                        step="0.0001"
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>
                                    {uiState.activeTab === 'buy' ? 'You Spend' : 'You Receive'} ({uiState.activeTab === 'buy' ? orderState.sellCurrency : orderState.receiveCurrency})
                                    {orderState.selectedOrderType === 'limit' && (
                                        <span className="hint">Min: {uiState.activeTab === 'buy' ? '10' : '5'}</span>
                                    )}
                                </label>
                                <div className="input-with-actions">
                                    <input
                                        type="number"
                                        value={orderState.amount}
                                        onChange={(e) => setOrderState(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder={`0.00 ${uiState.activeTab === 'buy' ? orderState.sellCurrency : orderState.receiveCurrency}`}
                                        min={uiState.activeTab === 'buy' ? 10 : 5}
                                        required
                                    />
                                    <div className="amount-actions">
                                        <button type="button" onClick={() => setOrderState(prev => ({ ...prev, amount: '25' }))}>25</button>
                                        <button type="button" onClick={() => setOrderState(prev => ({ ...prev, amount: '50' }))}>50</button>
                                        <button type="button" onClick={() => setOrderState(prev => ({ ...prev, amount: '100' }))}>100</button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Payment Method</label>
                                <select
                                    value={orderState.selectedPayment}
                                    onChange={(e) => setOrderState(prev => ({ ...prev, selectedPayment: e.target.value }))}
                                    required
                                >
                                    <option value="">Select payment method</option>
                                    {uiState.paymentMethods.map(method => (
                                        <option key={method.id} value={method.id}>
                                            {method.name} {method.fee > 0 ? `(${(method.fee * 100).toFixed(2)}% fee)` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {orderState.selectedPayment && (
                                <div className="payment-method-details">
                                    <div className="detail-row">
                                        <span>Processing Time:</span>
                                        <strong>{getPaymentMethodDetails(parseInt(orderState.selectedPayment))?.processing_time || 'Instant'}</strong>
                                    </div>
                                    {getPaymentMethodDetails(parseInt(orderState.selectedPayment))?.fee > 0 && (
                                        <div className="detail-row">
                                            <span>Fee:</span>
                                            <strong className="fee">
                                                {(getPaymentMethodDetails(parseInt(orderState.selectedPayment))?.fee * 100).toFixed(2)}%
                                            </strong>
                                        </div>
                                    )}
                                </div>
                            )}

                            {orderState.selectedOrderType === 'limit' && (
                                <div className="form-group">
                                    <label>Order Expiry</label>
                                    <select
                                        value={orderState.orderExpiry}
                                        onChange={(e) => setOrderState(prev => ({ ...prev, orderExpiry: e.target.value }))}
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
                                    <span>Total {uiState.activeTab === 'buy' ? 'You Get' : 'You Pay'}</span>
                                    <strong>
                                        {calculateOrderTotal()} {uiState.activeTab === 'buy' ? orderState.receiveCurrency : orderState.sellCurrency}
                                    </strong>
                                </div>
                                {uiState.securityDeposit > 0 && (
                                    <div className="summary-row">
                                        <span>Security Deposit</span>
                                        <strong>{uiState.securityDeposit} {orderState.sellCurrency}</strong>
                                    </div>
                                )}
                            </div>

                            <div className="terms-agreement">
                                <input
                                    type="checkbox"
                                    id="terms-agree"
                                    checked={orderState.termsAccepted}
                                    onChange={(e) => setOrderState(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                                />
                                <label htmlFor="terms-agree">
                                    I agree to the <a href="#">Terms of Service</a> and confirm I'm not from a restricted jurisdiction.
                                </label>
                            </div>

                            <button type="submit" className="submit-order-btn">
                                {orderState.selectedOrderType === 'market' ? (
                                    <>
                                        <FaExchangeAlt /> {uiState.activeTab === 'buy' ? 'Buy' : 'Sell'} Now
                                    </>
                                ) : (
                                    <>
                                        <FaRegClock /> Place {uiState.activeTab === 'buy' ? 'Buy' : 'Sell'} Order
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Orders List Panel */}
                    <div className="orders-list-panel">
                        <div className="panel-header">
                            <h2>Available {uiState.activeTab === 'buy' ? 'Sellers' : 'Buyers'}</h2>
                            <div className="panel-actions">
                                <div className="search-box">
                                    <FaSearch />
                                    <input
                                        type="text"
                                        placeholder="Search traders or payment methods..."
                                        value={filterState.searchQuery}
                                        onChange={(e) => setFilterState(prev => ({
                                            ...prev,
                                            searchQuery: e.target.value
                                        }))}
                                    />
                                </div>
                                <button
                                    className={`filter-btn ${uiState.showAdvancedFilters ? 'active' : ''}`}
                                    onClick={() => setUiState(prev => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }))}
                                >
                                    <FaFilter /> Filters
                                    {uiState.showAdvancedFilters ? <IoIosArrowUp /> : <IoIosArrowDown />}
                                </button>
                            </div>
                        </div>

                        {uiState.showAdvancedFilters && (
                            <div className="advanced-filters-panel">
                                <div className="filter-column">
                                    <div className="filter-group">
                                        <label>Sell Currency</label>
                                        <select
                                            value={filterState.sellCurrency}
                                            onChange={(e) => setFilterState(prev => ({
                                                ...prev,
                                                sellCurrency: e.target.value
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
                                            value={filterState.receiveCurrency}
                                            onChange={(e) => setFilterState(prev => ({
                                                ...prev,
                                                receiveCurrency: e.target.value
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
                                            value={filterState.paymentMethod}
                                            onChange={(e) => setFilterState(prev => ({
                                                ...prev,
                                                paymentMethod: e.target.value
                                            }))}
                                        >
                                            <option value="all">All Methods</option>
                                            {uiState.paymentMethods.map(method => (
                                                <option key={method.id} value={method.id}>{method.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="filter-group">
                                        <label>Amount Range ({filterState.sellCurrency})</label>
                                        <div className="range-inputs">
                                            <input
                                                type="number"
                                                value={filterState.amountRange[0]}
                                                onChange={(e) => setFilterState(prev => ({
                                                    ...prev,
                                                    amountRange: [
                                                        parseFloat(e.target.value) || 0,
                                                        prev.amountRange[1]
                                                    ]
                                                }))}
                                                placeholder="Min"
                                            />
                                            <span>to</span>
                                            <input
                                                type="number"
                                                value={filterState.amountRange[1]}
                                                onChange={(e) => setFilterState(prev => ({
                                                    ...prev,
                                                    amountRange: [
                                                        prev.amountRange[0],
                                                        parseFloat(e.target.value) || 10000
                                                    ]
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
                                                value={filterState.sortBy}
                                                onChange={(e) => setFilterState(prev => ({
                                                    ...prev,
                                                    sortBy: e.target.value
                                                }))}
                                            >
                                                <option value="price">Exchange Rate</option>
                                                <option value="rating">Rating</option>
                                                <option value="amount">Amount</option>
                                                <option value="trades">Trade Count</option>
                                            </select>
                                            <button
                                                className="sort-direction"
                                                onClick={() => setFilterState(prev => ({
                                                    ...prev,
                                                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                                                }))}
                                            >
                                                {filterState.sortOrder === 'asc' ? '↑' : '↓'}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        className="reset-filters"
                                        onClick={() => setFilterState({
                                            currency: 'USD',
                                            paymentMethod: 'all',
                                            amountRange: [0, 10000],
                                            sortBy: 'price',
                                            sortOrder: 'asc',
                                            searchQuery: '',
                                            sellCurrency: 'USD',
                                            receiveCurrency: 'KES'
                                        })}
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
                                                No {uiState.activeTab === 'buy' ? 'sell' : 'buy'} orders matching your filters.
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
                                                    <strong>1 {order.sellCurrency} = {Number(order.price).toFixed(2)} {order.receiveCurrency}</strong>
                                                </td>
                                                <td className="available-cell">
                                                    <strong>{order.available}</strong>
                                                    <span>{order.sellCurrency}</span>
                                                </td>
                                                <td className="payment-cell">
                                                    <div className="payment-methods">
                                                        {order.paymentMethods.slice(0, 2).map((method, idx) => (
                                                            method && (
                                                                <span key={idx} className="payment-method">
                                                                    {method.name}
                                                                </span>
                                                            )
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
                                                        {uiState.activeTab === 'buy' ? 'Buy' : 'Sell'}
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
                                {uiState.userOrders.map(order => (
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
                                            1 {order.sellCurrency} = {Number(order.price).toFixed(2)} {order.receiveCurrency}
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
                                                onClick={() => setUiState(prev => ({ ...prev, showOrderDetails: order.id }))}
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
            {uiState.showOrderDetails && (
                <div className="modal-overlay">
                    <div className="order-details-modal">
                        <div className="modal-header">
                            <h3>Order Details</h3>
                            <button
                                onClick={() => setUiState(prev => ({ ...prev, showOrderDetails: null }))}
                                className="close-modal"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="modal-body">
                            {(() => {
                                const order = uiState.userOrders.find(o => o.id === uiState.showOrderDetails);
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
                                            <strong>1 {order.sellCurrency} = {Number(order.price).toFixed(2)} {order.receiveCurrency}</strong>
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
                                const order = uiState.userOrders.find(o => o.id === uiState.showOrderDetails);
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
                                            onClick={() => setUiState(prev => ({ ...prev, showOrderDetails: null }))}
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
                    <button className="learn-more-btn" onClick={handleLearnMoreClick}>
                        How It Works
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FiatP2P;