// src/pages/AboutUs.tsx
import React from "react";
import { Link } from "react-router-dom";

const AboutUs: React.FC = () => {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="flex justify-between items-center bg-amber-500 px-8 py-5 shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-wide">
          Air<span className="text-white">GO</span>
        </h1>
        <Link
          to="/"
          className="bg-black text-amber-400 px-4 py-2 rounded-full font-medium hover:bg-gray-900 hover:text-white transition-all duration-300"
        >
          ← Back to Dashboard
        </Link>
      </header>

      {/* About Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-16 text-center space-y-8">
        <h2 className="text-3xl sm:text-4xl font-semibold text-amber-400 drop-shadow-lg">
          Redefining Drone Delivery for a Smarter Future
        </h2>

        <p className="max-w-4xl text-gray-300 text-lg leading-relaxed">
          <span className="text-amber-400 font-semibold">AirGO</span> is a
          next-generation drone delivery platform that combines Artificial
          Intelligence, real-time optimization, and scalable architecture to
          create the most reliable and efficient delivery network in the world.
        </p>

        <p className="max-w-4xl text-gray-300 text-lg leading-relaxed">
          We are dedicated to sustainability, precision, and innovation. Every
          flight we make brings us closer to transforming logistics — enabling
          faster, safer, and smarter deliveries to communities everywhere.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <div className="bg-gray-900 border border-amber-500 rounded-xl p-6 max-w-sm hover:scale-105 hover:shadow-amber-500/30 transition-all duration-300">
            <h3 className="text-xl font-semibold text-amber-400 mb-2">
              Our Mission
            </h3>
            <p className="text-gray-300 text-base">
              To revolutionize global logistics through autonomous drone
              technology and intelligent delivery optimization.
            </p>
          </div>

          <div className="bg-gray-900 border border-amber-500 rounded-xl p-6 max-w-sm hover:scale-105 hover:shadow-amber-500/30 transition-all duration-300">
            <h3 className="text-xl font-semibold text-amber-400 mb-2">
              Our Vision
            </h3>
            <p className="text-gray-300 text-base">
              To create a world where every delivery is faster, smarter, and
              environmentally responsible.
            </p>
          </div>
        </div>

        
      </main>

      {/* Footer */}
<footer className="bg-amber-500 text-black text-center py-6 font-medium">
  <div className="space-x-4 mb-2">
    <a href="/privacy-policy" className="hover:underline">Privacy Policy</a> |
    <a href="/refund-policy" className="hover:underline">Return & Refund Policy</a> |
    <a href="/service-policy">Service Policy</a> |
    <a href="/terms" className="hover:underline">Terms & Conditions</a>
  </div>
  © {new Date().getFullYear()} AirGO. All rights reserved.
</footer>

    </div>
  );
};

export default AboutUs;
