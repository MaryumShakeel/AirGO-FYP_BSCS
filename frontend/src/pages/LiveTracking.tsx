import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🛰 Interface for Telemetry Data
interface TelemetryData {
  latitude: number;
  longitude: number;
  battery: number;
  speed: number;
  status: string;
}

interface DroneStatus {
  orderId: string;
  eta: string;
  droneId: string;
  destination: [number, number];
}

interface RecenterProps {
  position: [number, number];
}

// ✅ Recenter Button
const RecenterButton: React.FC<RecenterProps> = ({ position }) => {
  const map = useMap();

  const handleRecenter = () => {
    map.setView(position, 15, { animate: true });
  };

  return (
    <button
      onClick={handleRecenter}
      className="absolute bottom-6 right-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition"
    >
      🎯 Recenter
    </button>
  );
};

const LiveTracking: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [status, setStatus] = useState<DroneStatus>({
    orderId: "ORD-5471",
    eta: "12 mins",
    droneId: "DRN-108",
    destination: [33.613954, 73.199972], // Example destination (your university)
  });

  // ✅ Fetch Live Telemetry from Backend (every 5 seconds)
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dji/telemetry");
        setTelemetry(res.data);
      } catch (error) {
        console.error("Failed to fetch telemetry:", error);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Custom Icons
  const droneIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
    iconSize: [45, 45],
  });

  const destinationIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [40, 40],
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 text-gray-900">
      {/* ✅ Header */}
      <header className="w-full bg-white shadow-md border-b border-gray-200 py-4 px-6 flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-600">
          🚁 Live Delivery Tracking
        </h1>
        <div className="flex flex-wrap gap-6 text-gray-800 text-sm md:text-base">
          <span>
            <strong>Order:</strong> {status.orderId}
          </span>
          <span>
            <strong>Status:</strong>{" "}
            <span
              className={`${
                telemetry?.status === "Delivered"
                  ? "text-green-600"
                  : telemetry?.status === "In Transit"
                  ? "text-amber-600"
                  : "text-gray-600"
              } font-semibold`}
            >
              {telemetry?.status || "Fetching..."}
            </span>
          </span>
          <span>
            <strong>ETA:</strong> {status.eta}
          </span>
          <span>
            <strong>Drone ID:</strong> {status.droneId}
          </span>
        </div>
      </header>

      {/* ✅ Main Section */}
      <div className="flex flex-col md:flex-row w-full h-full flex-1 p-4 md:p-6 gap-6">
        {/* ✅ Map */}
        <div className="flex-1 relative rounded-2xl overflow-hidden shadow-xl border border-gray-300">
          {telemetry ? (
            <MapContainer
              center={[telemetry.latitude, telemetry.longitude]}
              zoom={15}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?lang=en"
              />

              {/* Drone Marker */}
              <Marker
                position={[telemetry.latitude, telemetry.longitude]}
                icon={droneIcon}
              >
                <Popup>
                  🚁 <strong>Drone Location</strong>
                  <br />
                  Lat: {telemetry.latitude.toFixed(4)} <br />
                  Lng: {telemetry.longitude.toFixed(4)} <br />
                  Battery: {telemetry.battery}%
                </Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker position={status.destination} icon={destinationIcon}>
                <Popup>📦 Delivery Destination</Popup>
              </Marker>

              {/* Recenter Button */}
              <RecenterButton position={[telemetry.latitude, telemetry.longitude]} />
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-600 text-lg font-medium">
              Fetching drone telemetry...
            </div>
          )}
        </div>

        {/* ✅ Info Panel */}
        <div className="w-full md:w-80 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-bold text-amber-600 mb-2">📊 Live Status</h2>
          <div className="text-gray-800 space-y-3">
            <p>
              <strong>Battery:</strong>{" "}
              <span
                className={`${
                  telemetry?.battery && telemetry.battery > 60
                    ? "text-green-600"
                    : telemetry?.battery && telemetry.battery > 30
                    ? "text-amber-600"
                    : "text-red-600"
                } font-semibold`}
              >
                {telemetry?.battery ?? "--"}%
              </span>
            </p>
            <p>
              <strong>Speed:</strong>{" "}
              <span className="text-gray-700">
                {telemetry?.speed ? `${telemetry.speed} km/h` : "--"}
              </span>
            </p>
            <p>
              <strong>Last Update:</strong>{" "}
              <span className="text-gray-600">Just now</span>
            </p>
          </div>

          {/* ✅ Progress Bar */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delivery Progress
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Picked Up</span>
              <span>In Transit</span>
              <span>Delivered</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-3 bg-amber-500 transition-all duration-700 ${
                  telemetry?.status === "Picked Up"
                    ? "w-1/3"
                    : telemetry?.status === "In Transit"
                    ? "w-2/3"
                    : telemetry?.status === "Delivered"
                    ? "w-full"
                    : "w-0"
                }`}
              ></div>
            </div>
          </div>

          {/* ✅ Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-md transition"
          >
            🔄 Refresh Tracking
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
