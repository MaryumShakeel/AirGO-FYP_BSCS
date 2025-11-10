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
  estimatedFee: string;
};

const CardPayment: React.FC<{
  amount: number;
  onSuccess: (receipt: any) => void;
}> = ({ amount, onSuccess }) => {
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState(""); 
  const [cvc, setCvc] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [agree, setAgree] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = () => {
    // ✅ Payment validation
    if (cardNumber.length !== 16) return setError("Card number must be 16 digits.");
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return setError("Expiry must be in MM/YY format.");
    if (parseInt(expiry.split("/")[0]) < 1 || parseInt(expiry.split("/")[0]) > 12)
      return setError("Expiry month must be between 01 and 12.");
    if (cvc.length !== 3) return setError("CVC must be 3 digits.");
    if (!agree) {
      setError("You must agree to our Terms & Policies before paying.");
      return;
    }

    setError(null);
    setIsPaying(true);

    const receipt = {
      receiptId: `demo_${Date.now()}`,
      amount,
      paidOn: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsPaying(false);
      onSuccess(receipt);
    }, 500);
  };

  return (
    <div className="p-4 border rounded-md shadow-md bg-white mt-4">
      <h3 className="font-bold mb-3 text-gray-800">Payment</h3>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <input
          type="text"
          placeholder="Billing Full Name"
          value={billingName}
          onChange={(e) => setBillingName(e.target.value)}
          className="p-2 border rounded-md"
        />
        <input
          type="email"
          placeholder="Email"
          value={billingEmail}
          onChange={(e) => setBillingEmail(e.target.value)}
          className="p-2 border rounded-md"
        />
      </div>

      <div className="mt-3">
        <input
          type="text"
          placeholder="Card number"
          value={cardNumber}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, ""); // only digits
            if (val.length <= 16) setCardNumber(val);
          }}
          className="p-2 border rounded-md w-full"
        />
        <div className="flex gap-3 mt-3">
          <input
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => {
              let val = e.target.value.replace(/[^\d/]/g, "");
              if (val.length > 5) val = val.slice(0, 5);
              setExpiry(val);
            }}
            className="p-2 border rounded-md w-1/3"
          />
          <input
            type="text"
            placeholder="CVC"
            value={cvc}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 3) setCvc(val);
            }}
            className="p-2 border rounded-md w-1/3"
          />
          <input
            type="text"
            placeholder="Postal / ZIP"
            className="p-2 border rounded-md w-1/3"
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
            <span>Save card for faster checkout</span>
          </label>
          <span>Secure encrypted payment</span>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <input id="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
        <label htmlFor="agree" className="text-sm">
          I agree to the{" "}
          <a href="/terms" className="text-amber-600 underline">Terms & Conditions</a> and{" "}
          <a href="/privacy-policy" className="text-amber-600 underline">Privacy Policy</a>.
        </label>
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

      <div className="mt-4">
        <button
          onClick={handlePay}
          disabled={isPaying}
          className="px-6 py-2 bg-amber-600 text-white rounded-full font-semibold shadow hover:bg-amber-700 disabled:opacity-60"
        >
          {isPaying ? "Processing..." : `Pay Now (₨ ${amount.toLocaleString()})`}
        </button>

        <p className="text-xs text-gray-500 mt-2">
          By paying you agree to our Terms. Payments are processed securely.
        </p>
      </div>
    </div>
  );
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
    estimatedFee: "",
  });

  const [distance, setDistance] = useState<number | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState<{ type: string; text: string } | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);

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
        () => setToast("info", "Using default location.")
      );
    }
  }, []);

  const setToast = (type: string, text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

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
          estimatedFee: `${totalCost}`,
        }));
      }
    }
  }, [form.pickupCoords, form.dropoffCoords]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };




  const handleDropoffInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setForm((p) => ({ ...p, dropoffAddress: value }));

  if (value.length > 2) {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`
      );
      setDropoffSuggestions(response.data.slice(0, 5)); // top 5 suggestions
    } catch (err) {
      console.error(err);
      setDropoffSuggestions([]);
    }
  } else {
    setDropoffSuggestions([]);
  }
};






  const submitOrder = async (receipt: any) => {
    try {
      console.log("Order submitted:", { ...form, receipt });
      setToast("info", "Drone hire confirmed!");

      navigate("/order-confirmed", {
        state: {
          receipt,
          form,
          pickupCoords: form.pickupCoords,
          dropoffCoords: form.dropoffCoords,
        },
      });
    } catch (err) {
      setToast("error", "Failed to confirm order. Please try again.");
    }
  };

  const handlePaymentSuccess = (receipt: any) => {
    setReceipt(receipt);
    setIsPaid(true);
    setToast("info", "Payment successful!");
  };

  const LocationMarker: React.FC<{
    position: [number, number];
    setCoords: (coords: [number, number]) => void;
  }> = ({ position, setCoords }) => {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        setCoords([e.latlng.lat, e.latlng.lng]);
      },
    });
    return <Marker position={position} icon={markerIcon}></Marker>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 text-gray-900 flex flex-col relative">
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

      <main className="flex-grow p-10">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-amber-100">
          <h1 className="text-3xl font-bold text-center text-amber-700 mb-8">
            Hire a Drone for Delivery
          </h1>

          <form className="space-y-8">
            {/* Pickup Location */}
            <section>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Pickup Location</h2>
              <input
                type="text"
                name="pickupAddress"
                value={form.pickupAddress}
                onChange={handleChange}
                placeholder="Search or click on map"
                className="w-full p-2 border rounded-md mb-2"
              />
              <MapContainer
                center={form.pickupCoords}
                zoom={13}
                style={{ height: "200px", borderRadius: "8px" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                  position={form.pickupCoords}
                  setCoords={(coords) =>
                    setForm((p) => ({ ...p, pickupCoords: coords }))
                  }
                />
              </MapContainer>
            </section>

            {/* Drop-off Location */}
            <section className="relative">
  <h2 className="text-xl font-semibold mb-2 text-gray-800">Drop-off Location</h2>
  
  <input
    type="text"
    name="dropoffAddress"
    value={form.dropoffAddress}
    onChange={handleDropoffInputChange}
    placeholder="Search or click on map"
    className="w-full p-2 border rounded-md mb-2"
    autoComplete="off"
  />

  {/* Suggestions Dropdown */}
  {dropoffSuggestions.length > 0 && (
    <ul className="absolute z-50 bg-white border rounded-md shadow-md w-full max-h-48 overflow-y-auto">
      {dropoffSuggestions.map((s, idx) => (
        <li
          key={idx}
          className="p-2 hover:bg-amber-100 cursor-pointer"
          onClick={() => {
            const coords: [number, number] = [parseFloat(s.lat), parseFloat(s.lon)];
            setForm((p) => ({
              ...p,
              dropoffAddress: s.display_name,
              dropoffCoords: coords,
            }));
            setDropoffSuggestions([]);
          }}
        >
          {s.display_name}
        </li>
      ))}
    </ul>
  )}

  <MapContainer
    center={form.dropoffCoords}
    zoom={13}
    style={{ height: "200px", borderRadius: "8px" }}
  >
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <LocationMarker
      position={form.dropoffCoords}
      setCoords={(coords) =>
        setForm((p) => ({ ...p, dropoffCoords: coords }))
      }
    />
  </MapContainer>
</section>





            {/* Distance / Fare */}
            {distance && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-amber-50 p-4 rounded-md border border-amber-200">
                <p className="text-gray-700 font-medium">
                  Approx. Distance:{" "}
                  <span className="text-amber-700 font-semibold">{distance.toFixed(1)} km</span>
                </p>
                <p className="text-gray-700 font-medium">
                  Charges / Fare:{" "}
                  <span className="text-amber-700 font-semibold">₨ {Number(form.estimatedFee).toLocaleString()}</span>
                </p>
              </section>
            )}

            {/* Item Details */}
            <section>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Item Details</h2>
              <input
                type="text"
                name="itemName"
                value={form.itemName}
                onChange={handleChange}
                placeholder="Item name"
                required
                className="p-2 border rounded-md w-full mb-3"
              />
              <input
                type="number"
                name="itemWeight"
                value={form.itemWeight}
                onChange={(e) => {
                  let value = e.target.value;
                  if (!/^\d{0,1}(\.\d{0,1})?$/.test(value)) return;
                  const numValue = parseFloat(value);
                  if (numValue < 0 || numValue > 2) return;
                  setForm((p) => ({ ...p, itemWeight: value }));
                }}
                placeholder="Weight (0 – 2 kg)"
                required
                step="0.1"
                min="0"
                max="5"
                className="p-2 border rounded-md w-full"
              />
              <textarea
                name="specialInstructions"
                value={form.specialInstructions}
                onChange={handleChange}
                placeholder="Special instructions for pilot"
                rows={3}
                className="w-full mt-4 p-2 border rounded-md"
              />
            </section>

            {form.estimatedFee && !isPaid && (
              <CardPayment amount={Number(form.estimatedFee)} onSuccess={handlePaymentSuccess} />
            )}

            {isPaid && receipt && (
              <div className="p-4 border rounded-md text-green-700 bg-green-50 mt-4">
                <h2 className="font-semibold">✅ Payment Successful</h2>
                <p>Receipt ID: {receipt.receiptId}</p>
                <p>Amount Paid: ₨ {receipt.amount}</p>
                <p>Date: {new Date(receipt.paidOn).toLocaleString()}</p>

                <button
                  onClick={() => submitOrder(receipt)}
                  className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-full font-semibold shadow hover:bg-amber-700"
                >
                  Confirm Hire Drone
                </button>
              </div>
            )}
          </form>
        </div>
      </main>

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

      <footer className="bg-amber-700 text-white py-6 text-center">
        <p className="text-sm mb-2">
          <a href="/privacy-policy" className="hover:underline mx-2">Privacy Policy</a> |
          <a href="/refund-policy" className="hover:underline mx-2">Return & Refund Policy</a> |
          <a href="/service-policy">Service Policy</a> |
          <a href="/terms" className="hover:underline mx-2">Terms & Conditions</a>
        </p>
        <p className="text-xs text-amber-200">
          © {new Date().getFullYear()} AirGO | Drone Delivery System
        </p>
      </footer>
    </div>
  );
};

export default DroneHiring;
