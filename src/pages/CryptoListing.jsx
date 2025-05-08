import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/CryptoListing.css"

const BASE_URL = 'https://cheetahx.onrender.com/crypto/';

const AmountForm = ({ mode = 'create', initialData = {} }) => {
  // Form state
  const [formData, setFormData] = useState({
    transactionType: initialData.transactionType || 'buy',
    cryptoAmount: initialData.cryptoAmount || '',
    minAmount: initialData.minAmount || '',
    maxAmount: initialData.maxAmount || '',
    cryptoCurrency: initialData.cryptoCurrency || 'BTC',
    secondaryAmount: initialData.secondaryAmount || '',
    secondaryCurrency: initialData.secondaryCurrency || 'ETH',
    rate: initialData.rate || '',
    paymentMethods: initialData.paymentMethods || [],
    timeWindow: initialData.timeWindow || 30,
    terms: initialData.terms || '',
    ...initialData
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cryptoCurrencies, setCryptoCurrencies] = useState([]);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [timeWindows, setTimeWindows] = useState([]);
  const navigate = useNavigate();

  // Fetch initial data from backend
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch crypto currencies
        const cryptoRes = await fetch(`${BASE_URL}crypto-currencies/`);
        const cryptoData = await cryptoRes.json();
        setCryptoCurrencies(cryptoData.map(currency => ({
          code: currency.symbol,
          name: currency.name,
          type: currency.currency_type
        })));

        // Fetch payment methods
        const paymentRes = await fetch(`${BASE_URL}payment-methods-crypto/`);
        const paymentData = await paymentRes.json();
        setPaymentOptions(paymentData.map(method => ({
          id: method.id.toString(),
          label: method.name
        })));

        const timeRes = await fetch(`${BASE_URL}time-windows/`);
        const timeData = await timeRes.json();
        setTimeWindows(timeData.map(window => ({
          value: window.id.toString(),
          label: window.display_name,
          minutes: window.minutes
        })));

      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Calculate rate when relevant fields change
  useEffect(() => {
    if (formData.cryptoAmount && formData.secondaryAmount) {
      const calculatedRate = (parseFloat(formData.secondaryAmount) / parseFloat(formData.cryptoAmount));
      setFormData(prev => ({ ...prev, rate: calculatedRate.toString() }));
    }
  }, [formData.cryptoAmount, formData.secondaryAmount]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      // Handle payment methods checkboxes
      if (name === 'paymentMethods') {
        const updatedMethods = checked
          ? [...formData.paymentMethods, value]
          : formData.paymentMethods.filter(method => method !== value);
        setFormData({ ...formData, [name]: updatedMethods });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleViewOffer = () => {
    navigate('/market');
  };

  // Auto-fill the other amount field when one is entered
  const calculateCounterAmount = (field, value) => {
    if (!value || !formData.rate) return '';

    const amount = parseFloat(value);
    if (isNaN(amount)) return '';

    return (field === 'crypto'
      ? amount * parseFloat(formData.rate)
      : amount / parseFloat(formData.rate)
        .toString());
  };

  // Handle amount changes with auto-calculation
  const handleAmountChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Calculate the counterpart amount
    if (name === 'cryptoAmount' && value && formData.rate) {
      setFormData(prev => ({
        ...prev,
        secondaryAmount: calculateCounterAmount('crypto', value)
      }));
    } else if (name === 'secondaryAmount' && value && formData.rate) {
      setFormData(prev => ({
        ...prev,
        cryptoAmount: calculateCounterAmount('secondary', value)
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Find the selected time window object
      const selectedTimeWindow = timeWindows.find(
        window => window.value === formData.timeWindow
      );

      const offerData = {
        trade_type: 'CRYPTO', // Always crypto-to-crypto now
        transaction_type: formData.transactionType === 'buy' ? 'BUY' : 'SELL',
        crypto_currency: formData.cryptoCurrency,
        crypto_amount: formData.cryptoAmount,
        min_amount: formData.minAmount || null,
        max_amount: formData.maxAmount || null,
        secondary_currency: formData.secondaryCurrency,
        secondary_amount: formData.secondaryAmount,
        rate: formData.rate,
        payment_methods: formData.paymentMethods,
        time_window: Number(selectedTimeWindow.minutes),
        terms: formData.terms,
        status: 'PENDING'
      };

      const token = localStorage.getItem('accessToken');

      const response = await fetch(`${BASE_URL}trade-offers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(offerData)
      });

      if (!response.ok) {
        throw new Error('Failed to create trade offer');
      }

      const result = await response.json();
      console.log('Trade offer created:', result);
      setIsSubmitting(false);
      setStep(3); // Move to confirmation step
      toast.success('Trade offer created successfully!');
    } catch (error) {
      console.error('Error creating trade offer:', error);
      toast.error('Failed to create trade offer. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // If crypto currency changes, reset the rate if the amounts are set
    if (name === 'cryptoCurrency' && formData.cryptoAmount && formData.secondaryAmount) {
      setFormData(prev => ({
        ...prev,
        rate: ''
      }));
    }
  };

  // Go to next step
  // Go to next step
const nextStep = () => {
  if (!formData.cryptoAmount || !formData.secondaryAmount || !formData.rate) {
    toast.error('Please fill in all amount fields');
    return;
  }

  if (formData.minAmount && parseFloat(formData.minAmount) > parseFloat(formData.cryptoAmount)) {
    toast.error('Minimum amount cannot be greater than the trade amount');
    return;
  }

  if (formData.maxAmount && parseFloat(formData.maxAmount) < parseFloat(formData.cryptoAmount)) {
    toast.error('Maximum amount cannot be less than the trade amount');
    return;
  }

  if (formData.minAmount && formData.maxAmount && parseFloat(formData.minAmount) > parseFloat(formData.maxAmount)) {
    toast.error('Minimum amount cannot be greater than maximum amount');
    return;
  }

  if (formData.cryptoCurrency === formData.secondaryCurrency) {
    toast.error('You must select different cryptocurrencies for trading');
    return;
  }

  setStep(step + 1);  // This was incorrectly placed outside the function
};


// Go to previous step
const prevStep = () => {
  setStep(step - 1);
};

return (
  <div className="amount-form-container">
    <div className="form-header">
      <h2>{mode === 'create' ? 'Create New Crypto Trade Offer' : 'Place Crypto Trade Order'}</h2>
      <div className="progress-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Trade Details</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Review</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Confirm</div>
      </div>
    </div>

    <form onSubmit={handleSubmit}>
      {step === 1 && (
        <div className="form-step">
          <div className="form-toggle">
            <button
              type="button"
              className={`toggle-btn ${formData.transactionType === 'buy' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, transactionType: 'buy' })}
            >
              Buy Crypto
            </button>
            <button
              type="button"
              className={`toggle-btn ${formData.transactionType === 'sell' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, transactionType: 'sell' })}
            >
              Sell Crypto
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="cryptoCurrency">
              {formData.transactionType === 'buy' ? 'Crypto to Receive' : 'Crypto to Send'}
            </label>
            <select
              id="cryptoCurrency"
              name="cryptoCurrency"
              value={formData.cryptoCurrency}
              onChange={handleCurrencyChange}
              required
            >
              {cryptoCurrencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cryptoAmount">
              {formData.transactionType === 'buy' ? 'Amount to receive' : 'Amount to send'}
            </label>
            <div className="input-with-suffix">
              <input
                type="number"
                id="cryptoAmount"
                name="cryptoAmount"
                value={formData.cryptoAmount}
                onChange={handleAmountChange}
                step="any"
                min="0"
                placeholder="0.00"
                required
              />
              <span className="suffix">{formData.cryptoCurrency}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="minAmount">Minimum Amount (optional)</label>
            <div className="input-with-suffix">
              <input
                type="number"
                id="minAmount"
                name="minAmount"
                value={formData.minAmount}
                onChange={handleChange}
                step="any"
                min="0"
                placeholder="0.00"
              />
              <span className="suffix">{formData.cryptoCurrency}</span>
            </div>
            <p className="input-hint">Leave empty if no minimum</p>
          </div>

          <div className="form-group">
            <label htmlFor="maxAmount">Maximum Amount (optional)</label>
            <div className="input-with-suffix">
              <input
                type="number"
                id="maxAmount"
                name="maxAmount"
                value={formData.maxAmount}
                onChange={handleChange}
                step="any"
                min="0"
                placeholder="0.00"
              />
              <span className="suffix">{formData.cryptoCurrency}</span>
            </div>
            <p className="input-hint">Leave empty if no maximum</p>
          </div>

          <div className="form-group">
            <label htmlFor="secondaryCurrency">
              Exchange Crypto
            </label>
            <select
              id="secondaryCurrency"
              name="secondaryCurrency"
              value={formData.secondaryCurrency}
              onChange={handleCurrencyChange}
              required
            >
              {cryptoCurrencies
                .filter(currency => currency.code !== formData.cryptoCurrency)
                .map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.code})
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="secondaryAmount">
              {formData.transactionType === 'buy' ? 'Amount to send' : 'Amount to receive'}
            </label>
            <div className="input-with-suffix">
              <input
                type="number"
                id="secondaryAmount"
                name="secondaryAmount"
                value={formData.secondaryAmount}
                onChange={handleAmountChange}
                step="any"
                min="0"
                placeholder="0.00"
                required
              />
              <span className="suffix">{formData.secondaryCurrency}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="rate">Exchange Rate</label>
            <div className="input-with-suffix">
              <input
                type="number"
                id="rate"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                step="any"
                min="0"
                placeholder="0.00"
                required
              />
              <span className="suffix">
                {formData.secondaryCurrency}/{formData.cryptoCurrency}
              </span>
            </div>
            <p className="input-hint">This is calculated automatically but can be adjusted manually</p>
          </div>

          <div className="form-group">
            <label>Payment Methods</label>
            <div className="checkbox-group">
              {paymentOptions.map(option => (
                <label key={option.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="paymentMethods"
                    value={option.id}
                    checked={formData.paymentMethods.includes(option.id)}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom"></span>
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="timeWindow">Time Window</label>
            <select
              id="timeWindow"
              name="timeWindow"
              value={formData.timeWindow}
              onChange={handleChange}
              required
            >
              {timeWindows.map(window => (
                <option key={window.value} value={window.value}>{window.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="terms">Terms & Conditions</label>
            <textarea
              id="terms"
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              placeholder="Specify any special terms for this trade..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-next" onClick={nextStep}>
              Next: Review Offer
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-step review-step">
          <h3>Review Your Crypto Trade Offer</h3>

          <div className="review-card">
            <div className="review-header">
              <span className={`offer-type ${formData.transactionType}`}>
                {formData.transactionType === 'buy' ? 'Receive' : 'Send'}
              </span>
              <h4>
                {formData.cryptoAmount} {formData.cryptoCurrency}
                <span> for </span>
                {formData.secondaryAmount} {formData.secondaryCurrency}
              </h4>
            </div>

            <div className="review-details">
              <div className="detail-row">
                <span className="detail-label">Rate:</span>
                <span className="detail-value">
                  1 {formData.cryptoCurrency} = {formData.rate} {formData.secondaryCurrency}
                </span>
              </div>

              {formData.minAmount && (
                <div className="detail-row">
                  <span className="detail-label">Minimum Amount:</span>
                  <span className="detail-value">
                    {formData.minAmount} {formData.cryptoCurrency}
                  </span>
                </div>
              )}

              {formData.maxAmount && (
                <div className="detail-row">
                  <span className="detail-label">Maximum Amount:</span>
                  <span className="detail-value">
                    {formData.maxAmount} {formData.cryptoCurrency}
                  </span>
                </div>
              )}

              <div className="detail-row">
                <span className="detail-label">Transaction Type:</span>
                <span className="detail-value">
                  {formData.transactionType === 'buy'
                    ? `Receive ${formData.cryptoCurrency} for ${formData.secondaryCurrency}`
                    : `Send ${formData.cryptoCurrency} for ${formData.secondaryCurrency}`}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Payment Methods:</span>
                <span className="detail-value">
                  {formData.paymentMethods.map(method =>
                    paymentOptions.find(o => o.id === method)?.label
                  ).join(', ')}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Time Window:</span>
                <span className="detail-value">
                  {timeWindows.find(w => w.value === formData.timeWindow)?.label}
                </span>
              </div>

              {formData.terms && (
                <div className="detail-row">
                  <span className="detail-label">Terms:</span>
                  <span className="detail-value">{formData.terms}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-back" onClick={prevStep}>
              Back
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Confirm & Create Offer'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form-step confirmation-step">
          <div className="confirmation-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.86" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 4L12 14.01L9 11.01" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>Crypto Trade Offer Created Successfully!</h3>
          <p>
            Your {formData.transactionType === 'buy' ? 'receive' : 'send'} offer for {formData.cryptoAmount} {formData.cryptoCurrency}
            for {formData.secondaryAmount} {formData.secondaryCurrency} has been listed.
          </p>

          <div className="confirmation-actions">
            <button type="button" className="btn-primary" onClick={handleViewOffer}>
              View Offer
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setStep(1);
                setFormData({
                  transactionType: 'buy',
                  cryptoAmount: '',
                  minAmount: '',
                  maxAmount: '',
                  cryptoCurrency: 'BTC',
                  secondaryAmount: '',
                  secondaryCurrency: 'ETH',
                  rate: '',
                  paymentMethods: [],
                  timeWindow: 30,
                  terms: ''
                });
              }}
            >
              Create Another Offer
            </button>
          </div>
        </div>
      )}
    </form>
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
      theme="colored"
    />
  </div>
);
};

export default AmountForm;