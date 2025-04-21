import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet
} from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from "react-router-dom";
import { useAuth, AuthProvider } from './contexts/AuthContext';
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
import Chat from "./pages/ChatApi";
import Trades from "./pages/Trades";
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

function AppWrapper() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }, []);

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

// Layout component for main routes with standard Navbar and Footer
function MainLayout({ theme, toggleTheme }) {
  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="app">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

// Layout component for P2P routes with NavbarP2P and Footer
function P2PLayout({ theme, toggleTheme }) {
  return (
    <>
      <NavbarP2P theme={theme} toggleTheme={toggleTheme} />
      <div className="app">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

// Layout component for full-page routes (without Navbar/Footer)
function FullPageLayout() {
  return (
    <div className="full-page-layout">
      <Outlet />
    </div>
  );
}

function AppInner({ theme, toggleTheme }) {
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
        {/* Main routes with standard Navbar and Footer */}
        <Route element={<MainLayout theme={theme} toggleTheme={toggleTheme} />}>
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
          <Route path="/DashboardVendors" element={<DashboardVendors />} />
          <Route path="/chat-room-fiat-crypto" element={<MessagesP2p />} />
        </Route>

        {/* P2P routes with NavbarP2P and Footer */}
        <Route element={<P2PLayout theme={theme} toggleTheme={toggleTheme} />}>
          <Route path="/fiat-p2p" element={<FiatP2P />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/home-fiat" element={<HomeFiat />} /> {/* ✅ Add this here */}
          <Route path="/notifications-p2p" element={<NotificationsPage />} />
          <Route path="/dashboard-fiat" element={<DashboardFiatPage />} />
          <Route path="/become-vendor-fiat" element={<Vendor />} />
          <Route path="/faq-fiat" element={<Faq />} />
          <Route path="/support-fiat" element={<Support />} />
          <Route path="/tutorials-fiat" element={<Tutorials />} />
          <Route path="/profile-details-user/:username" element={<ProfileDetails />} />
          <Route path="/messages-p2p" element={<MessagesP2p />} />
          <Route path="/chat-room-fiat" element={<MessagesP2p />} />
        </Route>

        {/* Full-page routes without Navbar/Footer */}
        <Route element={<FullPageLayout />}>
          {/* Add any full-page routes here */}
        </Route>
      </Routes>
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
      navigate("/market", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return !isAuthenticated ? children : null;
}

export default AppWrapper;