import { useState } from "react";
import "../styles/Vendor.css";

const VendorApplication = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [kycStatus, setKycStatus] = useState("Pending");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("Requesting KYC verification...");

    try {
      // Send user data to the backend to create a KYC session
      const response = await fetch("https://your-backend-api.com/start-kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.kycUrl) {
        setMessage("Redirecting to KYC verification...");
        window.location.href = result.kycUrl; // Redirect to Jumio's KYC page
      } else {
        setMessage("Error starting KYC verification.");
      }
    } catch (error) {
      setMessage("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-container">
      <h2>Vendor Application</h2>
      <p className={`kyc-status ${kycStatus.toLowerCase()}`}>KYC Status: {kycStatus}</p>
      {message && <p className="message">{message}</p>}

      <form className="vendor-form" onSubmit={handleSubmit}>
        <label>Full Name:</label>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />

        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />

        <label>Phone Number:</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Processing..." : "Start KYC Verification"}
        </button>
      </form>
    </div>
  );
};

export default VendorApplication;
