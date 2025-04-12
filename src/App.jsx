
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route 
} from "react-router-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth, AuthProvider } from './contexts/AuthContext';
import axios from "axios";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Footer from "./pages/Footer";
import "./styles/theme.css";
import Messages from "./pages/Messages.jsx";
import Wallet from "./pages/Wallet";
import Vendor from "./pages/Vendor";
import Amount from "./pages/Amount";
import Chat from "./pages/Chat";
import Trades from "./pages/Trades";
import VerifyOTP from "./components/VerifyOTP";
import FiatP2P from "./components/FiatP2P";
import BuyCrypto from "./pages/BuyCrypto";
import Support from "./pages/Support";
import Tutorials from "./pages/Tutorials";
import Faq from "./pages/Faq-page";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import SellCrypto from "./pages/SellCrypto";
import ProfileDetails from "./pages/ProfileDetails";
import Market from "./pages/Market";
import ForgotPassword from "./components/ForgotPassword";
import TermsAndCondition from "./components/VendorDashboard/TermsAndCondition";
import CryptoListing from "./components/VendorDashboard/CryptoListing";
import DashboardVendors from "./components/VendorDashboard/DashboardVendors";
import Navbar from "./components/Navbar";
import "uikit/dist/css/uikit.min.css";
import ResetPassword from "./components/ResetPassword";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

function AppWrapper() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <AuthProvider>
      <AppInner theme={theme} toggleTheme={toggleTheme} />
    </AuthProvider>
  );
}

function AppInner({ theme, toggleTheme }) {
  const { 
    user, 
    isAuthenticated, 
    logout,
    loading: authLoading 
  } = useAuth();

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } 
          />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          <Route 
            path="/wallet" 
            element={
              <PrivateRoute>
                <Wallet />
              </PrivateRoute>
            } 
          />
          <Route path="/market" element={<Market />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/support" element={<Support />} />
          <Route path="/amount" element={<Amount />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/become-vendor" element={<Vendor />} />
          <Route path="/profile-details/:username" element={<ProfileDetails />} />
          <Route path="/TermsAndCondition" element={<TermsAndCondition />} />
          <Route path="/CryptoListing" element={<CryptoListing />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/fiat-p2p" element={<FiatP2P />} />
          <Route path="/DashboardVendors" element={<DashboardVendors />} />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return !isAuthenticated ? children : null;
}

export default AppWrapper;