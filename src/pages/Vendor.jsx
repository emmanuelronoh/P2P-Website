import React, { useState } from "react";
import axios from "axios";
import snsWebSdk from "@sumsub/websdk";
import { useNavigate } from "react-router-dom";
import "../styles/Vendor.css";

const VendorApplication = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    user_id: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();

  // Handle form data changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission to start KYC
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setMessage({ text: "", type: "" });

    // Form validation
    if (!formData.email || !formData.phone || !formData.user_id) {
      setMessage({ text: "All fields are required!", type: "error" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ text: "Please enter a valid email.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "Starting KYC verification...", type: "info" });

    try {
      // Send form data to backend for KYC initiation
      const response = await axios.post(
        "http://127.0.0.1:8000/kyc/start/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          timeout: 15000,
        }
      );

      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
        setMessage({ text: "Redirecting to KYC...", type: "success" });
        launchWebSdk(response.data.accessToken);
      } else {
        setMessage({ text: "KYC initiation failed.", type: "error" });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle errors during the KYC process
  const handleError = (error) => {
    let errorMessage = "An error occurred during KYC initiation.";
    if (error.response) {
      errorMessage = error.response.data?.error || `Server error (${error.response.status})`;
    } else if (error.request) {
      errorMessage = "No response from the server. Check your connection.";
    } else {
      errorMessage = error.message;
    }
    setMessage({ text: errorMessage, type: "error" });
  };

  // Helper function to get the CSRF token
  function getCookie(name) {
    const cookie = document.cookie.split(";").find((cookie) => cookie.trim().startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
  }

  // Initialize the Sumsub Web SDK
  function launchWebSdk(accessToken) {
    const snsWebSdkInstance = snsWebSdk.init(accessToken, getNewAccessToken)
      .withConf({ lang: "en" })
      .on("onError", (error) => {
        console.error("Sumsub SDK Error:", error);
      })
      .onMessage((type, payload) => {
        console.log("Sumsub SDK Message:", type, payload);
      })
      .build();

    snsWebSdkInstance.launch("#sumsub-websdk-container");
  }

  // Get a new access token when necessary
  function getNewAccessToken() {
    // Implement token renewal logic if needed
    return Promise.resolve("new_access_token"); // Example, replace with actual logic
  }

  return (
    <div className="vendor-container">
      <h2>Vendor Application</h2>

      {message.text && <p className={`message ${message.type}`}>{message.text}</p>}

      <form className="vendor-form" onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        <label>Phone Number:</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
        />

        <label>User ID:</label>
        <input
          type="text"
          name="user_id"
          value={formData.user_id}
          onChange={handleInputChange}
          required
        />

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Processing..." : "Start KYC Verification"}
        </button>

        <button
          type="button"
          className="navigate-btn"
          onClick={() => navigate("/TermsAndCondition")}
          style={{
            marginTop: "1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Go to P2P Posting
        </button>
      </form>

      {/* Sumsub Web SDK Container */}
      <div
        id="sumsub-websdk-container"
        style={{ width: "100%", height: "600px", marginTop: "2rem" }}
      ></div>
    </div>
  );
};

export default VendorApplication;
