import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Risk.css';

const Risk = () => {
  const navigate = useNavigate();

  return (
    <div className="risk-container">
      <header className="risk-header">
        <h1>CheetahX Risk Disclosure</h1>
        <p className="effective-date">Last Updated: {new Date().toLocaleDateString()}</p>
      </header>

      <main className="risk-content">
        <section className="risk-section">
          <h2>1. General Risk Warning</h2>
          <p>
            Trading cryptocurrencies and fiat currencies on CheetahX involves significant risk of loss. 
            The high volatility and unpredictability of cryptocurrency prices mean that you may lose some 
            or all of your invested capital. Only trade with funds you can afford to lose.
          </p>
        </section>

        <section className="risk-section">
          <h2>2. Market Risks</h2>
          <ul>
            <li>
              <strong>Price Volatility:</strong> Cryptocurrency prices can fluctuate dramatically 
              within very short time periods.
            </li>
            <li>
              <strong>Liquidity Risk:</strong> Some cryptocurrencies may have low liquidity, making 
              it difficult to execute trades at desired prices.
            </li>
            <li>
              <strong>Market Manipulation:</strong> Cryptocurrency markets are susceptible to market 
              manipulation which may affect prices.
            </li>
          </ul>
        </section>

        <section className="risk-section">
          <h2>3. Technology Risks</h2>
          <ul>
            <li>
              <strong>Network Congestion:</strong> Blockchain networks may become congested, causing 
              delays in transaction processing.
            </li>
            <li>
              <strong>Smart Contract Vulnerabilities:</strong> Errors in smart contract code may lead 
              to loss of funds.
            </li>
            <li>
              <strong>Cybersecurity Threats:</strong> Despite our security measures, no system is 
              completely immune to hacking attempts.
            </li>
          </ul>
        </section>

        <section className="risk-section">
          <h2>4. P2P Trading Risks</h2>
          <ul>
            <li>
              <strong>Counterparty Risk:</strong> In peer-to-peer trades, there is risk that the other 
              party may not fulfill their obligations.
            </li>
            <li>
              <strong>Payment Method Risks:</strong> Certain payment methods may be reversible, leading 
              to potential chargeback risks.
            </li>
            <li>
              <strong>Dispute Resolution:</strong> While CheetahX provides dispute resolution, outcomes 
              cannot be guaranteed.
            </li>
          </ul>
        </section>

        <section className="risk-section">
          <h2>5. Regulatory Risks</h2>
          <p>
            Cryptocurrency regulations vary by jurisdiction and may change with little notice. These 
            changes could affect:
          </p>
          <ul>
            <li>The legality of certain cryptocurrencies or trading activities</li>
            <li>Tax treatment of your transactions</li>
            <li>Your ability to withdraw funds to bank accounts</li>
          </ul>
        </section>

        <section className="risk-section">
          <h2>6. No Investment Advice</h2>
          <p>
            CheetahX does not provide investment, tax, or legal advice. Any decision to trade is made 
            solely by you. We recommend consulting with qualified professionals before making any 
            trading decisions.
          </p>
        </section>

        <section className="risk-section">
          <h2>7. Acknowledgement</h2>
          <div className="acknowledgement-box">
            <p>
              By using CheetahX, you acknowledge that you:
            </p>
            <ul>
              <li>Understand these risks</li>
              <li>Are solely responsible for your trading decisions</li>
              <li>Accept that CheetahX is not liable for any trading losses</li>
            </ul>
          </div>
        </section>

        <div className="bottom-navigation">
          <button className="nav-button back-button" onClick={() => navigate(-1)}>
            &larr; Back
          </button>
          <button className="nav-button next-button" onClick={() => navigate(1)}>
            Next &rarr;
          </button>
        </div>
      </main>

    </div>
  );
};

export default Risk;