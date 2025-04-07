import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiDownload, FiChevronDown, FiChevronUp, FiCheckCircle, FiLock, FiDollarSign, FiCreditCard, FiShield, FiBarChart2 } from 'react-icons/fi';
import "../styles/Tutorials.css";
import { Link } from 'react-router-dom';

const TutorialsPage = () => {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [expandedTutorial, setExpandedTutorial] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTutorial = (id) => {
        setExpandedTutorial(expandedTutorial === id ? null : id);
    };

    const scrollToSection = (sectionId) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    };

    const sections = [
        {
            id: 'getting-started',
            title: 'New to P2P? Start Here',
            icon: <FiPlay className="section-icon" />,
            tutorials: [
                {
                    id: 'gs-1',
                    title: 'Interactive Walkthrough',
                    content: (
                        <div className="tutorial-content">
                            <h4>Step-by-step guide to your first trade</h4>
                            <div className="animated-steps">
                                <div className="step">
                                    <div className="step-number">1</div>
                                    <div className="step-content">
                                        <h5>Creating your CheetahX account</h5>
                                        <p>Learn how to set up your account with optimal security settings.</p>
                                        <div className="step-visual">
                                            <div className="mockup-form animate-float">
                                                <div className="form-header">Sign Up</div>
                                                <div className="form-field">
                                                    <label>Email</label>
                                                    <div className="mock-input"></div>
                                                </div>
                                                <div className="form-field">
                                                    <label>Password</label>
                                                    <div className="mock-input"></div>
                                                </div>
                                                <div className="form-button">Continue</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="step">
                                    <div className="step-number">2</div>
                                    <div className="step-content">
                                        <h5>Verifying your identity (KYC process)</h5>
                                        <p>Our streamlined verification process explained.</p>
                                        <div className="step-visual">
                                            <div className="kyc-flow animate-float-delay">
                                                <div className="kyc-step">Upload ID</div>
                                                <div className="kyc-arrow">→</div>
                                                <div className="kyc-step">Selfie</div>
                                                <div className="kyc-arrow">→</div>
                                                <div className="kyc-step">Approval</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="step">
                                    <div className="step-number">3</div>
                                    <div className="step-content">
                                        <h5>Setting up payment methods</h5>
                                        <p>Connect your preferred payment options securely.</p>
                                        <div className="payment-methods">
                                            <div className="payment-method animate-bounce">
                                                <FiCreditCard />
                                                <span>Bank Transfer</span>
                                            </div>
                                            <div className="payment-method animate-bounce-delay">
                                                <FiDollarSign />
                                                <span>Cash App</span>
                                            </div>
                                            <div className="payment-method animate-bounce-delay-2">
                                                <FiBarChart2 />
                                                <span>Crypto</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="step">
                                    <div className="step-number">4</div>
                                    <div className="step-content">
                                        <h5>Understanding the escrow system</h5>
                                        <p>How we protect both buyers and sellers in every transaction.</p>
                                        <div className="escrow-diagram">
                                            <div className="escrow-step buyer">
                                                <div className="escrow-icon">👤</div>
                                                <div className="escrow-label">Buyer Funds</div>
                                                <div className="escrow-arrow">→</div>
                                            </div>
                                            <div className="escrow-step escrow">
                                                <div className="escrow-icon"><FiLock /></div>
                                                <div className="escrow-label">Escrow</div>
                                                <div className="escrow-arrow">→</div>
                                            </div>
                                            <div className="escrow-step seller">
                                                <div className="escrow-icon">👤</div>
                                                <div className="escrow-label">Seller Crypto</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-interactive" onClick={() => navigate('/walkthrough')}>
                                Launch Interactive Guide
                            </button>
                        </div>
                    )
                },
                {
                    id: 'gs-2',
                    title: 'Video: Your First P2P Trade in 5 Minutes',
                    content: (
                        <div className="tutorial-content">
                            <div className="video-container">
                                <div className="video-placeholder">
                                    <div className="play-button"><FiPlay size={48} /></div>
                                    <div className="video-progress"></div>
                                    <div className="video-chapters">
                                        <div className="chapter-marker" style={{ left: '20%' }}>Account Setup</div>
                                        <div className="chapter-marker" style={{ left: '45%' }}>Finding a Trade</div>
                                        <div className="chapter-marker" style={{ left: '70%' }}>Completing Payment</div>
                                    </div>
                                </div>
                            </div>
                            <div className="video-actions">
                                <button className="btn-secondary">
                                    <FiDownload /> Download Transcript
                                </button>
                                <button className="btn-primary">
                                    Watch Full Tutorial Series
                                </button>
                            </div>
                        </div>
                    )
                }
            ]
        },
        {
            id: 'core-trading',
            title: 'Master P2P Trading',
            icon: <FiDollarSign className="section-icon" />,
            tutorials: [
                {
                    id: 'ct-1',
                    title: 'Buying Crypto with Fiat',
                    content: (
                        <div className="tutorial-content">
                            <div className="trading-flow">
                                <div className="flow-step">
                                    <div className="step-header">
                                        <div className="step-number">1</div>
                                        <h4>Finding reputable sellers</h4>
                                    </div>
                                    <ul>
                                        <li>Check seller verification badges</li>
                                        <li>Review trade completion rate</li>
                                        <li>Read recent feedback</li>
                                        <li>Start with small test transactions</li>
                                    </ul>
                                </div>
                                <div className="flow-step">
                                    <div className="step-header">
                                        <div className="step-number">2</div>
                                        <h4>Placing buy orders</h4>
                                    </div>
                                    <div className="order-mockup">
                                        <div className="order-form">
                                            <div className="form-row">
                                                <label>Amount</label>
                                                <div className="input-group">
                                                    <input type="text" placeholder="100" />
                                                    <select>
                                                        <option>USD</option>
                                                        <option>EUR</option>
                                                        <option>GBP</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <label>Payment Method</label>
                                                <select>
                                                    <option>Bank Transfer</option>
                                                    <option>PayPal</option>
                                                    <option>Cash App</option>
                                                </select>
                                            </div>
                                            <button className="btn-place-order">Place Buy Order</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flow-step">
                                    <div className="step-header">
                                        <div className="step-number">3</div>
                                        <h4>Making fiat payments securely</h4>
                                    </div>
                                    <div className="security-tips">
                                        <div className="tip-card">
                                            <FiCheckCircle />
                                            <p>Always use the payment details provided in the trade chat</p>
                                        </div>
                                        <div className="tip-card warning">
                                            <FiLock />
                                            <p>Never send payments to external links or alternate accounts</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flow-step">
                                    <div className="step-header">
                                        <div className="step-number">4</div>
                                        <h4>Releasing escrow</h4>
                                    </div>
                                    <p>After confirming receipt of crypto in your wallet, release escrow to complete the trade.</p>
                                    <div className="escrow-release-flow">
                                        <div className="release-step">
                                            <div className="release-icon">1</div>
                                            <p>Confirm crypto received</p>
                                        </div>
                                        <div className="release-arrow">→</div>
                                        <div className="release-step">
                                            <div className="release-icon">2</div>
                                            <p>Click "Release"</p>
                                        </div>
                                        <div className="release-arrow">→</div>
                                        <div className="release-step">
                                            <div className="release-icon">3</div>
                                            <p>Transaction complete</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                },
                // Additional core trading tutorials would follow similar structure
            ]
        },
        // Additional sections would follow the same pattern
    ];

    return (
        <div className="tutorials-page">
            <div className={`tutorials-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header-content">
                    <h1>CheetahX P2P Trading Academy</h1>
                    <p>Master peer-to-peer trading with our comprehensive guides and interactive learning tools</p>
                </div>

            </div>

            <div className="tutorials-container">
                <div className="sidebar">
                    <div className="sidebar-header">
                        <h3>Tutorial Sections</h3>
                    </div>
                    <ul className="section-links">
                        {sections.map(section => (
                            <li
                                key={section.id}
                                className={activeSection === section.id ? 'active' : ''}
                                onClick={() => scrollToSection(section.id)}
                            >
                                {section.icon}
                                {section.title}
                            </li>
                        ))}
                    </ul>
                    <div className="sidebar-footer">
                        <Link to="/support">
                            <button className="btn-support">
                                Need Help? Contact Support
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="tutorials-content">
                    {sections.map(section => (
                        <section
                            id={section.id}
                            key={section.id}
                            className="tutorial-section"
                        >
                            <div className="section-header">
                                <h2>
                                    {section.icon}
                                    {section.title}
                                </h2>
                            </div>

                            <div className="tutorials-list">
                                {section.tutorials.map(tutorial => (
                                    <div
                                        key={tutorial.id}
                                        className={`tutorial-card ${expandedTutorial === tutorial.id ? 'expanded' : ''}`}
                                    >
                                        <div
                                            className="tutorial-header"
                                            onClick={() => toggleTutorial(tutorial.id)}
                                        >
                                            <h3>{tutorial.title}</h3>
                                            {expandedTutorial === tutorial.id ? (
                                                <FiChevronUp className="toggle-icon" />
                                            ) : (
                                                <FiChevronDown className="toggle-icon" />
                                            )}
                                        </div>
                                        <div className="tutorial-body">
                                            {tutorial.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            <div className="tutorials-cta">
                <h2>Ready to Start Trading?</h2>
                <p>Join thousands of users enjoying secure, fast P2P transactions on CheetahX</p>
                <div className="cta-buttons">
                    <Link to="/become-vendor">
                        <button className="btn-primary">
                            Create Free Account
                        </button>
                    </Link>
                    <Link to="/market">
                        <button className="btn-secondary">
                            Browse Marketplace
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TutorialsPage;