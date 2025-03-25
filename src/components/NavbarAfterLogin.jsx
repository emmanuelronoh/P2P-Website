import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/navbar-after.css";
import cheetahLogo from "../assets/cheetah-logo.png";
import axios from 'axios';

function NavbarAfterLogin() {
    const [walletConnected, setWalletConnected] = useState(false);
    const navigate = useNavigate();

    const connectWallet = () => {
        setWalletConnected(true);
    };

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken"); // Get refresh token
    
            await axios.post("http://127.0.0.1:8000/api/auth/logout/", 
                { refresh_token: refreshToken }, // ✅ Send refresh token
                {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`, // ✅ Ensure access token is sent
                        "Content-Type": "application/json",
                    }
                }
            );
    
            // Clear local storage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
    
            // Redirect to login page
            navigate("/login");
            
        } catch (error) {
            console.error("Logout failed:", error.response?.data?.error || error);
            alert("Logout failed. Please try again.");
        }
    };
    

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Left Section - Logo */}
                <div className="navbar-left">
                    <Link to="/dashboard">
                        <img src={cheetahLogo} alt="Cheetah Logo" className="logo-img" />
                    </Link>
                </div>

                {/* Center Section - Links */}
                <div className="navbar-center">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/market">Market</Link>
                    <Link to="/p2p/">My Trades</Link>
                    <Link to="/wallet">Wallet</Link>
                </div>

                {/* Right Section - Buttons */}
                <div className="navbar-right">
                    <button className="icon-btn">🔔</button>
                    <button className="icon-btn">💬</button>
                    {/* Profile Dropdown */}
                    <div className="profile-dropdown">
                        <button className="profile-btn">👤</button>
                        <div className="dropdown-content">
                            <Link to="/settings">Settings</Link>
                            <Link to="/security">Security</Link>
                            <button onClick={handleLogout} className="logout-btn">Logout</button>
                        </div>
                    </div>
                    <button className="btn wallet-btn" onClick={connectWallet}>
                        {walletConnected ? "Wallet Connected" : "Connect Wallet"}
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default NavbarAfterLogin;