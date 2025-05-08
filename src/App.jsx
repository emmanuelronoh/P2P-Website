import React, { useState, useEffect } from "react";
import { Buffer } from 'buffer';
import process from 'process';
import {
  Routes,
  Route,
  Outlet,
  useNavigate,
  Navigate
} from "react-router-dom";
import DApp from "./pages/DApp";
import AOS from 'aos';
import { useLocation } from "react-router-dom";
import 'aos/dist/aos.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WalletProvider } from './contexts/walletContext';
import Home from "./layout/Home";
import Cookie from './Footer_links/Cookie';
import Risk from "./Footer_links/Risk";
import HomeFiat from "./layout/Home-fiat";
import NavbarP2P from "./components/NavbarP2P";
import Dashboard from "./pages/Dashboard";
import DashboardFiatPage from "./pages/DashboadFiat";
import Register from "./authentications/Register";
import Login from "./authentications/Login";
import Footer from "./layout/Footer";
import "./styles/theme.css";
import Messages from "./pages/Messages";
import Terms from "./Footer_links/Terms";
import Privacy from "./Footer_links/Privacy";
import MessagesP2p from "./pages/Messages-p2p";
import Wallet from "./pages/Wallet";
import Vendor from "./pages/Vendor";
import Amount from "./pages/Amount";
import Feedback from "./Footer_links/Feedback";
import VerifyOTP from "./authentications/VerifyOTP";
import FiatP2P from "./components/FiatP2P";
import Support from "./pages/Support";
import GiveReview from "./pages/GiveReview";
import Tutorials from "./pages/Tutorials";
import Faq from "./pages/Faq-page";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotificationsPage from "./pages/NotificationsFiat";
import ProfileDetails from "./pages/ProfileDetails";
import Market from "./pages/Market";
import ForgotPassword from "./components/ForgotPassword";
import TermsAndCondition from "./Footer_links/TermsAndCondition";
import CryptoListing from "./pages/CryptoListing";
import Navbar from "./components/Navbar";
import "uikit/dist/css/uikit.min.css";
import ResetPassword from "./components/ResetPassword";
import VerificationPending from "./pages/VerificationPending";
import InvitationsPage from "./pages/InvitationsPage";

export const ThemeContext = React.createContext();

const LoadingScreen = () => {
  const { theme } = React.useContext(ThemeContext);
  const [progress, setProgress] = useState(0);
  const [tips] = useState([
    "Did you know? Our platform processes transactions in seconds.",
    "Pro tip: Complete your profile to increase transaction limits.",
    "Security first! Always verify transaction details.",
    "New to crypto? Check our tutorials section.",
    "Our support team is available 24/7 to assist you."
  ]);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 10;
      });
    }, 300);

    // Rotate tips
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
    };
  }, [tips.length]);

  return (
    <div className={`loading-screen ${theme}`}>
      <div className="loading-container">
        <div className="loading-animation">
          <div className="crypto-loader">
            <div className="coin bitcoin"></div>
            <div className="coin ethereum"></div>
            <div className="coin ripple"></div>
          </div>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="loading-text">
            {progress < 30 ? "Initializing..." :
              progress < 60 ? "Loading resources..." :
                progress < 90 ? "Almost there..." :
                  "Finalizing..."}
            <span className="ellipsis-animation">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
          <div className="loading-tip">
            <span className="tip-icon"></span>
            {tips[currentTip]}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader = ({ type = "default" }) => {
  const { theme } = React.useContext(ThemeContext);

  if (type === "dashboard") {
    return (
      <div className={`skeleton-loader ${theme} dashboard`}>
        <div className="skeleton-header"></div>
        <div className="skeleton-sidebar"></div>
        <div className="skeleton-content">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`skeleton-loader ${theme}`}>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
  );
};


function AppWrapper() {
  const [theme, setTheme] = useState(() => {
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
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.className = theme;
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


// Enhanced route protection components
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }


  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <SkeletonLoader type="dashboard" />;
  }

  return isAuthenticated ? children : null;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const tradeType = localStorage.getItem("tradeType");
      const redirectPath = tradeType === "fiat" ? "/fiat-p2p" : "/market";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <SkeletonLoader />;
  }

  return !isAuthenticated ? children : null;
}

function VerifiedUserRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <SkeletonLoader type="dashboard" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function AppInner() {
  const { loading: authLoading } = useAuth();
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (authLoading) {
      setShowLoader(true);
      setShowSkeleton(false);
      const timer = setTimeout(() => {
        setShowSkeleton(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowLoader(false);
        setShowSkeleton(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  const showLoadingForRoutes = ["/wallets", "/vendor"]; 

  const shouldShowLoadingScreen = showLoadingForRoutes.includes(location.pathname);

  if (showLoader && shouldShowLoadingScreen) {
    return <LoadingScreen />;
  }

  if (showSkeleton && shouldShowLoadingScreen) {
    return <SkeletonLoader type="dashboard" />;
  }

  return (

    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/verify-otp" element={<PublicOnlyRoute><VerifyOTP /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/reset-password/:uidb64/:token" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
        <Route path="/market" element={<Market />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookie" element={<Cookie />} />
        <Route path="/termsAndcondition" element={<TermsAndCondition />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/risk" element={<Risk />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/invitations" element={<InvitationsPage />} />

      </Route>

      {/* Authenticated but not necessarily verified routes */}
      <Route element={<MainLayout />}>
        <Route path="/verification-pending" element={<PrivateRoute><VerificationPending /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
        <Route path="/become-vendor" element={<PrivateRoute><Vendor /></PrivateRoute>} />
        <Route path="/profile-details/:username" element={<PrivateRoute><ProfileDetails /></PrivateRoute>} />
        <Route path="/profile-details-users/:userId" element={<PrivateRoute><ProfileDetails /></PrivateRoute>} />
        <Route path="/tutorials" element={<PrivateRoute><Tutorials /></PrivateRoute>} />
        <Route path="/support" element={<PrivateRoute><Support /></PrivateRoute>} />
        <Route path="/give-review" element={<PrivateRoute><GiveReview /></PrivateRoute>} />
      </Route>

      <Route element={<MessagesLayout />}>
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
      </Route>

      {/* Fully protected routes (authenticated and verified) - Only for sensitive operations */}
      <Route element={<MainLayout />}>
        <Route path="/amount" element={
          <PrivateRoute>
            <VerifiedUserRoute>
              <Amount />
            </VerifiedUserRoute>
          </PrivateRoute>
        } />
        <Route path="/cryptolisting" element={
          <PrivateRoute>
            <VerifiedUserRoute>
              <CryptoListing />
            </VerifiedUserRoute>
          </PrivateRoute>
        } />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/dapp" element={<DApp />} />
      </Route>

      {/* P2P Routes - Most don't need verification */}
      <Route element={<P2PLayout />}>
        <Route path="/fiat-p2p" element={<PrivateRoute><FiatP2P /></PrivateRoute>} />
        <Route path="/home-fiat" element={<PrivateRoute><HomeFiat /></PrivateRoute>} />
        <Route path="/notifications-p2p" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        <Route path="/dashboard-fiat" element={<PrivateRoute><DashboardFiatPage /></PrivateRoute>} />
        <Route path="/become-vendor-fiat" element={<PrivateRoute><Vendor /></PrivateRoute>} />
        <Route path="/faq-fiat" element={<PrivateRoute><Faq /></PrivateRoute>} />
        <Route path="/support-fiat" element={<PrivateRoute><Support /></PrivateRoute>} />
        <Route path="/tutorials-fiat" element={<PrivateRoute><Tutorials /></PrivateRoute>} />
        <Route path="/profile-details-user/:userId" element={<PrivateRoute><ProfileDetails /></PrivateRoute>} />
        <Route path="/profile-fiat/:username" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Route>

      <Route element={<P2PMessagesLayout />}>
        <Route path="/messages-p2p" element={<PrivateRoute><MessagesP2p /></PrivateRoute>} />
        <Route path="/chat-room-fiat" element={<PrivateRoute><MessagesP2p /></PrivateRoute>} />
        <Route path="/chat-room-fiat-crypto" element={<PrivateRoute><MessagesP2p /></PrivateRoute>} />
      </Route>

      <Route element={<FullPageLayout />}>
        {/* Full-page routes can be added here */}
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppWrapper;