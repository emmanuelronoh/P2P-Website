import React from 'react';
import { FaBitcoin, FaEthereum, FaTwitter, FaTelegram, FaDiscord, FaGithub, FaMedium, FaLinkedin, FaReddit, FaYoutube } from 'react-icons/fa';
import { SiBinance, SiSolana, SiRipple } from 'react-icons/si';
import "../styles/Footer.css";

const CheetahXFooter = () => {
  return (
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
              <li><a href="/exchange">Exchange</a></li>
              <li><a href="/wallet">Wallet</a></li>
              <li><a href="/markets">Markets</a></li>
              <li><a href="/portfolio">Portfolio</a></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="footer-links">
            <h3 className="links-heading">Resources</h3>
            <ul className="links-list">
              <li><a href="/blog">Blog</a></li>
              <li><a href="/documentation">Documentation</a></li>
              <li><a href="/api">API</a></li>
              <li><a href="/status">System Status</a></li>
              <li><a href="/glossary">Crypto Glossary</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-links">
            <h3 className="links-heading">Legal</h3>
            <ul className="links-list">
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/aml">AML Policy</a></li>
              <li><a href="/risk">Risk Disclosure</a></li>
              <li><a href="/cookie">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-links">
            <h3 className="links-heading">Support</h3>
            <ul className="links-list">
              <li><a href="/help">Help Center</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/feedback">Feedback</a></li>
              <li><a href="/community">Community</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="footer-middle">
        <div className="newsletter-container">
          <h3 className="newsletter-heading">Stay Updated</h3>
          <p className="newsletter-text">Subscribe to our newsletter for the latest updates</p>
          <form className="newsletter-form">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="newsletter-input" 
              required 
            />
            <button type="submit" className="newsletter-button">Subscribe</button>
          </form>
        </div>

        <div className="social-container">
          <h3 className="social-heading">Connect With Us</h3>
          <div className="social-icons">
            <a href="https://twitter.com/cheetahx" aria-label="Twitter"><FaTwitter className="social-icon" /></a>
            <a href="https://t.me/cheetahx" aria-label="Telegram"><FaTelegram className="social-icon" /></a>
            <a href="https://discord.gg/cheetahx" aria-label="Discord"><FaDiscord className="social-icon" /></a>
            <a href="https://github.com/cheetahx" aria-label="GitHub"><FaGithub className="social-icon" /></a>
            <a href="https://medium.com/cheetahx" aria-label="Medium"><FaMedium className="social-icon" /></a>
            <a href="https://linkedin.com/company/cheetahx" aria-label="LinkedIn"><FaLinkedin className="social-icon" /></a>
            <a href="https://reddit.com/r/cheetahx" aria-label="Reddit"><FaReddit className="social-icon" /></a>
            <a href="https://youtube.com/cheetahx" aria-label="YouTube"><FaYoutube className="social-icon" /></a>
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
            <option value="es">Español</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="ru">Русский</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>
    </footer>
  );
};

export default CheetahXFooter;