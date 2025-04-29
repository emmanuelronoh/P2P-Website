import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "../styles/styles.css"; 

const TermsAndCondition = () => {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleAgreement = () => {
    if (agreed) {
      navigate("/cryptolisting");
    }
  };

  return (
    <section className="terms-container">
      <div className="terms-card">
        <h2 className="terms-title">📜 Vendor Terms & Conditions</h2>
        <p className="terms-description">
          Please review and accept the terms below before listing your cryptocurrency.
        </p>

        <ul className="terms-list">
          <li>✅ Vendors must list only verified and legitimate cryptocurrencies.</li>
          <li>⚠️ Any form of fraudulent activity will result in account suspension.</li>
          <li>🛡️ Vendors must comply with KYC requirements and local financial laws.</li>
          <li>🔒 The platform retains the right to monitor and audit listings at any time.</li>
        </ul>

        <div className="terms-agree">
          <label htmlFor="agreeCheckbox" className="checkbox-label">
            <input
              type="checkbox"
              id="agreeCheckbox"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
            />
            <span className="custom-checkbox" />
            <span>I have read and agree to the terms and conditions.</span>
          </label>
        </div>

        <button
          className={`agree-button ${agreed ? "enabled" : "disabled"}`}
          onClick={handleAgreement}
          disabled={!agreed}
        >
          ✅ Continue to Crypto Listing
        </button>
      </div>
    </section>
  );
};

export default TermsAndCondition;
