import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import droneImg from "../assets/hero.png";
import cloudsBg from "../assets/clouds.jpeg";
import { User } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);


  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleHireDrone = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/hire-drone");
    }
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section
        className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 sm:px-10 py-12 overflow-hidden"
        style={{
          backgroundImage: `url(${cloudsBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-amber-50/60 to-yellow-100/60"></div>

        {/* Navbar */}
<header className="absolute top-0 left-0 w-full flex justify-between items-center px-6 sm:px-12 py-6 z-20">
  {/* Brand */}
  <h1
    onClick={() => navigate("/")}
    className="text-3xl font-extrabold tracking-tight text-gray-900 cursor-pointer hover:text-amber-600 transition-all"
  >
    <span className="text-amber-500">Air</span>GO
  </h1>

  {/* Desktop nav */}
  <nav className="hidden md:flex items-center space-x-8 text-gray-900 font-medium">
    <button
      onClick={() => handleNavClick("/about-us")}
      className="relative px-2 py-1 hover:text-amber-600 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-amber-500 after:w-0 hover:after:w-full after:transition-all after:duration-300"
    >
      About Us
    </button>

    <button
      onClick={() => handleNavClick("/our-services")}
      className="relative px-2 py-1 hover:text-amber-600 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-amber-500 after:w-0 hover:after:w-full after:transition-all after:duration-300"
    >
      Our Services
    </button>

    {/* Show Login/Register only if NOT logged in */}
    {!isLoggedIn && (
      <>
        <button
          onClick={() => navigate("/login")}
          className="relative px-2 py-1 hover:text-amber-600 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-amber-500 after:w-0 hover:after:w-full after:transition-all after:duration-300"
        >
          Login
        </button>

        <button
          onClick={() => navigate("/register")}
          className="relative px-2 py-1 hover:text-amber-600 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-amber-500 after:w-0 hover:after:w-full after:transition-all after:duration-300"
        >
          Registration
        </button>
      </>
    )}
  </nav>

  {/* Mobile menu toggle */}
  <button
    className="md:hidden text-gray-900 text-2xl px-2"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    {menuOpen ? "✕" : "☰"}
  </button>

  {/* Profile / avatar */}
  <div
    onClick={() => navigate("/profile")}
    className="w-12 h-12 flex items-center justify-center rounded-full bg-transparent cursor-pointer hover:scale-110 transition-transform ml-4"
  >
    <User className="text-amber-600 w-9 h-9 hover:text-amber-700 transition-colors" />
  </div>
</header>

{/* Mobile dropdown menu (show on small screens) */}
{menuOpen && (
  <div className="absolute top-20 right-6 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6 flex flex-col space-y-4 md:hidden z-30">
    <button
      onClick={() => {
        handleNavClick("/about-us");
        setMenuOpen(false);
      }}
      className="text-gray-900 font-medium hover:text-amber-600 text-left"
    >
      About Us
    </button>

    <button
      onClick={() => {
        handleNavClick("/our-services");
        setMenuOpen(false);
      }}
      className="text-gray-900 font-medium hover:text-amber-600 text-left"
    >
      Our Services
    </button>

    {/* Mobile: show Login/Register only when NOT logged in */}
    {!isLoggedIn && (
      <>
        <button
          onClick={() => {
            navigate("/login");
            setMenuOpen(false);
          }}
          className="text-gray-900 font-medium hover:text-amber-600 text-left"
        >
          Login
        </button>

        <button
          onClick={() => {
            navigate("/register");
            setMenuOpen(false);
          }}
          className="text-gray-900 font-medium hover:text-amber-600 text-left"
        >
          Registration
        </button>
      </>
    )}
  </div>
)}




        {/* Hero Content */}
        <div className="relative flex flex-col md:flex-row items-center justify-center w-full mt-20 md:mt-32 gap-12 z-10">
          <div className="flex flex-col items-start space-y-6 max-w-sm">
            <h2 className="text-5xl font-bold text-gray-900 leading-tight">
              Drone Delivery
            </h2>
            <p className="text-lg text-gray-700">
              Seamless rentals, nurturing innovation with every flight.
            </p>
          </div>

          <div className="relative flex flex-col items-center">
            <img
              src={droneImg}
              alt="Drone"
              className="w-[450px] drop-shadow-xl relative z-10 hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="flex flex-col items-end space-y-6 max-w-sm">
            <h2 className="text-5xl font-bold text-gray-900 text-right">
              AirGo Shift
            </h2>
            <p className="text-lg text-gray-700 text-right">
              Effortless rentals, seamlessly tracked for reliability.
            </p>
          </div>
        </div>

        <div className="relative z-20 mt-12 mb-10">
          <button
            onClick={handleHireDrone}
            className="px-10 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg rounded-full shadow-lg hover:scale-110 hover:shadow-amber-400/60 transition-all"
          >
            Hire a Drone
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-gradient-to-r from-white via-amber-50 to-yellow-100 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-amber-600 mb-6">About AirGO</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-10">
            AirGO is dedicated to redefining drone-based logistics and rentals.
            Our mission is to make drone delivery accessible, reliable, and
            sustainable — transforming the way goods move through the skies.
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Innovation",
                desc: "We design intelligent systems that improve delivery accuracy and efficiency.",
              },
              {
                title: "Sustainability",
                desc: "Our eco-friendly drone solutions reduce carbon footprints and fuel consumption.",
              },
              {
                title: "Customer Focus",
                desc: "We prioritize user satisfaction with 24/7 support and seamless tracking.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white border border-amber-200 rounded-2xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Drone Section */}
<section className="py-24 bg-gradient-to-b from-amber-50 via-white to-yellow-50 text-center">
  <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
    <h2 className="text-4xl font-bold text-amber-600 mb-10 animate-fadeInDown">
      Our Featured Drone
    </h2>

    <div className="relative w-full max-w-sm mb-6 animate-fadeInUp">
      <img
        src="https://i.pinimg.com/736x/15/77/05/15770525f5284e9692c7fd7a6daac6d6.jpg"
        alt="DJI Mavic Air 2"
        className="w-full h-auto object-contain rounded-xl shadow-lg hover:scale-105 transition-transform duration-500"
      />
    </div>

    <h3 className="text-2xl font-semibold text-gray-800 animate-fadeInUp delay-200">
      DJI Mavic Air 2
    </h3>

    <p className="text-gray-600 mt-4 max-w-md animate-fadeInUp delay-400">
      Professional-grade drone for precise and reliable delivery operations.
      Equipped with advanced AI navigation and real-time tracking.
    </p>
  </div>
</section>


      {/* Testimonials */}
<section className="py-24 bg-gradient-to-r from-amber-100 via-white to-yellow-100">
  <div className="max-w-6xl mx-auto px-6 text-center">
    <h2 className="text-4xl font-bold text-amber-600 mb-3">
      What Our Clients Say
    </h2>
    <p className="text-gray-700 mb-10">
      Hear from our satisfied customers who trust AirGO for every flight.
    </p>

    <div className="relative">
      {/* Testimonials Container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {[
            {
              name: "Sarah Ahmed",
              text: "The delivery was faster than I expected, and the tracking was seamless!",
              stars: 5,
            },
            {
              name: "Ali Khan",
              text: "Reliable service and excellent drone quality. Highly recommend!",
              stars: 4,
            },
            {
              name: "Emily Johnson",
              text: "AirGO’s customer support is outstanding. They truly care about users.",
              stars: 5,
            },
            {
              name: "David Lee",
              text: "Excellent experience! I was amazed at how quick the delivery was.",
              stars: 5,
            },
            {
              name: "Fatima Noor",
              text: "Simple to hire, easy to track, and very reliable — 10/10 service!",
              stars: 5,
            },
            {
              name: "Michael Brown",
              text: "Professional, prompt, and impressive drone fleet performance.",
              stars: 4,
            },
          ].map((client, i) => (
            <div
              key={i}
              className="min-w-full flex flex-col items-center justify-center px-8"
            >
              <div className="bg-white shadow-lg border border-amber-100 rounded-2xl p-10 max-w-xl mx-auto hover:shadow-amber-200 transition-all">
                <h3 className="text-2xl font-semibold text-gray-800">
                  {client.name}
                </h3>
                <p className="text-gray-600 italic mt-4 mb-6">"{client.text}"</p>
                <div className="flex justify-center text-amber-400 text-xl">
                  {"★".repeat(client.stars)}{"☆".repeat(5 - client.stars)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() =>
          setCurrentIndex((prev) => (prev === 0 ? 5 : prev - 1))
        }
        className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-full shadow-lg transition-all"
      >
        ‹
      </button>

      <button
        onClick={() =>
          setCurrentIndex((prev) => (prev === 5 ? 0 : prev + 1))
        }
        className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-full shadow-lg transition-all"
      >
        ›
      </button>
    </div>
  </div>
</section>



      {/* Footer */}
<footer className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white py-16">
  <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-10">
    {/* Brand */}
    <div>
      <h3 className="text-3xl font-bold mb-4">
        <span className="text-white">Air</span>
        <span className="text-yellow-200">GO</span>
      </h3>
      <p className="text-yellow-100 leading-relaxed">
        Redefining drone rentals with innovation and reliability. The future of aerial delivery is here.
      </p>
    </div>

    {/* Navigation */}
    <div>
      <h4 className="text-lg font-semibold mb-4">Navigation</h4>
      <ul className="space-y-2 text-yellow-100">
        <li><a href="#specs" className="hover:text-white">Specifications</a></li>
        <li><a href="#contact" className="hover:text-white">Contact</a></li>
        <li><a href="#about" className="hover:text-white">About</a></li>
      </ul>
    </div>

    {/* Services */}
    <div>
      <h4 className="text-lg font-semibold mb-4">Our Services</h4>
      <ul className="space-y-2 text-yellow-100">
        <li>Drone Rentals</li>
        <li>Tracking</li>
        <li>24/7 Support</li>
      </ul>
    </div>

    {/* Contact */}
    <div>
      <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
      <p>📧 tabinda.hassan12@gmail.com</p>
      <p>📞 +92 312 5969159</p>
      <p>📍 Islamabad</p>
    </div>
  </div>

  {/* Bottom */}
  <div className="text-center mt-10 text-yellow-100 border-t border-yellow-400 pt-6">
    <div className="space-x-4 mb-2">
      <a href="/privacy-policy" className="hover:text-white text-sm">Privacy Policy</a> |
      <a href="/refund-policy" className="hover:text-white text-sm">Return & Refund Policy</a> |
      <a href="/service-policy">Service Policy</a>|
      <a href="/terms" className="hover:text-white text-sm">Terms & Conditions</a>
    </div>
    © {new Date().getFullYear()} AirGO. All rights reserved.
  </div>
</footer>

    </div>
  );
}
