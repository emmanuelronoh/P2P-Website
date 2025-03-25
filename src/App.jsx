import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NavbarBeforeLogin from "./components/NavbarBeforeLogin";
import NavbarAfterLogin from "./components/NavbarAfterLogin";
import "./styles/theme.css";
import Wallet from "./pages/Wallet";
import Trades from "./pages/Trades";
import VerifyOTP from "./components/VerifyOTP";
import BuyCrypto from "./pages/BuyCrypto";
import SellCrypto from "./pages/SellCrypto";
import ForgotPassword from "./components/ForgotPassword";
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

            <div className="app uk-container">
                {/* Trades Navbar should only be shown on P2P pages */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/wallet" element={<Wallet />} />

                    {/* P2P Trading Pages - Show Trades Navbar */}
                    <Route path="/p2p/*" element={<P2PRoutes />} />
                </Routes>
            </div>
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
