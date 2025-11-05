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
  // Payment UI state
  const [method, setMethod] = useState<"card" | "jazzcash" | "easypaisa" | "bank">("card");
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState(""); // MM/YY
  const [cvc, setCvc] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [agree, setAgree] = useState(false);

  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helpers
  const onlyDigits = (s: string) => s.replace(/\D/g, "");
  const formatCardNumber = (s: string) => {
    const d = onlyDigits(s).slice(0, 16);
    return d.replace(/(.{4})/g, "$1 ").trim();
  };
  const formatExpiry = (s: string) => {
    const d = onlyDigits(s).slice(0, 4);
    if (d.length >= 3) return `${d.slice(0, 2)}/${d.slice(2)}`;
    if (d.length >= 1 && d.length <= 2) return d;
    return d;
  };

  // Luhn algorithm for card validation
  const luhnValid = (num: string) => {
    const digits = onlyDigits(num);
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits.charAt(i), 10);
      if (shouldDouble) {
        d = d * 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      shouldDouble = !shouldDouble;
    }
    return digits.length >= 13 && sum % 10 === 0;
  };

  const isExpiryValid = (v: string) => {
    if (!/^\d{2}\/\d{2}$/.test(v)) return false;
    const [mm, yy] = v.split("/").map((x) => parseInt(x, 10));
    if (mm < 1 || mm > 12) return false;
    const now = new Date();
    const fullYear = 2000 + yy;
    const expiryDate = new Date(fullYear, mm - 1, 1);
    // expire at end of month
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    return expiryDate > now;
  };

  const isCvcValid = (c: string) => /^\d{3,4}$/.test(c);

  // Validation per method
  const validate = () => {
    setError(null);
    if (!billingName || !billingEmail) {
      setError("Please enter billing name and email.");
      return false;
    }
    if (method === "card") {
      if (!luhnValid(cardNumber)) {
        setError("Invalid card number.");
        return false;
      }
      if (!isExpiryValid(expiry)) {
        setError("Invalid expiry date.");
        return false;
      }
      if (!isCvcValid(cvc)) {
        setError("Invalid CVC.");
        return false;
      }
    } else {
      // Wallet / bank methods need phone
      if (!billingPhone || billingPhone.length < 10) {
        setError("Please enter a valid phone number for wallet/bank payments.");
        return false;
      }
    }
    if (!agree) {
      setError("You must agree to our Terms & Policies before paying.");
      return false;
    }
    return true;
  };

  // Simulated payment action.
  // In real integration you'd redirect to PayFast or call your backend which calls PayFast.
  const handlePay = async () => {
    setError(null);
    if (!validate()) return;

    setIsPaying(true);
    try {
      // Build payload according to method
      let payload: any = {
        userId: localStorage.getItem("userId"),
        amount,
        method,
        billingName,
        billingEmail,
      };

      if (method === "card") {
        payload.cardDetails = {
          number: onlyDigits(cardNumber),
          expiry,
          cvc,
          saveCard,
        };
      } else {
        payload.wallet = {
          provider: method === "jazzcash" ? "JazzCash" : method === "easypaisa" ? "Easypaisa" : "BankTransfer",
          phone: billingPhone,
        };
      }

      // NOTE: This endpoint is your backend mock that will be replaced with true PayFast flow later.
      const res = await axios.post("http://localhost:5000/api/payments/create", payload, {
        timeout: 20000,
      });

      // Expecting { receipt: {...} } or { checkoutUrl: '...' } from backend
      // If backend returns checkoutUrl, redirect user there (real flow). Otherwise consider payment immediate.
      if (res.data.checkoutUrl) {
        // In a real flow redirect to payment provider
        window.location.href = res.data.checkoutUrl;
        return;
      }

      const receipt = res.data.receipt ?? {
        receiptId: res.data.receiptId ?? `demo_${Date.now()}`,
        amount,
        paidOn: new Date().toISOString(),
      };

      // Call parent success handler
      onSuccess(receipt);
    } catch (err: any) {
      console.error(err);
      setError("Payment failed. Please try again or contact support.");
    } finally {
      setIsPaying(false);
    }
  };

  // UI small helpers
  const providerLogos = (
    <div className="flex items-center gap-3 mt-2">
      <img src="https://img.icons8.com/color/48/000000/visa.png" alt="visa" className="h-6" />
      <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="mc" className="h-6" />
      <img src="https://img.icons8.com/color/48/000000/jazzcash.png" alt="jazz" className="h-6" />
      <img src="https://img.icons8.com/color/48/000000/easypaisa.png" alt="easypaisa" className="h-6" />
    </div>
  );

  return (
    <div className="p-4 border rounded-md shadow-md bg-white mt-4">
      <h3 className="font-bold mb-3 text-gray-800">Payment</h3>

      {/* Payment method selection */}
      <div className="flex gap-3 flex-wrap mb-4">
        <label className={`px-3 py-2 rounded-md cursor-pointer border ${method === "card" ? "bg-amber-100 border-amber-300" : "bg-white"}`}>
          <input
            type="radio"
            name="method"
            checked={method === "card"}
            onChange={() => setMethod("card")}
            className="mr-2"
          />
          Card
        </label>

        <label className={`px-3 py-2 rounded-md cursor-pointer border ${method === "jazzcash" ? "bg-amber-100 border-amber-300" : "bg-white"}`}>
          <input type="radio" name="method" checked={method === "jazzcash"} onChange={() => setMethod("jazzcash")} className="mr-2" />
          JazzCash
        </label>

        <label className={`px-3 py-2 rounded-md cursor-pointer border ${method === "easypaisa" ? "bg-amber-100 border-amber-300" : "bg-white"}`}>
          <input type="radio" name="method" checked={method === "easypaisa"} onChange={() => setMethod("easypaisa")} className="mr-2" />
          Easypaisa
        </label>

        <label className={`px-3 py-2 rounded-md cursor-pointer border ${method === "bank" ? "bg-amber-100 border-amber-300" : "bg-white"}`}>
          <input type="radio" name="method" checked={method === "bank"} onChange={() => setMethod("bank")} className="mr-2" />
          Bank Transfer
        </label>
      </div>

      {/* Provider logos */}
      {providerLogos}

      {/* Billing fields */}
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

      {/* phone for wallet/bank */}
      {(method === "jazzcash" || method === "easypaisa" || method === "bank") && (
        <div className="mt-3">
          <input
            type="tel"
            placeholder="Phone (for wallet / bank confirmation)"
            value={billingPhone}
            onChange={(e) => setBillingPhone(e.target.value)}
            className="p-2 border rounded-md w-full"
          />
          <p className="text-xs text-gray-500 mt-1">You will receive OTP / confirmation on this number.</p>
        </div>
      )}

      {/* Card inputs */}
      {method === "card" && (
        <>
          <div className="mt-3">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Card number"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="p-2 border rounded-md w-full"
              maxLength={19}
            />
            <div className="flex gap-3 mt-3">
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                className="p-2 border rounded-md w-1/3"
                maxLength={5}
              />
              <input
                type="text"
                placeholder="CVC"
                value={cvc}
                onChange={(e) => setCvc(onlyDigits(e.target.value).slice(0, 4))}
                className="p-2 border rounded-md w-1/3"
                maxLength={4}
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
        </>
      )}

      {/* Terms checkbox */}
      <div className="mt-4 flex items-start gap-3">
        <input id="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
        <label htmlFor="agree" className="text-sm">
          I agree to the{" "}
          <a href="/terms" className="text-amber-600 underline">Terms & Conditions</a> and{" "}
          <a href="/privacy-policy" className="text-amber-600 underline">Privacy Policy</a>.
        </label>
      </div>

      {/* Error */}
      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

      {/* Pay button */}
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

  // Detect current location
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

  // Haversine distance calculation
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

  // Fee + distance updates
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

  // Suggestions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (name === "pickupAddress") fetchSuggestions(value, "pickup");
    if (name === "dropoffAddress") fetchSuggestions(value, "dropoff");
  };

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

  const handleSelectSuggestion = (s: any, type: "pickup" | "dropoff") => {
    const lat = parseFloat(s.lat);
    const lon = parseFloat(s.lon);
    if (type === "pickup") {
      setForm((p) => ({ ...p, pickupAddress: s.display_name, pickupCoords: [lat, lon] }));
      setPickupSuggestions([]);
    } else {
      setForm((p) => ({ ...p, dropoffAddress: s.display_name, dropoffCoords: [lat, lon] }));
      setDropoffSuggestions([]);
    }
  };

  // Map click handlers
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

  // Submit order (after payment success)
  const submitOrder = async (receipt: any) => {
    try {
      const payload = {
        pickupLocation: form.pickupAddress,
        dropoffLocation: form.dropoffAddress,
        pickupCoords: form.pickupCoords,
        dropoffCoords: form.dropoffCoords,
        itemName: form.itemName,
        itemWeight: parseFloat(form.itemWeight),
        specialInstructions: form.specialInstructions,
        paymentMethod: "Card",
        estimatedFee: form.estimatedFee,
        receipt,
      };
      const res = await axios.post("http://localhost:5000/api/droneOrders", payload);
      navigate("/order-confirmed", { state: { order: res.data.order } });
    } catch {
      setToast("error", "Failed to confirm drone hire.");
    }
  };

  const handlePaymentSuccess = (receipt: any) => {
    setReceipt(receipt);
    setIsPaid(true);
    setToast("info", "Payment successful! Confirming drone hire...");
    submitOrder(receipt);
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

          {/* Full Form */}
          <form className="space-y-8">
            {/* Pickup Section */}
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
                <MapContainer center={form.pickupCoords} zoom={13} style={{ height: "100%" }}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  <Marker position={form.pickupCoords} icon={markerIcon} />
                  <PickupMapHandler />
                </MapContainer>
              </div>
            </section>

            {/* Dropoff Section */}
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
                <MapContainer center={form.dropoffCoords} zoom={13} style={{ height: "100%" }}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  <Marker position={form.dropoffCoords} icon={markerIcon} />
                  <DropoffMapHandler />
                </MapContainer>
              </div>
            </section>

            {/* Distance + Fare */}
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
                  onChange={(e) => {
                    let value = e.target.value;
                    if (!/^\d{0,1}(\.\d{0,1})?$/.test(value)) return;
                    const numValue = parseFloat(value);
                    if (numValue < 0 || numValue > 5) return;
                    setForm((p) => ({ ...p, itemWeight: value }));
                  }}
                  placeholder="Weight (0 – 5 kg)"
                  required
                  step="0.1"
                  min="0"
                  max="5"
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
            {form.estimatedFee && !isPaid && (
              <CardPayment amount={Number(form.estimatedFee)} onSuccess={handlePaymentSuccess} />
            )}

            {/* Receipt */}
            {isPaid && receipt && (
              <div className="p-4 border rounded-md text-green-700 bg-green-50 mt-4">
                <h2 className="font-semibold">✅ Payment Successful</h2>
                <p>Receipt ID: {receipt.receiptId}</p>
                <p>Amount Paid: ₨ {receipt.amount}</p>
                <p>Date: {new Date(receipt.paidOn).toLocaleString()}</p>
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
