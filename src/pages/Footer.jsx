import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie to manage cookies
import "../styles/Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    const token = Cookies.get("jwt"); // Get token from cookies
    console.log("Token:", token); // Check if token is available

    if (!token) {
      setMessage("Please log in to subscribe.");
      return;
    }

    try {
      const response = await axios.post(
        "https://backend-github-code.onrender.com/api/notifications/",
        { message: `New newsletter subscription: ${email}` }, // Custom notification
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Ensure 'Bearer' prefix is added
          },
        }
      );

      if (response.status === 201) {
        setMessage("Subscribed successfully! 🎉");
        setEmail(""); // Clear input field
      }
    } catch (error) {
      console.error("Error subscribing:", error); // Log detailed error
      setMessage("Failed to subscribe. Please try again.");
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <h2>Blif</h2>
          <p>Innovating for a better tomorrow.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/transfer-portal">Home</a></li>
            <li><a href="/about-us">About Us</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="/contact-us">Contact</a></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p>Email: support@blif.com</p>
          <p>Phone: +1 (212) 123-4567</p>
          <p>123 Main Street, New York, NY 10001, USA</p>
        </div>

        {/* Social Media Icons */}
        <div className="footer-social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#" className="facebook"><FaFacebook /></a>
            <a href="#" className="twitter"><FaTwitter /></a>
            <a href="#" className="instagram"><FaInstagram /></a>
            <a href="#" className="linkedin"><FaLinkedin /></a>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="footer-newsletter">
          <h3>Subscribe to Our Newsletter</h3>
          {message && <p className="message">{message}</p>} {/* Display message */}
          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="footer-bottom">
        <p>&copy; 2025 Blif. All Rights Reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Use</a></p>
      </div>
    </footer>
  );
};

export default Footer;