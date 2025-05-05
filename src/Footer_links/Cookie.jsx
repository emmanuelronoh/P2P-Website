import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Cookie.css';

const Cookie = () => {
    const navigate = useNavigate();
  return (
    <div className="cookie-container">
      <header className="cookie-header">
        <h1>CheetahX Cookie Policy</h1>
        <p className="effective-date">Last Updated: {new Date().toLocaleDateString()}</p>
      </header>

      <main className="cookie-content">
        <section className="cookie-section">
          <h2>1. Introduction</h2>
          <p>
            This Cookie Policy explains how CheetahX ("we", "us", or "our") uses cookies and similar tracking 
            technologies when you visit our peer-to-peer cryptocurrency and fiat trading platform. By using our 
            website, you consent to the use of cookies as described in this policy.
          </p>
        </section>

        <section className="cookie-section">
          <h2>2. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device (computer, smartphone, tablet) when you 
            visit websites. They are widely used to make websites work more efficiently and to provide information 
            to the website owners.
          </p>
        </section>

        <section className="cookie-section">
          <h2>3. How We Use Cookies</h2>
          <p>
            We use cookies for the following purposes:
          </p>
          <table className="cookie-table">
            <thead>
              <tr>
                <th>Cookie Type</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Essential Cookies</strong></td>
                <td>
                  Necessary for the website to function properly (e.g., authentication, security, session management)
                </td>
                <td>Session or up to 24 hours</td>
              </tr>
              <tr>
                <td><strong>Preference Cookies</strong></td>
                <td>
                  Remember your preferences (e.g., language, currency, display settings)
                </td>
                <td>Up to 30 days</td>
              </tr>
              <tr>
                <td><strong>Analytics Cookies</strong></td>
                <td>
                  Help us understand how visitors interact with our platform (e.g., pages visited, navigation paths)
                </td>
                <td>Up to 2 years</td>
              </tr>
              <tr>
                <td><strong>Security Cookies</strong></td>
                <td>
                  Help detect malicious activity and protect user data
                </td>
                <td>Up to 1 year</td>
              </tr>
              <tr>
                <td><strong>Advertising Cookies</strong></td>
                <td>
                  Used to deliver relevant ads (we currently don't use third-party advertising cookies)
                </td>
                <td>N/A</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="cookie-section">
          <h2>4. Third-Party Cookies</h2>
          <p>
            We may use services from third parties that set their own cookies, including:
          </p>
          <ul>
            <li>
              <strong>Google Analytics:</strong> To analyze website traffic and usage patterns
            </li>
            <li>
              <strong>Cloudflare:</strong> For security and performance optimization
            </li>
            <li>
              <strong>Payment Processors:</strong> When you initiate a transaction
            </li>
          </ul>
          <p>
            These third parties have their own privacy policies and we don't have control over their cookies.
          </p>
        </section>

        <section className="cookie-section">
          <h2>5. Managing Cookies</h2>
          <p>
            You can control and/or delete cookies as you wish. Most web browsers allow you to:
          </p>
          <ul>
            <li>See what cookies are stored and delete them individually</li>
            <li>Block third-party cookies</li>
            <li>Block cookies from particular sites</li>
            <li>Block all cookies</li>
            <li>Delete all cookies when you close your browser</li>
          </ul>
          <p>
            If you disable cookies, some features of CheetahX may not function properly. Essential cookies 
            cannot be disabled as they are necessary for basic functionality.
          </p>
          <div className="browser-instructions">
            <h3>Browser-Specific Instructions:</h3>
            <ul>
              <li>
                <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
              </li>
              <li>
                <strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data
              </li>
              <li>
                <strong>Safari:</strong> Preferences → Privacy → Cookies and website data
              </li>
              <li>
                <strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies
              </li>
              <li>
                <strong>Opera:</strong> Settings → Privacy & security → Cookies
              </li>
            </ul>
          </div>
        </section>

        <section className="cookie-section">
          <h2>6. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. We will notify you of any significant changes 
            through our platform or via email.
          </p>
        </section>

        <section className="cookie-section">
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about our use of cookies, please contact us at:
          </p>
          <address>
            CheetahX Support Team<br />
            Email: admin@cheetahxofficial.com<br />
          </address>

        </section>
        <button className="back-button" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
      </main>

    </div>
  );
};

export default Cookie;