
import React, { useState } from 'react';
import { FaBitcoin, FaEthereum, FaTwitter, FaTelegram, FaDiscord, FaGithub, FaMedium, FaLinkedin, FaReddit, FaYoutube } from 'react-icons/fa';
import { SiBinance, SiSolana, SiRipple } from 'react-icons/si';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Footer.css";

const CheetahXFooter = () => {
  const [email, setEmail] = useState('');
  const accessToken = localStorage.getItem('accessToken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // Only add Authorization header if accessToken exists
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch('https://cheetahx.onrender.com/api/auth/subscribe/', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('Successfully subscribed!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        e.target.reset();
        setEmail('');
      } else {
        const data = await response.json();
        if (response.status === 401) {
          toast.warn('Please login to subscribe', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          toast.error(`Error: ${data.message || data.email || 'Something went wrong'}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error('Subscription error:', error);
    }
  };

  return (
    <>
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
      />
      <footer className="cheetahx-footer">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo-container">
              <span className="logo-icon">🤑</span>
              <h2 className="logo-text">CheetahX</h2>
            </div>
            <p className="brand-tagline">Lightning-fast P2P Crypto Exchange</p>
            <div className="crypto-icons">
              <FaBitcoin className="crypto-icon" title="Bitcoin" />
              <FaEthereum className="crypto-icon" title="Ethereum" />
              <SiBinance className="crypto-icon" title="Binance Coin" />
              <SiSolana className="crypto-icon" title="Solana" />
              <SiRipple className="crypto-icon" title="XRP" />
            </div>
          </div>

          <div className="footer-links-container">
            {/* Navigation Links */}
            <div className="footer-links">
              <h3 className="links-heading">Navigation</h3>
              <ul className="links-list">
                <li><a href="/">Home</a></li>
                <li><a href="/wallet">Wallet</a></li>
                <li><a href="/markets">Markets</a></li>
              </ul>
            </div>
            {/* Legal Links */}
            <div className="footer-links">
              <h3 className="links-heading">Legal</h3>
              <ul className="links-list">
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/tutorials">Documentation</a></li>
                <li><a href="/risk">Risk Disclosure</a></li>
                <li><a href="/cookie">Cookie Policy</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="footer-links">
              <h3 className="links-heading">Support</h3>
              <ul className="links-list">
                <li><a href="/support">Contact Us</a></li>
                <li><a href="/faq">FAQ</a></li>
                <li><a href="/feedback">Feedback</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="footer-middle">
          <div className="newsletter-container">
            <h3 className="newsletter-heading">Stay Updated</h3>
            <p className="newsletter-text">Subscribe to our newsletter for the latest updates</p>
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email address"
                className="newsletter-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="newsletter-button">
                {accessToken ? 'Subscribe' : 'Login to Subscribe'}
              </button>
            </form>
            {!accessToken && (
              <p className="login-prompt">
                Want to subscribe? <a href="/login">Login</a> or <a href="/register">Register</a>
              </p>
            )}
          </div>

          <div className="social-container">
            <h3 className="social-heading">Connect With Us</h3>
            <div className="social-icons">
              <a href="https://twitter.com/cheetahx" aria-label="Twitter"><FaTwitter className="social-icon" /></a>
              <a href="https://t.me/cheetahx" aria-label="Telegram"><FaTelegram className="social-icon" /></a>
              <a href="https://discord.gg/cheetahx" aria-label="Discord"><FaDiscord className="social-icon" /></a>
              <a href="https://medium.com/cheetahx" aria-label="Medium"><FaMedium className="social-icon" /></a>
              <a href="https://linkedin.com/company/cheetahx" aria-label="LinkedIn"><FaLinkedin className="social-icon" /></a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="copyright">
            © {new Date().getFullYear()} CheetahX. All rights reserved.
          </div>
          <div className="legal-links">
            <a href="/compliance">Compliance</a>
            <span className="separator">|</span>
            <a href="/security">Security</a>
            <span className="separator">|</span>
            <a href="/sitemap">Sitemap</a>
          </div>
          <div className="language-selector">
            <select className="language-dropdown" aria-label="Language selector">
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </footer>
    </>
  );
};

export default CheetahXFooter;
