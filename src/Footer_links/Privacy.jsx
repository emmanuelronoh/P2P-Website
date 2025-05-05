import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Privacy.css';

const Privacy = () => {
    const navigate = useNavigate();
  return (
    <div className="privacy-container">
      <header className="privacy-header">
        <h1>CheetahX Privacy Policy</h1>
        <p className="effective-date">Last Updated: {new Date().toLocaleDateString()}</p>
      </header>

      <main className="privacy-content">
        <section className="privacy-section">
          <h2>1. Introduction</h2>
          <p>
            CheetahX ("we", "us", or "our") respects your privacy and is committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
            peer-to-peer cryptocurrency and fiat trading platform.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <p>
            We may collect the following personal information:
          </p>
          <ul>
            <li>Full name, date of birth, and government-issued ID</li>
            <li>Contact information (email, phone number, address)</li>
            <li>Financial information (bank accounts, payment details)</li>
            <li>Transaction history and trading activity</li>
            <li>KYC/AML documentation</li>
          </ul>

          <h3>2.2 Technical Information</h3>
          <p>
            We automatically collect:
          </p>
          <ul>
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Usage data and interaction with our platform</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. How We Use Your Information</h2>
          <p>
            We use your information to:
          </p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Verify your identity and comply with legal obligations</li>
            <li>Process transactions and prevent fraud</li>
            <li>Improve our platform and develop new features</li>
            <li>Communicate with you about your account</li>
            <li>Monitor and analyze usage patterns</li>
            <li>Ensure platform security and prevent abuse</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. Legal Basis for Processing</h2>
          <p>
            We process your data based on:
          </p>
          <ul>
            <li>Your consent (where required)</li>
            <li>Necessity to perform our contractual obligations</li>
            <li>Compliance with legal requirements (KYC/AML regulations)</li>
            <li>Legitimate business interests (fraud prevention, security)</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>5. Data Sharing and Disclosure</h2>
          <p>
            We may share your information with:
          </p>
          <ul>
            <li>Financial institutions and payment processors</li>
            <li>Regulatory and law enforcement authorities (when required)</li>
            <li>Service providers who assist in our operations</li>
            <li>Other users only as necessary to complete transactions</li>
            <li>In connection with business transfers or mergers</li>
          </ul>
          <p>
            We never sell your personal information to third parties.
          </p>
        </section>

        <section className="privacy-section">
          <h2>6. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries outside your residence. 
            We ensure appropriate safeguards are in place to protect your data in accordance with this policy.
          </p>
        </section>

        <section className="privacy-section">
          <h2>7. Data Security</h2>
          <p>
            We implement industry-standard security measures including:
          </p>
          <ul>
            <li>Encryption of sensitive data</li>
            <li>Secure servers and network protections</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication protocols</li>
          </ul>
          <p>
            However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section className="privacy-section">
          <h2>8. Data Retention</h2>
          <p>
            We retain your personal data only as long as necessary to:
          </p>
          <ul>
            <li>Fulfill the purposes outlined in this policy</li>
            <li>Comply with legal obligations (typically 5+ years for financial records)</li>
            <li>Resolve disputes and enforce our agreements</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>9. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have rights to:
          </p>
          <ul>
            <li>Access and receive a copy of your personal data</li>
            <li>Rectify inaccurate or incomplete information</li>
            <li>Request deletion of your personal data</li>
            <li>Restrict or object to processing</li>
            <li>Withdraw consent (where applicable)</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
          <p>
            To exercise these rights, contact us at admin@cheetahxofficial.com.
          </p>
        </section>

        <section className="privacy-section">
          <h2>10. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar technologies to:
          </p>
          <ul>
            <li>Authenticate users and maintain sessions</li>
            <li>Remember preferences and settings</li>
            <li>Analyze platform usage</li>
            <li>Prevent fraud and enhance security</li>
          </ul>
          <p>
            You can control cookies through your browser settings.
          </p>
        </section>

        <section className="privacy-section">
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this policy periodically. We will notify you of significant changes through our platform or email.
          </p>
        </section>

        <section className="privacy-section">
          <h2>12. Contact Us</h2>
          <p>
            For privacy-related questions or concerns:
          </p>
          <address>
            CheetahX Admin<br />
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

export default Privacy;