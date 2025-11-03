// src/pages/DroneHiring.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LeafletMouseEvent } from "leaflet";

const markerIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const defaultCoords: [number, number] = [33.613954, 73.199972]; 

type FormState = {
  pickupAddress: string;
  dropoffAddress: string;
  pickupCoords: [number, number];
  dropoffCoords: [number, number];
  itemName: string;
  itemWeight: string;
  specialInstructions: string;
  paymentMethod: string;
  estimatedFee: string;
};

const DroneHiring: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    pickupAddress: "",
    dropoffAddress: "",
    pickupCoords: defaultCoords,
    dropoffCoords: defaultCoords,
    itemName: "",
    itemWeight: "",
    specialInstructions: "",
    paymentMethod: "Cash",
    estimatedFee: "",
  });

  const [distance, setDistance] = useState<number | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
  const [droneData, setDroneData] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState<{ type: string; text: string } | null>(null);

  // 🛰️ Fetch DJI Telemetry
  /*useEffect(() => {
    axios
      .get("http://localhost:5000/api/dji/telemetry")
      .then((res) => setDroneData(res.data))
      .catch(() => setToast("error", "Failed to fetch drone telemetry"));
  }, []);*/

  // 🧭 Detect current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setForm((prev) => ({
            ...prev,
            pickupCoords: coords,
            dropoffCoords: coords,
            pickupAddress: `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
          }));
          setToast("info", "Current location detected.");
        },
        () => setToast("info", "Using default location (Karachi).")
      );
    }
  }, []);

  // Toast function
  const setToast = (type: string, text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Haversine formula
  const calculateDistance = (coord1: [number, number], coord2: [number, number]) => {
    const R = 6371;
    const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
    const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;
    const lat1 = (coord1[0] * Math.PI) / 180;
    const lat2 = (coord2[0] * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate delivery fee automatically
  useEffect(() => {
    const { pickupCoords, dropoffCoords } = form;
    if (pickupCoords && dropoffCoords) {
      const dist = calculateDistance(pickupCoords, dropoffCoords);
      if (dist > 0.05) {
        setDistance(dist);
        const baseRate = 200;
        const perKmRate = 50;
        const totalCost = Math.round(baseRate + dist * perKmRate);
        setForm((p) => ({
          ...p,
          estimatedFee: `₨ ${totalCost.toLocaleString()}`,
        }));
      }
    }
  }, [form.pickupCoords, form.dropoffCoords]);

  // Input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (name === "pickupAddress") fetchSuggestions(value, "pickup");
    if (name === "dropoffAddress") fetchSuggestions(value, "dropoff");
  };

  // Fetch address suggestions
  const fetchSuggestions = async (query: string, type: "pickup" | "dropoff") => {
    if (!query || query.length < 3) {
      if (type === "pickup") setPickupSuggestions([]);
      else setDropoffSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      if (type === "pickup") setPickupSuggestions(res.data.slice(0, 5));
      else setDropoffSuggestions(res.data.slice(0, 5));
    } catch {
      setToast("error", "Failed to load location suggestions");
    }
  };

  // Select suggestion
  const handleSelectSuggestion = (suggestion: any, type: "pickup" | "dropoff") => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    if (type === "pickup") {
      setForm((p) => ({
        ...p,
        pickupAddress: suggestion.display_name,
        pickupCoords: [lat, lon],
      }));
      setPickupSuggestions([]);
      setToast("info", "Pickup location selected.");
    } else {
      setForm((p) => ({
        ...p,
        dropoffAddress: suggestion.display_name,
        dropoffCoords: [lat, lon],
      }));
      setDropoffSuggestions([]);
      setToast("info", "Drop-off location selected.");
    }
  };

  // Map handlers
  const PickupMapHandler: React.FC = () => {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
        setForm((p) => ({
          ...p,
          pickupCoords: coords,
          pickupAddress: `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
        }));
        setToast("info", "Pickup set on map.");
      },
    });
    return null;
  };

  const DropoffMapHandler: React.FC = () => {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
        setForm((p) => ({
          ...p,
          dropoffCoords: coords,
          dropoffAddress: `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
        }));
        setToast("info", "Drop-off set on map.");
      },
    });
    return null;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pickupAddress.trim() || !form.dropoffAddress.trim())
      return setToast("error", "Please set both pickup and drop-off locations.");

    try {
      const payload = {
        pickupLocation: form.pickupAddress,
        dropoffLocation: form.dropoffAddress,
        pickupCoords: form.pickupCoords,
        dropoffCoords: form.dropoffCoords,
        itemName: form.itemName,
        itemWeight: parseFloat(form.itemWeight),
        specialInstructions: form.specialInstructions,
        paymentMethod: form.paymentMethod,
        estimatedFee: form.estimatedFee,
      };

      const orderRes = await axios.post("http://localhost:5000/api/droneOrders", payload);
      const order = orderRes.data.order;
      setToast("info", "Drone hired successfully!");
      navigate("/order-confirmed", { state: { order } });
    } catch {
      setToast("error", "Failed to confirm drone hire. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 text-gray-900 flex flex-col relative">
      {/* Header */}
      <header className="flex justify-between items-center bg-white shadow-md py-4 px-8 rounded-b-2xl">
        <h1
          className="text-2xl font-bold text-amber-700 cursor-pointer"
          onClick={() => navigate("/")}
        >
          AIRGO
        </h1>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full shadow transition"
        >
          Back to Dashboard
        </button>
      </header>

      {/* Live Drone Telemetry 
      {droneData && (
        <div className="mx-auto mt-6 w-11/12 max-w-4xl text-center bg-white border border-green-200 p-4 rounded-md shadow-sm">
          <h3 className="font-semibold text-green-700 mb-2">🛰 Live Drone Telemetry</h3>
          <pre className="text-sm text-left overflow-x-auto text-gray-700">
            {JSON.stringify(droneData, null, 2)}
          </pre>
        </div>
      )}
        */}

      {/* Main Form */}
      <main className="flex-grow p-10">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-amber-100">
          <h1 className="text-3xl font-bold text-center text-amber-700 mb-8">
            Hire a Drone for Delivery
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Pickup */}
            <section>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Pickup Location</h2>
              <input
                type="text"
                name="pickupAddress"
                value={form.pickupAddress}
                onChange={handleChange}
                placeholder="Search or click on map"
                className="w-full p-2 border rounded-md"
              />
              {pickupSuggestions.length > 0 && (
                <ul className="border rounded-md mt-1 max-h-40 overflow-y-auto bg-white">
                  {pickupSuggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelectSuggestion(s, "pickup")}
                      className="p-2 hover:bg-amber-100 cursor-pointer"
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 h-64 border rounded-lg overflow-hidden">
                <MapContainer center={form.pickupCoords[0] ? form.pickupCoords : [20, 0]} zoom={13} style={{ height: "100%" }}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'     
                  />

                  <Marker position={form.pickupCoords} icon={markerIcon} />
                  <PickupMapHandler />
                </MapContainer>
              </div>
            </section>

            {/* Dropoff */}
            <section>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Drop-off Location</h2>
              <input
                type="text"
                name="dropoffAddress"
                value={form.dropoffAddress}
                onChange={handleChange}
                placeholder="Search or click on map"
                className="w-full p-2 border rounded-md"
              />
              {dropoffSuggestions.length > 0 && (
                <ul className="border rounded-md mt-1 max-h-40 overflow-y-auto bg-white">
                  {dropoffSuggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelectSuggestion(s, "dropoff")}
                      className="p-2 hover:bg-amber-100 cursor-pointer"
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 h-64 border rounded-lg overflow-hidden">
                <MapContainer center={form.pickupCoords[0] ? form.pickupCoords : [20, 0]} zoom={13} style={{ height: "100%" }}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'     
                  />
                  <Marker position={form.dropoffCoords} icon={markerIcon} />
                  <DropoffMapHandler />
                </MapContainer>
              </div>
            </section>

            {/* Item details */}
            <section>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Item Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="itemName"
                  value={form.itemName}
                  onChange={handleChange}
                  placeholder="Item name"
                  required
                  className="p-2 border rounded-md"
                />
                <input
                  type="number"
                  name="itemWeight"
                  value={form.itemWeight}
                  onChange={handleChange}
                  placeholder="Weight (kg)"
                  required
                  step="0.1"
                  className="p-2 border rounded-md"
                />
              </div>
              <textarea
                name="specialInstructions"
                value={form.specialInstructions}
                onChange={handleChange}
                placeholder="Special instructions for pilot"
                rows={3}
                className="w-full mt-4 p-2 border rounded-md"
              />
            </section>

            {/* Payment */}
            <section>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Payment</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="p-2 border rounded-md"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
                <input
                  type="text"
                  name="estimatedFee"
                  value={form.estimatedFee}
                  readOnly
                  className="p-2 border rounded-md bg-gray-100"
                />
              </div>
              {distance && (
                <div className="mt-2 text-sm text-gray-600">
                  Approx. Distance: {distance.toFixed(2)} km
                </div>
              )}
            </section>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-full shadow-md transition-all"
              >
                Confirm Drone Hire
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Toast Message */}
      {toastMsg && (
        <div
          className={`fixed bottom-5 left-5 px-4 py-2 rounded-md shadow-md text-white animate-fade-in-out ${
            toastMsg.type === "error"
              ? "bg-red-500"
              : toastMsg.type === "info"
              ? "bg-amber-500"
              : "bg-green-500"
          }`}
        >
          {toastMsg.text}
        </div>
      )}

      <footer className="bg-amber-700 text-white py-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} AirGO | Drone Delivery System
        </p>
      </footer>
    </div>
  );
};

export default DroneHiring;
