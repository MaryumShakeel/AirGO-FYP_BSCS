import React from "react";
import { useNavigate } from "react-router-dom";

const OrderConfirmed: React.FC = () => {
  const navigate = useNavigate();

  const handleTrackDelivery = () => {
    navigate("/live-tracking");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-200 via-amber-100 to-white text-gray-900 px-6">
      {/* ✅ Confirmation Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-10 max-w-md text-center transition-transform hover:scale-[1.02] duration-300">
        <div className="text-6xl mb-4 animate-bounce">✅</div>
        <h1 className="text-3xl font-extrabold text-amber-600 mb-3">
          Order Confirmed!
        </h1>
        <p className="text-gray-700 text-base mb-6 leading-relaxed">
          Your order has been successfully placed and our drone is being
          prepared for takeoff. <br /> Sit back and relax — your delivery is on
          the way!
        </p>

        <button
          onClick={handleTrackDelivery}
          className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full shadow-md transition"
        >
          🚁 Track Delivery
        </button>
      </div>

      {/* ✅ Subtle Footer Text */}
      <p className="mt-10 text-gray-600 text-sm">
        Powered by <span className="font-semibold text-black">AirGO</span> •
        Smart Drone Delivery
      </p>
    </div>
  );
};

export default OrderConfirmed;
