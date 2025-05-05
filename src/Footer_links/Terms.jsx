import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Terms.css';

const Terms = () => {
    const navigate = useNavigate();
  return (
    <div className="terms-container">
      <header className="terms-header">
        <h1>CheetahX Terms and Conditions</h1>
        <p className="effective-date">Last Updated: {new Date().toLocaleDateString()}</p>
      </header>

      <main className="terms-content">
        <section className="terms-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to CheetahX, a peer-to-peer (P2P) platform for trading cryptocurrencies and fiat currencies. 
            These Terms and Conditions ("Terms") govern your use of our services. By accessing or using CheetahX, 
            you agree to be bound by these Terms and our Privacy Policy.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. Eligibility</h2>
          <p>
            To use CheetahX, you must:
          </p>
          <ul>
            <li>Be at least 18 years old or the legal age in your jurisdiction</li>
            <li>Have full legal capacity to enter into binding agreements</li>
            <li>Not be a resident of prohibited jurisdictions</li>
            <li>Complete our identity verification process</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>3. Account Registration</h2>
          <p>
            You must register an account to use CheetahX. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized use</li>
            <li>Be responsible for all activities under your account</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>4. P2P Trading</h2>
          <p>
            CheetahX facilitates P2P trades but is not a party to any transaction. You acknowledge that:
          </p>
          <ul>
            <li>All trades are between buyers and sellers directly</li>
            <li>Prices are set by users, not CheetahX</li>
            <li>We provide escrow services for cryptocurrency transactions</li>
            <li>Fiat transactions are processed through approved payment methods</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>5. Prohibited Activities</h2>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Engage in illegal activities or transactions</li>
            <li>Use CheetahX for money laundering or terrorist financing</li>
            <li>Circumvent our security measures</li>
            <li>Provide false information</li>
            <li>Manipulate prices or engage in market abuse</li>
            <li>Use CheetahX if prohibited by your local laws</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>6. Fees</h2>
          <p>
            CheetahX charges fees for certain services. All fees will be clearly displayed before you complete a transaction.
          </p>
        </section>

        <section className="terms-section">
          <h2>7. Disputes</h2>
          <p>
            In case of disputes between users, CheetahX may:
          </p>
          <ul>
            <li>Act as a mediator</li>
            <li>Temporarily freeze funds during investigation</li>
            <li>Make final determinations at our sole discretion</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>8. Limitation of Liability</h2>
          <p>
            CheetahX is not liable for:
          </p>
          <ul>
            <li>Any losses from market fluctuations</li>
            <li>User errors in transactions</li>
            <li>Technical issues beyond our reasonable control</li>
            <li>Unauthorized access to your account</li>
            <li>Third-party payment processor issues</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>9. Amendments</h2>
          <p>
            We may modify these Terms at any time. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section className="terms-section">
          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
          </p>
        </section>

        <div className="acceptance-section">
          <p>
            By using CheetahX, you acknowledge that you have read, understood, and agree to be bound by these Terms.
          </p>
        </div>
        <button className="back-button" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
      </main>
    </div>
  );
};

export default Terms;