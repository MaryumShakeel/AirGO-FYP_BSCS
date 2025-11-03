// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterForm from "./pages/RegisterForm";
import ProtectedRoute from "./components/ProtectedRoute";

import Profile from "./pages/profile";
import ChangePassword from "./pages/ChangePassword";
import Enable2FA from "./pages/Enable2FA";
//import NotificationPreferences from "./pages/NotificationPreferences";

import DroneHiring from "./pages/DroneHiring";
import OrderConfirmed from "./pages/OrderConfirmed";
import LiveTracking from "./pages/LiveTracking";

// ✅ Newly added pages
import AboutUs from "./pages/AboutUs";
import OurServices from "./pages/OurServices";

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
        <Route path="/enable-2fa" element={<Enable2FA />} />
       {/* <Route path="/notification-preferences" element={<NotificationPreferences />} />*/}

        {/* Drone-related Pages */}
        <Route path="/hire-drone" element={<DroneHiring />} />
        <Route path="/order-confirmed" element={<OrderConfirmed />} />
        <Route path="/live-tracking" element={<LiveTracking />} />

        {/* ✅ New Informational Pages */}
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/our-services" element={<OurServices />} />
      </Routes>
    </Router>
  );
}

export default App;
