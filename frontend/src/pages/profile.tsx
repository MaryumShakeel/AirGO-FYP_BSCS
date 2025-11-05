import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editAddressId, setEditAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({ label: "", address: "" });

  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ✅ Fetch user profile + addresses
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          navigate("/login");
          return;
        }

        const [profileRes, addressRes] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/auth/addresses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(profileRes.data);
        setAddresses(addressRes.data || []);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("Failed to load profile");
      }
    };
    fetchData();
  }, [navigate]);

  // ✅ Add or update address
  const handleSaveAddress = async () => {
    if (!newAddress.label.trim() || !newAddress.address.trim()) {
      alert("Please fill both fields!");
      return;
    }

    try {
      if (editAddressId) {
        // update existing
        const res = await axios.put(
          `http://localhost:5000/api/auth/addresses/${editAddressId}`,
          newAddress,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAddresses(res.data);
        alert("Address updated!");
      } else {
        // add new
        const res = await axios.post(
          "http://localhost:5000/api/auth/addresses",
          newAddress,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAddresses(res.data);
        alert("New address added!");
      }

      setNewAddress({ label: "", address: "" });
      setIsAddingAddress(false);
      setEditAddressId(null);
    } catch (err) {
      console.error("Save address error:", err);
      alert("Failed to save address");
    }
  };

  // ✅ Delete address
  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/auth/addresses/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses(res.data);
    } catch (err) {
      console.error("Delete address error:", err);
      alert("Failed to delete address");
    }
  };

  // ✅ Edit existing address
  const handleEditAddress = (addr: any) => {
    setEditAddressId(addr._id);
    setNewAddress({ label: addr.label, address: addr.address });
    setIsAddingAddress(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        {error}
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 text-lg">
        Loading profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 text-gray-900 p-10">
      {/* Header */}
      <h1 className="text-3xl font-bold text-amber-700 mb-6">
        Account Profile
      </h1>

      {/* Account Info */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200 mb-8">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            👤 Account Information
          </h2>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          {[
            { label: "Full Name", value: user.fullName },
            { label: "Father Name", value: user.fatherName },
            { label: "Email", value: user.email },
            { label: "Phone", value: user.phone },
            { label: "CNIC", value: user.cnicNumber },
            { label: "Country", value: user.country },
            { label: "City", value: user.city },
            { label: "Date of Birth", value: user.dob },
          ].map((f, i) => (
            <div key={i}>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {f.label}
              </p>
              <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200 mb-8">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">📍 Addresses</h2>
          <button
            onClick={() => {
              setIsAddingAddress(!isAddingAddress);
              setEditAddressId(null);
              setNewAddress({ label: "", address: "" });
            }}
            className="px-4 py-2 rounded-md text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition"
          >
            {isAddingAddress ? "Cancel" : "Add New Address"}
          </button>
        </div>

        <div className="p-6 space-y-4">
          {addresses.length === 0 && (
            <p className="text-gray-600">No addresses added yet.</p>
          )}

          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <div>
                <p className="font-semibold text-gray-900">{addr.label}</p>
                <p className="text-gray-600">{addr.address}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEditAddress(addr)}
                  className="text-amber-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(addr._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {isAddingAddress && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2 animate-fade-in">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, label: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newAddress.address}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={handleSaveAddress}
                className="mt-3 px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600"
              >
                {editAddressId ? "Update Address" : "Save Address"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6">
        <button
          onClick={() => navigate("/change-password")}
          className="block text-left w-full text-gray-800 hover:text-amber-600 mb-2"
        >
          Change Password
        </button>
        <button
          onClick={handleLogout}
          className="block text-left w-full text-gray-800 hover:text-amber-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
