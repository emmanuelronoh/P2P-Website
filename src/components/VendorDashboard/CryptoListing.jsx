// VendorDashboard/CryptoListing.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { FiArrowRight, FiDollarSign, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { SiBitcoin } from 'react-icons/si';
import { useNavigate } from "react-router-dom";
import './CryptoListing.scss';

const CRYPTO_OPTIONS = [
  { value: 'BTC', label: 'Bitcoin (BTC)', icon: <SiBitcoin /> },
  { value: 'ETH', label: 'Ethereum (ETH)', icon: <SiBitcoin /> },
  { value: 'USDT', label: 'Tether (USDT)', icon: <SiBitcoin /> },
  { value: 'XRP', label: 'Ripple (XRP)', icon: <SiBitcoin /> },
  { value: 'LTC', label: 'Litecoin (LTC)', icon: <SiBitcoin /> },
];

const PAYMENT_METHODS = [
  { value: 'mpesa', label: 'M-Pesa', icon: <FiCreditCard /> },
  { value: 'paypal', label: 'PayPal', icon: <FiCreditCard /> },
  { value: 'bank', label: 'Bank Transfer', icon: <FiCreditCard /> },
  { value: 'cash', label: 'Cash in Person', icon: <FiCreditCard /> },
];

const CryptoListing = ({ onListingCreated, userLocation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [priceMargin, setPriceMargin] = useState(0);
  const navigate = useNavigate();

  // Form validation schema
  const validationSchema = Yup.object().shape({
    coin: Yup.string().required('Coin type is required'),
    price: Yup.number()
      .required('Price is required')
      .positive('Price must be positive')
      .moreThan(0, 'Price must be greater than 0'),
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .moreThan(0, 'Amount must be greater than 0'),
    location: Yup.string().required('Location is required'),
    payment: Yup.array()
      .min(1, 'At least one payment method is required')
      .required('Payment method is required'),
    terms: Yup.boolean().oneOf([true], 'You must accept the terms'),
  });

  const formik = useFormik({
    initialValues: {
      coin: '',
      price: '',
      amount: '',
      location: userLocation || '',
      payment: [],
      terms: false,
      priceType: 'fixed',
      margin: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call to your backend
        const response = await axios.post('/api/listings', values);
        
        setSuccess(true);
        if (onListingCreated) {
          onListingCreated(response.data);
        }
        
        // Reset form after successful submission
        setTimeout(() => {
          formik.resetForm();
          setSuccess(false);
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create listing');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Calculate final price if margin is applied
  useEffect(() => {
    if (formik.values.priceType === 'margin' && formik.values.price) {
      const basePrice = parseFloat(formik.values.price);
      const marginAmount = (basePrice * priceMargin) / 100;
      formik.setFieldValue('price', (basePrice + marginAmount).toFixed(2));
    }
  }, [priceMargin, formik.values.priceType]);

  // Auto-detect user location if not provided
  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Reverse geocode to get city name would happen here in a real app
          formik.setFieldValue('location', 'Detected Location');
        },
        () => {
          // Silently fail if location detection fails
        }
      );
    }
  }, [userLocation]);

  if (success) {
    return (
      <div className="listing-success">
        <div className="success-animation">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h3>Listing Created Successfully!</h3>
        <p>Your crypto offer is now visible to buyers on CheetahX.</p>
        <button 
          className="btn-secondary"
          onClick={() => setSuccess(false)}
        >
          Create Another Listing
        </button>
      </div>
    );
  }

  return (
    <form className="crypto-listing-form" onSubmit={formik.handleSubmit}>
      <div className="form-header">
        <h2>Create New Crypto Listing</h2>
        <p>Fill in the details to list your crypto for sale on CheetahX P2P Marketplace</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-section">
        <label className="form-label">
          <span>Cryptocurrency</span>
          <div className="select-wrapper">
            <select
              name="coin"
              value={formik.values.coin}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.errors.coin && formik.touched.coin ? 'error' : ''}
            >
              <option value="">Select Cryptocurrency</option>
              {CRYPTO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="select-icon">
              <SiBitcoin />
            </div>
          </div>
          {formik.errors.coin && formik.touched.coin && (
            <div className="field-error">{formik.errors.coin}</div>
          )}
        </label>
      </div>

      <div className="form-row">
        <div className="form-col">
          <label className="form-label">
            <span>Price Type</span>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="priceType"
                  value="fixed"
                  checked={formik.values.priceType === 'fixed'}
                  onChange={formik.handleChange}
                />
                <span>Fixed Price</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="priceType"
                  value="margin"
                  checked={formik.values.priceType === 'margin'}
                  onChange={formik.handleChange}
                />
                <span>Market Margin</span>
              </label>
            </div>
          </label>
        </div>

        <div className="form-col">
          <label className="form-label">
            <span>
              {formik.values.priceType === 'fixed' ? 'Price per coin (USD)' : 'Market Margin (%)'}
            </span>
            <div className="input-wrapper">
              {formik.values.priceType === 'fixed' ? (
                <>
                  <input
                    type="number"
                    name="price"
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={formik.errors.price && formik.touched.price ? 'error' : ''}
                  />
                  <div className="input-icon">
                    <FiDollarSign />
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.1"
                    value={priceMargin}
                    onChange={(e) => setPriceMargin(parseFloat(e.target.value))}
                  />
                  <div className="margin-value">{priceMargin}%</div>
                  <div className="market-price-display">
                    Final Price: ${formik.values.price || '0.00'}
                  </div>
                </>
              )}
            </div>
            {formik.errors.price && formik.touched.price && (
              <div className="field-error">{formik.errors.price}</div>
            )}
          </label>
        </div>
      </div>

      <div className="form-section">
        <label className="form-label">
          <span>Amount Available</span>
          <div className="input-wrapper">
            <input
              type="number"
              name="amount"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="0.00"
              step="0.00000001"
              min="0"
              className={formik.errors.amount && formik.touched.amount ? 'error' : ''}
            />
            <div className="input-currency">{formik.values.coin || 'BTC'}</div>
          </div>
          {formik.errors.amount && formik.touched.amount && (
            <div className="field-error">{formik.errors.amount}</div>
          )}
        </label>
      </div>

      <div className="form-section">
        <label className="form-label">
          <span>Location</span>
          <div className="input-wrapper">
            <input
              type="text"
              name="location"
              value={formik.values.location}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="City, Country"
              className={formik.errors.location && formik.touched.location ? 'error' : ''}
            />
            <div className="input-icon">
              <FiMapPin />
            </div>
          </div>
          {formik.errors.location && formik.touched.location && (
            <div className="field-error">{formik.errors.location}</div>
          )}
        </label>
      </div>

      <div className="form-section">
        <label className="form-label">
          <span>Payment Methods</span>
          <div className="payment-methods">
            {PAYMENT_METHODS.map((method) => (
              <label key={method.value} className="payment-method">
                <input
                  type="checkbox"
                  name="payment"
                  value={method.value}
                  checked={formik.values.payment.includes(method.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      formik.setFieldValue('payment', [...formik.values.payment, method.value]);
                    } else {
                      formik.setFieldValue(
                        'payment',
                        formik.values.payment.filter((val) => val !== method.value)
                      );
                    }
                  }}
                />
                <span className="payment-method-content">
                  <span className="payment-icon">{method.icon}</span>
                  <span className="payment-label">{method.label}</span>
                </span>
              </label>
            ))}
          </div>
          {formik.errors.payment && formik.touched.payment && (
            <div className="field-error">{formik.errors.payment}</div>
          )}
        </label>
      </div>

      <div className="form-section terms-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="terms"
            checked={formik.values.terms}
            onChange={formik.handleChange}
          />
          <span>
            I agree to the <a href="/terms">Terms of Service</a> and confirm this listing complies
            with local laws and regulations.
          </span>
        </label>
        {formik.errors.terms && formik.touched.terms && (
          <div className="field-error">{formik.errors.terms}</div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || !formik.isValid}
        >
          {isSubmitting ? (
            <span className="spinner"></span>
          ) : (
            <>
              Publish Listing <FiArrowRight />
            </>
          )}
        </button>
        <button
          type="button"
          className="navigate-btn"
          onClick={() => navigate("/DashboardVendors")}
          style={{ marginBottom: "1rem", backgroundColor: "#007bff", color: "#fff", padding: "10px 20px", border: "none", cursor: "pointer", borderRadius: "5px" }}
        >
          Go to Your Dashboard
        </button>
      </div>

      <div className="form-notice">
        <p>
          <strong>Note:</strong> CheetahX charges a 0.5% fee on successful trades. Listings are
          active for 7 days.
        </p>
      </div>
    </form>
  );
};

CryptoListing.propTypes = {
  onListingCreated: PropTypes.func,
  userLocation: PropTypes.string,
};

export default CryptoListing;