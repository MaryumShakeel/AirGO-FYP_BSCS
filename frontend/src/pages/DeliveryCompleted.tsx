import React from "react";
import { Link } from "react-router-dom";

const DeliveryCompleted: React.FC = () => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{
        background: "linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 100%)",
      }}
    >
      {/* Success Card */}
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-10 border-t-8 border-amber-500 max-w-md w-full transform transition-transform hover:scale-105">
        <h1 className="text-4xl font-extrabold text-amber-600 mb-4">
          Delivery Completed
        </h1>

        <p className="text-gray-700 text-lg mb-8">
          Your package has successfully reached the destination.
          <br />
          Thank you for using{" "}
          <span className="font-semibold text-amber-700">AirGO</span>!
        </p>

        {/* Navigation Button */}
        <div className="flex justify-center mt-6">
          <Link
            to="/"
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-200"
          >
            Go Back to Home
          </Link>
        </div>
      </div>

      {/* Footer Note */}
      <p className="mt-10 text-gray-700 text-sm">
        © {new Date().getFullYear()} AirGO Drone Delivery System
      </p>
    </div>
  );
};

export default DeliveryCompleted;
