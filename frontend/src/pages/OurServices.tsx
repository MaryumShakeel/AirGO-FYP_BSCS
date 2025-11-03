// src/pages/OurServices.tsx
import React from "react";
import { Link } from "react-router-dom";

const OurServices: React.FC = () => {
  const services = [
    {
      title: "Smart Delivery Routing",
      desc: "AI-powered algorithms plan efficient paths to minimize distance, avoid congestion, and reduce energy consumption.",
    },
    {
      title: "Real-Time Drone Tracking",
      desc: "Monitor your delivery’s journey live with intelligent tracking, status updates, and predictive arrival estimates.",
    },
    {
      title: "Automated Dispatch System",
      desc: "AI-driven dispatch automatically assigns drones based on load, weather, and route data to ensure flawless operations.",
    },
    {
      title: "Secure Package Handling",
      desc: "Advanced sensors and stabilizers ensure the safety of every item — from fragile goods to critical medical supplies.",
    },
    {
      title: "Global Scalability",
      desc: "A modular system designed to scale globally, adapting to cities, terrain, and infrastructure with zero configuration.",
    },
    {
      title: "Customer Insights Dashboard",
      desc: "Our dashboard provides smart analytics and performance insights to help businesses monitor operations effectively.",
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      {/* Header */}
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

      {/* Services Section */}
      <main className="flex-1 px-6 sm:px-12 py-16 flex flex-col items-center space-y-12">
        <h2 className="text-3xl sm:text-4xl font-semibold text-amber-400 text-center drop-shadow-lg">
          Delivering Innovation Through Every Flight
        </h2>

        <p className="max-w-4xl text-center text-gray-300 text-lg leading-relaxed">
          At AirGO, every service is designed with precision, reliability, and
          innovation at its core. From smart routing to global scalability, our
          systems ensure flawless performance in every mission.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-amber-500 rounded-2xl p-8 shadow-lg transition-all duration-300 hover:bg-gray-800 hover:scale-105 hover:shadow-amber-500/30"
            >
              <h3 className="text-2xl font-bold text-amber-400 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-amber-500 text-black font-semibold px-8 py-3 rounded-full hover:bg-amber-400 transition-all duration-300 shadow-lg">
          We Deliver. You Fly Higher.
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-amber-500 text-black text-center py-4 font-medium">
        © {new Date().getFullYear()} AirGO. All rights reserved.
      </footer>
    </div>
  );
};

export default OurServices;
