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
          <h1
            onClick={() => navigate("/")}
            className="text-3xl font-extrabold tracking-tight text-gray-900 cursor-pointer hover:text-amber-600 transition-all"
          >
            <span className="text-amber-500">Air</span>GO
          </h1>

          <nav className="hidden md:flex space-x-8 text-gray-900 font-medium">
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
          </nav>

          <button
            className="md:hidden text-gray-900 text-2xl px-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          <div
            onClick={() => navigate("/profile")}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-transparent cursor-pointer hover:scale-110 transition-transform ml-4"
              >
            <User className="text-amber-600 w-9 h-9 hover:text-amber-700 transition-colors" />
          </div>

        </header>

        {menuOpen && (
          <div className="absolute top-20 right-6 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6 flex flex-col space-y-4 md:hidden z-30">
            {["/about-us", "/our-services"].map((path, i) => (
              <button
                key={i}
                onClick={() => {
                  handleNavClick(path);
                  setMenuOpen(false);
                }}
                className="text-gray-900 font-medium hover:text-amber-600 transition text-left"
              >
                {path === "/about-us" ? "About Us" : "Our Services"}
              </button>
            ))}
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

      {/* Drone Specs */}
      <section className="py-24 bg-gradient-to-b from-amber-50 via-white to-yellow-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-amber-600 mb-3">
            Our Top Drones
          </h2>
          <p className="text-gray-600">
            Choose the drone that matches your delivery needs — precision, power, and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {[
            {
              img: "https://i.pinimg.com/736x/15/77/05/15770525f5284e9692c7fd7a6daac6d6.jpg",
              title: "Drone X1",
              desc: "High-speed drone with 4K camera, perfect for express deliveries.",
            },
            {
              img: "https://i.pinimg.com/1200x/36/04/2c/36042ca756f9682f76f9b480d36eae27.jpg",
              title: "Drone A2",
              desc: "AI-powered navigation with real-time obstacle detection.",
            },
            {
              img: "https://i.pinimg.com/1200x/08/5a/aa/085aaae92231935bbd7209abecdc1d89.jpg",
              title: "Drone Z3",
              desc: "Long-range drone with up to 2 hours flight time.",
            },
          ].map((drone, i) => (
            <div
              key={i}
              className="bg-white border border-amber-100 rounded-2xl shadow-lg hover:shadow-amber-300/60 transform hover:-translate-y-2 transition-all duration-300 text-center p-6"
            >
              <img
                src={drone.img}
                alt={drone.title}
                className="w-full h-52 object-cover rounded-xl mb-5"
              />
              <h3 className="text-2xl font-semibold text-gray-800">
                {drone.title}
              </h3>
              <p className="text-gray-600 mt-2 mb-4">{drone.desc}</p>
              <button
                onClick={handleHireDrone}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium shadow-md transition-all"
              >
                Hire Now
              </button>
            </div>
          ))}
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


      {/* Contact Section */}
      <section className="py-24 bg-gradient-to-r from-white to-amber-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-amber-600 mb-6">Contact Us</h2>
          <p className="text-gray-700 mb-10">
            Have a question or need assistance? Reach out to our team anytime.
          </p>
          <form className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Your Name"
              className="border border-amber-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="border border-amber-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              className="border border-amber-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-amber-400"
            ></textarea>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-full transition-all shadow-md hover:scale-105"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-3xl font-bold mb-4">
              <span className="text-white">Air</span>
              <span className="text-yellow-200">GO</span>
            </h3>
            <p className="text-yellow-100 leading-relaxed">
              Redefining drone rentals with innovation and reliability. The future of aerial delivery is here.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-yellow-100">
              <li>
                <a href="#specs" className="hover:text-white">Specifications</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white">Contact</a>
              </li>
              <li>
                <a href="#about" className="hover:text-white">About</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-yellow-100">
              <li>Drone Rentals</li>
              <li>Tracking</li>
              <li>24/7 Support</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <p>📧 mail@airgo.com</p>
            <p>📞 +92 300 1234567</p>
            <p>📍 Rawalpindi, Islamabad</p>
          </div>
        </div>
        <div className="text-center mt-10 text-yellow-100 border-t border-yellow-400 pt-6">
          © 2025 AirGO. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
