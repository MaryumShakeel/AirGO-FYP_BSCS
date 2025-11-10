import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import {
  RocketLaunchIcon,
  MapPinIcon,
  BoltIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid"; // ✅ Tailwind Heroicons

// Interface for Telemetry Data
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
      className="absolute bottom-6 right-6 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition"
    >
      <ArrowPathIcon className="h-5 w-5" />
      Recenter
    </button>
  );
};

const LiveTracking: React.FC = () => {
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [status, setStatus] = useState<DroneStatus>({
    orderId: "ORD-5471",
    eta: "2 mins",
    droneId: "DRN-108",
    destination: [33.64255, 73.07912],
  });

  const [path, setPath] = useState<[number, number][]>([]);
  const [progress, setProgress] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ✅ Custom Icons for Map
  const droneIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
    iconSize: [45, 45],
  });
  const destinationIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [40, 40],
  });

  // ✅ Drone Simulation Path
  useEffect(() => {
    const stored = localStorage.getItem("droneBooking");
    let pickup = [33.64216, 73.07989];
    let dropoff = [33.64315, 73.08067];
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.pickup && data.dropoff) {
          pickup = [data.pickup.lat, data.pickup.lng];
          dropoff = [data.dropoff.lat, data.dropoff.lng];
        }
      } catch (err) {
        console.error("Error reading localStorage:", err);
      }
    }

    setStatus((prev) => ({
      ...prev,
      destination: [dropoff[0], dropoff[1]],
    }));

    // Create smooth simulated path
    const numPoints = 80;
    const latStep = (dropoff[0] - pickup[0]) / numPoints;
    const lngStep = (dropoff[1] - pickup[1]) / numPoints;
    const newPath: [number, number][] = [];
    for (let i = 0; i <= numPoints; i++) {
      newPath.push([pickup[0] + i * latStep, pickup[1] + i * lngStep]);
    }
    setPath(newPath);

    // Start moving
    let index = 0;
    const interval = setInterval(() => {
      if (index < newPath.length) {
        const pos = newPath[index];
        const newTelemetry: TelemetryData = {
          latitude: pos[0],
          longitude: pos[1],
          battery: Math.max(15, 100 - index),
          speed: 60,
          status: index < newPath.length - 2 ? "In Transit" : "Delivered",
        };
        setTelemetry(newTelemetry);
        setProgress(index / newPath.length);
        index++;
      } else {
        clearInterval(interval);
        setTelemetry((t) => t && { ...t, status: "Delivered", speed: 0 });
        setToastMsg("✅ Delivery Completed Successfully!");
        setTimeout(() => {
          setToastMsg(null);
          navigate("/delivery-completed");
        }, 2000);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [navigate]);

  if (!telemetry)
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-600">
        Initializing Drone Simulation...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 text-gray-900">
      {/* ✅ Header */}
      <header className="w-full bg-white shadow-md border-b border-gray-200 py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-600 flex items-center gap-2">
          <RocketLaunchIcon className="h-7 w-7 text-amber-600" />
          Live Delivery Tracking
        </h1>
      </header>

      {/* ✅ Main Section */}
      <div className="flex flex-col md:flex-row w-full h-full flex-1 p-4 md:p-6 gap-6">
        {/* 🗺️ Map */}
        <div className="flex-1 relative rounded-2xl overflow-hidden shadow-xl border border-gray-300">
          <MapContainer
            center={[telemetry.latitude, telemetry.longitude]}
            zoom={16}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Route Path */}
            <Polyline positions={path} color="orange" weight={4} opacity={0.8} />

            {/* Drone Marker */}
            <Marker
              position={[telemetry.latitude, telemetry.longitude]}
              icon={droneIcon}
            >
              <Popup>
                <TruckIcon className="h-5 w-5 inline text-amber-600" />{" "}
                <strong>Drone</strong>
                <br />
                Lat: {telemetry.latitude.toFixed(5)} <br />
                Lng: {telemetry.longitude.toFixed(5)} <br />
                Battery: {telemetry.battery}%
              </Popup>
            </Marker>

            {/* Destination Marker */}
            <Marker position={status.destination} icon={destinationIcon}>
              <Popup>
                <MapPinIcon className="h-5 w-5 inline text-amber-600" /> Delivery
                Destination
              </Popup>
            </Marker>

            <RecenterButton position={[telemetry.latitude, telemetry.longitude]} />
          </MapContainer>
        </div>

        {/* 📊 Info Panel */}
        <div className="w-full md:w-80 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-bold text-amber-600 mb-2 flex items-center gap-2">
            <BoltIcon className="h-6 w-6 text-amber-600" />
            Live Status
          </h2>

          <div className="text-gray-800 space-y-3">
            <p className="flex items-center gap-2">
              <BoltIcon className="h-5 w-5 text-gray-700" />
              <strong>Battery:</strong>{" "}
              <span
                className={`${
                  telemetry?.battery > 60
                    ? "text-green-600"
                    : telemetry?.battery > 30
                    ? "text-amber-600"
                    : "text-red-600"
                } font-semibold`}
              >
                {telemetry?.battery ?? "--"}%
              </span>
            </p>

            <p className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-gray-700" />
              <strong>Speed:</strong>{" "}
              <span className="text-gray-700">
                {telemetry?.speed ? `${telemetry.speed} km/h` : "--"}
              </span>
            </p>

            <p className="flex items-center gap-2">
              <TruckIcon className="h-5 w-5 text-gray-700" />
              <strong>Status:</strong>{" "}
              <span className="text-gray-700">{telemetry?.status}</span>
            </p>
          </div>

          {/* 📦 Progress Bar */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delivery Progress
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Start</span>
              <span>Transit</span>
              <span>Delivered</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-3 bg-amber-500 transition-all duration-700"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg font-semibold animate-bounce z-50 flex items-center gap-2">
          <CheckCircleIcon className="h-6 w-6 text-white" />
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default LiveTracking;
