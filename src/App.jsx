import React, { useState, useEffect } from "react";
import { Buffer } from 'buffer';
import process from 'process';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  useNavigate
} from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WalletProvider } from './contexts/walletContext';

import Home from "./pages/Home";
import HomeFiat from "./pages/Home-fiat";
import NavbarP2P from "./components/NavbarP2P";
import Dashboard from "./pages/Dashboard";
import DashboardFiatPage from "./pages/DashboadFiat";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Footer from "./pages/Footer";
import "./styles/theme.css";
import Messages from "./pages/Messages";
import MessagesP2p from "./pages/Messages-p2p";
import Wallet from "./pages/Wallet";
import Vendor from "./pages/Vendor";
import Amount from "./pages/Amount";
import VerifyOTP from "./components/VerifyOTP";
import FiatP2P from "./components/FiatP2P";
import BuyCrypto from "./pages/BuyCrypto";
import Support from "./pages/Support";
import Tutorials from "./pages/Tutorials";
import Faq from "./pages/Faq-page";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotificationsPage from "./pages/NotificationsFiat";
import SellCrypto from "./pages/SellCrypto";
import ProfileDetails from "./pages/ProfileDetails";
import Market from "./pages/Market";
import ForgotPassword from "./components/ForgotPassword";
import TermsAndCondition from "./pages/TermsAndCondition";
import CryptoListing from "./pages/CryptoListing";
import DashboardVendors from "./pages/DashboardVendors";
import Navbar from "./components/Navbar";
import "uikit/dist/css/uikit.min.css";
import ResetPassword from "./components/ResetPassword";

// Create a ThemeContext
export const ThemeContext = React.createContext();

function AppWrapper() {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }, []);

  window.Buffer = Buffer;
  window.process = process;

  useEffect(() => {
    // Apply theme to document element and save to localStorage
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.className = theme; // Add theme class to html element
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthProvider>
        <WalletProvider>
          <AppInner />
        </WalletProvider>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

// Layout components
function MainLayout() {
  const { theme } = React.useContext(ThemeContext);

  return (
    <div className={`app ${theme}`}>
      <Navbar />
      <main className={`content ${theme}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function P2PLayout() {
  const { theme } = React.useContext(ThemeContext);

  return (
    <div className={`app ${theme}`}>
      <NavbarP2P />
      <main className={`content ${theme}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function MessagesLayout() {
  const { theme } = React.useContext(ThemeContext);

  return (
    <div className={`app ${theme}`}>
      <Navbar />
      <main className={`content ${theme}`}>
        <Outlet />
      </main>
    </div>
  );
}

function P2PMessagesLayout() {
  const { theme } = React.useContext(ThemeContext);

  return (
    <div className={`app ${theme}`}>
      <NavbarP2P />
      <main className={`content ${theme}`}>
        <Outlet />
      </main>
    </div>
  );
}

function FullPageLayout() {
  const { theme } = React.useContext(ThemeContext);

  return (
    <div className={`full-page-layout ${theme}`}>
      <Outlet />
    </div>
  );
}

function AppInner() {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
          <Route path="/market" element={<Market />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/support" element={<Support />} />
          <Route path="/amount" element={<Amount />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/become-vendor" element={<Vendor />} />
          <Route path="/profile-details/:username" element={<ProfileDetails />} />
          <Route path="/TermsAndCondition" element={<TermsAndCondition />} />
          <Route path="/CryptoListing" element={<CryptoListing />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/DashboardVendors" element={<DashboardVendors />} />
          <Route path="/profile-details-users/:userId" element={<ProfileDetails />} />
        </Route>

        <Route element={<MessagesLayout />}>
          <Route path="/messages" element={<Messages />} />
        </Route>

        <Route element={<P2PLayout />}>
          <Route path="/fiat-p2p" element={<FiatP2P />} />
          <Route path="/home-fiat" element={<HomeFiat />} />
          <Route path="/notifications-p2p" element={<NotificationsPage />} />
          <Route path="/dashboard-fiat" element={<DashboardFiatPage />} />
          <Route path="/become-vendor-fiat" element={<Vendor />} />
          <Route path="/faq-fiat" element={<Faq />} />
          <Route path="/support-fiat" element={<Support />} />
          <Route path="/tutorials-fiat" element={<Tutorials />} />
          <Route path="/profile-details-user/:userId" element={<ProfileDetails />} />
        </Route>

        <Route element={<P2PMessagesLayout />}>
          <Route path="/messages-p2p" element={<MessagesP2p />} />
          <Route path="/chat-room-fiat" element={<MessagesP2p />} />
          <Route path="/chat-room-fiat-crypto" element={<MessagesP2p />} />
        </Route>

        <Route element={<FullPageLayout />}>
          {/* Full-page routes */}
        </Route>
      </Routes>
    </Router>
  );
}

// Private and PublicOnly Route Guards
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
      const tradeType = localStorage.getItem("tradeType");
      if (tradeType === "fiat") {
        navigate("/fiat-p2p", { replace: true });
      } else {
        navigate("/market", { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  return !isAuthenticated ? children : null;
}

export default AppWrapper;