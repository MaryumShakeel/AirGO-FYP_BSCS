// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterForm from "./pages/RegisterForm";
import ProtectedRoute from "./components/ProtectedRoute";

import Profile from "./pages/profile";
import ChangePassword from "./pages/ChangePassword";

import DroneHiring from "./pages/DroneHiring";
import OrderConfirmed from "./pages/OrderConfirmed";
import LiveTracking from "./pages/LiveTracking";

import AboutUs from "./pages/AboutUs";
import OurServices from "./pages/OurServices";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import ServicePolicy from "./pages/ServicePolicy";

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Dashboard */}
        <Route path="/" element={<DashboardPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Profile & Settings */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Drone-related Pages */}
        <Route path="/hire-drone" element={<DroneHiring />} />
        <Route path="/order-confirmed" element={<OrderConfirmed />} />
        <Route path="/live-tracking" element={<LiveTracking />} />

        {/* ✅ New Informational Pages */}
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/our-services" element={<OurServices />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/service-policy" element={<ServicePolicy />} />


      </Routes>

    </Router>
  );
}

export default App;
