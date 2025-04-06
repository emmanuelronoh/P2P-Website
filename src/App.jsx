import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NavbarBeforeLogin from "./components/NavbarBeforeLogin";
import NavbarAfterLogin from "./components/NavbarAfterLogin";
import Footer from "./pages/Footer"; // ✅ Import Footer
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
import "uikit/dist/css/uikit.min.css";

function App() {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken"));

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <Router>
            {/* Show different Navbar based on authentication */}
            {isAuthenticated ? <NavbarAfterLogin /> : <NavbarBeforeLogin />}

            <div className="app">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
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
                    <Route path="/TermsAndCondition"  element={<TermsAndCondition />} />
                    <Route path="/CryptoListing"  element={<CryptoListing />} />
                    <Route path="/DashboardVendors"  element={<DashboardVendors />} />            
                    <Route path="/p2p/*" element={<P2PRoutes />} />
                </Routes>
            </div>

            {/* ✅ Add Footer Here */}
            <Footer />
        </Router>
    );
}

// P2P Routes (Includes Trades Navbar)
function P2PRoutes() {
    return (
        <div>
            <Trades /> {/* ✅ Always visible on P2P pages */}
            <Routes>
                <Route path="buy" element={<BuyCrypto />} />
                <Route path="sell" element={<SellCrypto />} />
            </Routes>
        </div>
    );
}

export default App;
