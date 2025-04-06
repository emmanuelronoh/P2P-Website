import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Footer from "./pages/Footer";
import "./styles/theme.css";
import ConnectWallet from "./components/ConnectWallet";
import Messages from "./pages/Messages.jsx";
import Wallet from "./pages/Wallet";
import Vendor from "./pages/Vendor";
import Amount from "./pages/Amount";
import Chat from "./pages/Chat";
import Trades from "./pages/Trades";
import VerifyOTP from "./components/VerifyOTP";
import BuyCrypto from "./pages/BuyCrypto";
import Profile from "./pages/Profile";
import SellCrypto from "./pages/SellCrypto";
import ProfileDetails from "./pages/ProfileDetails";
import Market from "./pages/Market";
import ForgotPassword from "./components/ForgotPassword";
import TermsAndCondition from "./components/VendorDashboard/TermsAndCondition";
import CryptoListing from "./components/VendorDashboard/CryptoListing";
import DashboardVendors from "./components/VendorDashboard/DashboardVendors";
import Navbar from "./components/Navbar"; // Updated to use the new unified Navbar
import "uikit/dist/css/uikit.min.css";

function App() {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem("accessToken")
    );

    // Check authentication status when the app loads
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        
        // Verify token validity if exists
        const verifyToken = async () => {
            const token = localStorage.getItem("accessToken");
            if (token) {
                try {
                    // Add your token verification logic here
                    // For example, an API call to validate the token
                    // If invalid, clear the token and set isAuthenticated to false
                } catch (error) {
                    handleLogout();
                }
            }
        };
        
        verifyToken();
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("walletAddress");
        setIsAuthenticated(false);
    };

    return (
        <Router>
            {/* Unified Navbar with all props */}
            <Navbar 
                theme={theme} 
                toggleTheme={toggleTheme} 
                isLoggedIn={isAuthenticated}
                onLogout={handleLogout}
            />

            <div className="app">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route 
                        path="/dashboard" 
                        element={<Dashboard />} 
                    />
                    <Route 
                        path="/register" 
                        element={<Register onSuccessfulRegister={handleLogin} />} 
                    />
                    <Route 
                        path="/login" 
                        element={<Login onSuccessfulLogin={handleLogin} />} 
                    />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/market" element={<Market />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/amount" element={<Amount />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/become-vendor" element={<Vendor />} />
                    <Route path="/profile-details/:id" element={<ProfileDetails />} />
                    <Route path="/TermsAndCondition" element={<TermsAndCondition />} />
                    <Route path="/CryptoListing" element={<CryptoListing />} />
                    <Route path="/DashboardVendors" element={<DashboardVendors />} />
                    <Route path="/p2p/*" element={<P2PRoutes />} />
                </Routes>
            </div>

            <Footer />
        </Router>
    );
}

// P2P Routes (Includes Trades Navbar)
function P2PRoutes() {
    return (
        <div>
            <Trades />
            <Routes>
                <Route path="buy" element={<BuyCrypto />} />
                <Route path="sell" element={<SellCrypto />} />
            </Routes>
        </div>
    );
}

export default App;