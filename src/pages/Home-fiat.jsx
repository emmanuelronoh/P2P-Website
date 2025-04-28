import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import '../styles/Home.css';

const CheetahXHome = () => {
    const [stats, setStats] = useState({
        users: 1250000,
        countries: 190,
        currencies: 45,
        volume: 8500000000
    });

    const [activeTab, setActiveTab] = useState('buy');
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Animate stats counter
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                users: prev.users + Math.floor(Math.random() * 100),
                countries: prev.countries,
                currencies: prev.currencies,
                volume: prev.volume + Math.floor(Math.random() * 100000)
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const faqData = [
        {
            question: 'How does the escrow system work?',
            answer: 'When a trade is initiated, the crypto is locked in our multi-signature escrow wallet. The seller can\'t access it and the buyer can\'t receive it until payment is confirmed. Once the buyer marks payment as complete and the seller confirms receipt, the crypto is automatically released to the buyer.',
        },
        {
            question: 'What payment methods are supported?',
            answer: 'We support over 300 payment methods including bank transfers (SWIFT, SEPA, ACH), PayPal, Venmo, Cash App, mobile money (M-Pesa, MTN, Airtel), gift cards (Amazon, iTunes, Google Play), and cash deposits. Available methods vary by country.',
        },
        {
            question: 'How long do trades typically take?',
            answer: 'Most trades are completed in 15-30 minutes. The exact time depends on the payment method (bank transfers may take longer) and how quickly both parties respond. Our system automatically cancels trades if no action is taken within the set time limit.',
        },
        {
            question: 'Is there a limit to how much I can trade?',
            answer: 'Unverified accounts have a $1,000 daily limit. After completing KYC verification, limits increase to $10,000 daily for Level 2 and up to $50,000 daily for Level 3 (requires additional documentation). Institutional traders can contact us for even higher limits.',
        },
        {
            question: 'What happens if there\'s a dispute?',
            answer: 'Our dedicated dispute resolution team will investigate within 24 hours. Both parties can submit evidence (screenshots, transaction IDs, etc.). Most disputes are resolved within 48 hours. Funds remain in escrow until resolution.',
        },
    ];

    // State to manage toggling FAQ items
    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <div className={`cheetah-x-home ${isMenuOpen ? 'menu-open' : ''}`}>


            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="title-part">Fastest</span>
                        <span className="title-part">P2P Crypto</span>
                        <span className="title-part">& Fiat Platform</span>
                    </h1>

                    <p className="hero-subtitle">
                        Trade directly with others worldwide with our secure escrow system.
                        Lowest fees, highest liquidity, unmatched speed.
                    </p>

                    <div className="hero-actions">
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/register')}
                        >
                            Start Trading
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => navigate('/tutorials')}
                        >
                            Watch Demo
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <div className="stat-value">{stats.users.toLocaleString()}+</div>
                            <div className="stat-label">Users Worldwide</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{stats.countries}+</div>
                            <div className="stat-label">Countries</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{stats.currencies}+</div>
                            <div className="stat-label">Currencies</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">${(stats.volume / 1000000000).toFixed(1)}B+</div>
                            <div className="stat-label">Total Volume</div>
                        </div>
                    </div>
                </div>

                <div className="hero-image">
                    <div className="image-container">
                        <div className="preview-header">
                            <div className="preview-tabs">
                                <button
                                    className={`preview-tab ${activeTab === 'buy' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('buy')}
                                >
                                    Buy Crypto
                                </button>
                                <button
                                    className={`preview-tab ${activeTab === 'sell' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('sell')}
                                >
                                    Sell Crypto
                                </button>
                            </div>
                        </div>

                        <div className="preview-content">
                            {activeTab === 'buy' ? (
                                <div className="buy-crypto-preview">
                                    <div className="currency-selector">
                                        <div className="selected-currency">
                                            <img src="https://i.ibb.co/21d9TgJT/bitcoin-btc-logo.png" alt="BTC" />
                                            <span>Bitcoin (BTC)</span>
                                            <span className="dropdown-arrow">▼</span>
                                        </div>
                                    </div>

                                    <div className="amount-selector">
                                        <input type="text" placeholder="Amount to buy" />
                                        <select>
                                            <option>USD</option>
                                            <option>EUR</option>
                                            <option>GBP</option>
                                            <option>NGN</option>
                                        </select>
                                    </div>

                                    <div className="payment-methods">
                                        <div className="method-tag active">Bank Transfer</div>
                                        <div className="method-tag">PayPal</div>
                                        <div className="method-tag">Cash</div>
                                        <div className="method-tag">+15 more</div>
                                    </div>

                                    <button className="preview-find-offers">Find Offers</button>

                                    <div className="preview-offers">
                                        <div className="offer-item">
                                            <div className="offer-seller">
                                                <span className="seller-rating">★ 4.9</span>
                                                <span className="seller-name">CryptoKing</span>
                                            </div>
                                            <div className="offer-price">$42,850/BTC</div>
                                            <div className="offer-limits">$50 - $5,000</div>
                                            <button className="offer-buy">Buy</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="sell-crypto-preview">
                                    <div className="currency-selector">
                                        <div className="selected-currency">
                                            <img src="https://i.ibb.co/hFJ0yD0m/ethereum-eth-logo.png" alt="ETH" />
                                            <span>Ethereum (ETH)</span>
                                            <span className="dropdown-arrow">▼</span>
                                        </div>
                                    </div>

                                    <div className="amount-selector">
                                        <input type="text" placeholder="Amount to sell" />
                                        <select>
                                            <option>USD</option>
                                            <option>EUR</option>
                                            <option>GBP</option>
                                        </select>
                                    </div>

                                    <div className="payment-methods">
                                        <div className="method-tag active">Bank Transfer</div>
                                        <div className="method-tag">PayPal</div>
                                        <div className="method-tag">+8 more</div>
                                    </div>

                                    <button className="preview-find-buyers">Find Buyers</button>

                                    <div className="preview-buyers">
                                        <div className="buyer-item">
                                            <div className="buyer-info">
                                                <span className="buyer-rating">★ 4.7</span>
                                                <span className="buyer-name">ETH_Whale</span>
                                            </div>
                                            <div className="buyer-price">$3,250/ETH</div>
                                            <div className="buyer-limits">1 - 10 ETH</div>
                                            <button className="buyer-sell">Sell</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2>Why Cheetah X Stands Out</h2>
                    <p>Experience the fastest, most secure P2P trading platform</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <img src="https://i.ibb.co/DTrbN39/shield.png" alt="Security" />
                        </div>
                        <h3>Military-Grade Security</h3>
                        <p>Multi-signature escrow, 2FA, and biometric authentication protect your assets</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <img src="https://i.ibb.co/DDj3BtMj/control.png" alt="Speed" />
                        </div>
                        <h3>Lightning Fast</h3>
                        <p>Our matching engine finds the best offers in under 0.5 seconds</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <img src="https://i.ibb.co/GfF7PT9V/global-network.png" alt="Global" />
                        </div>
                        <h3>Truly Global</h3>
                        <p>Trade with users in 190+ countries with 45+ fiat currencies</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <img src="https://i.ibb.co/XZx76gwj/money.png" alt="Low Fees" />
                        </div>
                        <h3>Lowest Fees</h3>
                        <p>Only 0.5% fee - half of what most competitors charge</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <img src="https://i.ibb.co/hhMrGKj/24-7.png" alt="Support" />
                        </div>
                        <h3>24/7 Support</h3>
                        <p>Real humans available around the clock to assist you</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <img src="https://i.ibb.co/k2JsJGgV/atm-card.png" alt="Payments" />
                        </div>
                        <h3>300+ Payment Methods</h3>
                        <p>From bank transfers to mobile money, gift cards and more</p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="how-it-works-section">
                <div className="section-header">
                    <h2>How Cheetah X Works</h2>
                    <p>Get started in just a few simple steps</p>
                </div>

                <div className="steps-container">
                    <div className="step-line"></div>

                    <div className="step-item">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Create Your Account</h3>
                            <p>Sign up in under a minute with just your email or phone number</p>
                        </div>
                    </div>

                    <div className="step-item">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Verify Your Identity</h3>
                            <p>Complete KYC to unlock higher limits and more payment methods</p>
                        </div>
                    </div>

                    <div className="step-item">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Find a Trade</h3>
                            <p>Browse offers or create your own. Our algorithm finds the best matches</p>
                        </div>
                    </div>

                    <div className="step-item">
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h3>Trade Securely</h3>
                            <p>Funds are held in escrow until both parties confirm the transaction</p>
                        </div>
                    </div>

                    <div className="step-item">
                        <div className="step-number">5</div>
                        <div className="step-content">
                            <h3>Withdraw or Trade Again</h3>
                            <p>Transfer to your wallet or bank, or keep trading on our platform</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Supported Assets Section */}
            <section id="supported-assets" className="assets-section">
                <div className="section-header">
                    <h2>Supported Cryptocurrencies & Fiat</h2>
                    <p>Trade hundreds of assets with local payment methods</p>
                </div>

                <div className="assets-tabs">
                    <button className="assets-tab active">Cryptocurrencies</button>
                    <button className="assets-tab">Fiat Currencies</button>
                    <button className="assets-tab">Payment Methods</button>
                </div>

                <div className="assets-grid">
                    <div className="asset-card">
                        <img src="https://i.ibb.co/21d9TgJT/bitcoin-btc-logo.png" alt="Bitcoin" />
                        <span>Bitcoin (BTC)</span>
                    </div>
                    <div className="asset-card">
                        <img src="https://i.ibb.co/hFJ0yD0m/ethereum-eth-logo.png" alt="Ethereum" />
                        <span>Ethereum (ETH)</span>
                    </div>
                    <div className="asset-card">
                        <img src="https://i.ibb.co/PvYNfpQG/tether-USDT-logo.png" alt="Tether" />
                        <span>Tether (USDT)</span>
                    </div>
                    <div className="asset-card">
                        <img src="https://i.ibb.co/pvJgTnqq/xrp-xrp-logo.png" alt="XRP" />
                        <span>XRP (XRP)</span>
                    </div>
                    <div className="asset-card">
                        <img src="https://i.ibb.co/1fLYWJXf/solana-sol-logo.png" alt="Solana" />
                        <span>Solana (SOL)</span>
                    </div>
                    <div className="asset-card">
                        <img src="https://i.ibb.co/LhCpsscs/cardano-ada-logo.png" alt="Cardano" />
                        <span>Cardano (ADA)</span>
                    </div>
                    <div className="asset-card">
                        <img src="https://i.ibb.co/pjtTr3WX/dogecoin-doge-logo.png" alt="Dogecoin" />
                        <span>Dogecoin (DOGE)</span>
                    </div>
                    <div className="asset-card">
                        <img src="https://i.ibb.co/RpQ2y3YB/polkadot-new-dot-logo.png" alt="Polkadot" />
                        <span>Polkadot (DOT)</span>
                    </div>
                    <div className="asset-card view-more">
                        <span>+150 more</span>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials-section">
                <div className="section-header">
                    <h2>What Our Users Say</h2>
                    <p>Join millions of satisfied traders worldwide</p>
                </div>

                <div className="testimonials-carousel">
                    <div className="testimonial-card">
                        <div className="testimonial-rating">★★★★★</div>
                        <p className="testimonial-text">
                            "I've used many P2P platforms but Cheetah X is by far the fastest and most reliable.
                            The escrow system gives me peace of mind when trading large amounts."
                        </p>
                        <div className="testimonial-author">
                            <img src="https://i.ibb.co/RGJcTPrZ/User-icon-2-svg.png" alt="User" />
                            <div>
                                <h4>Michael T.</h4>
                                <span>Professional Trader</span>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="testimonial-rating">★★★★★</div>
                        <p className="testimonial-text">
                            "As someone new to crypto, I appreciated how easy Cheetah X made it to buy my first Bitcoin.
                            The customer support team walked me through my first trade."
                        </p>
                        <div className="testimonial-author">
                            <img src="https://i.ibb.co/RGJcTPrZ/User-icon-2-svg.png" alt="User" />
                            <div>
                                <h4>Sarah K.</h4>
                                <span>First-time Buyer</span>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="testimonial-rating">★★★★☆</div>
                        <p className="testimonial-text">
                            "The liquidity on Cheetah X is unmatched. I can always find buyers for my crypto,
                            even for less popular altcoins. The mobile app is super convenient too."
                        </p>
                        <div className="testimonial-author">
                            <img src="https://i.ibb.co/RGJcTPrZ/User-icon-2-svg.png" alt="User" />
                            <div>
                                <h4>David L.</h4>
                                <span>Altcoin Seller</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="faq" className="faq-section">
                <div className="section-header">
                    <h2>Frequently Asked Questions</h2>
                    <p>Everything you need to know about Cheetah X</p>
                </div>
                <div className="faq-container">
                    {faqData.map((faq, index) => (
                        <div
                            key={index}
                            className={`faq-item ${openFAQ === index ? 'active' : ''}`}
                        >
                            <div
                                className="faq-question"
                                onClick={() => toggleFAQ(index)}
                            >
                                <h3>{faq.question}</h3>
                                <span className="faq-toggle">{openFAQ === index ? '-' : '+'}</span>
                            </div>
                            <div className={`faq-answer ${openFAQ === index ? 'open' : ''}`}>
                                {openFAQ === index && <p>{faq.answer}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>


            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Experience the Future of P2P Trading?</h2>
                    <p>Join millions of users trading securely on Cheetah X</p>
                    <div className="cta-actions">
                        <button className="btn-primary">Sign Up Now - It's Free</button>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default CheetahXHome;