import { useState } from "react";
import axios from "axios"; // Using axios for better error handling
import snsWebSdk from '@sumsub/websdk'; // Import Sumsub Web SDK
import "../styles/Vendor.css";

const VendorApplication = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [kycStatus, setKycStatus] = useState("Pending");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null); // Store the access token

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission and initiate KYC verification
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setMessage({ text: "", type: "" });

    // Validate all fields
    if (!formData.fullName || !formData.email || !formData.phone) {
      setMessage({
        text: "Please fill in all fields",
        type: "error",
      });
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({
        text: "Please enter a valid email address",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "Starting KYC verification...", type: "info" });

    try {
      // Send request to backend to start KYC verification and get the access token
      const response = await axios.post(
        "http://127.0.0.1:8000/kyc/kyc/start/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"), // If using CSRF
          },
          timeout: 15000, // 15-second timeout
        }
      );

      if (response.data.accessToken) {
        // Set the access token to be used in the Web SDK
        setAccessToken(response.data.accessToken);

        setMessage({
          text: "Redirecting to KYC verification...",
          type: "success",
        });

        // Launch the Sumsub Web SDK
        launchWebSdk(response.data.accessToken);

      } else {
        setMessage({
          text: response.data.error || "KYC initiation failed",
          type: "error",
        });
      }
    } catch (error) {
      let errorMessage = "An error occurred during KYC initiation";

      if (error.response) {
        // Backend returned an error
        errorMessage = error.response.data?.error || `Server error (${error.response.status})`;
      } else if (error.request) {
        // No response received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Request setup error
        errorMessage = error.message;
      }

      setMessage({
        text: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function for CSRF token (if needed)
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  // Function to launch Sumsub Web SDK
  function launchWebSdk(accessToken) {
    let snsWebSdkInstance = snsWebSdk.init(
      accessToken,
      // Token update callback
      () => getNewAccessToken()
    )
      .withConf({
        lang: "en", // Set the language
      })
      .on("onError", (error) => {
        console.log("onError", error);
      })
      .onMessage((type, payload) => {
        console.log("onMessage", type, payload);
      })
      .build();

    // Launch the SDK in the specified container
    snsWebSdkInstance.launch("#sumsub-websdk-container");
  }

  // Function to get a new access token (you need to implement it)
  function getNewAccessToken() {
    // You can implement this to get a new access token if necessary
    return Promise.resolve("new_access_token"); // Example
  }

  return (
    <div className="vendor-container">
      <h2>Vendor Application</h2>
      <p className={`kyc-status ${kycStatus.toLowerCase()}`}>
        KYC Status: {kycStatus}
      </p>

      {message.text && (
        <p className={`message ${message.type}`}>{message.text}</p>
      )}

      <form className="vendor-form" onSubmit={handleSubmit}>
        <label>Full Name:</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          required
        />

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

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Processing..." : "Start KYC Verification"}
        </button>
      </form>

      {/* This is where the Sumsub Web SDK will be rendered */}
      <div id="sumsub-websdk-container" style={{ width: "100%", height: "600px" }}></div>
    </div>
  );
};

export default VendorApplication;
