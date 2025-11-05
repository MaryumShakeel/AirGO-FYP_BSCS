import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", address: "" });

  const [user, setUser] = useState({
    fullName: "",
    fatherName: "",
    email: "",
    phone: "",
    cnicNumber: "",
    country: "",
    city: "",
    dob: "",
    addresses: [{ id: 1, label: "Home", address: "123 Main St" }],
  });

  const [error, setError] = useState("");

  // ✅ Fetch user profile securely from backend using stored token
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setError("You must be logged in");
          navigate("/login");
          return;
        }

        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // ✅ Update user state with data from backend
        setUser((prev) => ({
          ...prev,
          ...res.data,
        }));
      } catch (err: any) {
        console.error("Profile fetch error:", err.response?.data || err.message);
        setError("Failed to load profile");
      }
    };

    fetchProfile();
  }, [navigate]);

  // ✅ Handle field changes
  const handleChange = (field: string, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Toggle edit mode and optionally save profile
  const handleEditToggle = () => {
    if (isEditing) {
      alert("✅ Profile updated successfully!");
    }
    setIsEditing(!isEditing);
  };

  // ✅ Add new address logic
  const handleAddNewAddress = () => {
    if (!isAddingAddress) {
      setIsAddingAddress(true);
      return;
    }
    if (!newAddress.label.trim() || !newAddress.address.trim()) {
      alert("Please fill both fields!");
      return;
    }
    const newAddrObj = {
      id: Date.now(),
      label: newAddress.label,
      address: newAddress.address,
    };
    setUser((prev) => ({
      ...prev,
      addresses: [...prev.addresses, newAddrObj],
    }));
    setNewAddress({ label: "", address: "" });
    setIsAddingAddress(false);
    alert("New address added!");
  };

  // ✅ Delete address logic
  const handleDeleteAddress = (id: number) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      setUser((prev) => ({
        ...prev,
        addresses: prev.addresses.filter((addr) => addr.id !== id),
      }));
      alert("Address deleted successfully!");
    }
  };

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ✅ Show error if profile failed to load
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        {error}
      </div>
    );
  }

  // ✅ UI Rendering
  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 text-gray-900 p-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-700">Account Profile</h1>
        <p className="text-gray-700 mt-1">
          Manage your account information and settings.
        </p>
      </div>

      {/* Account Info Section */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200 mb-8">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            👤 Account Information
          </h2>
          <button
            onClick={handleEditToggle}
            className="px-4 py-2 rounded-md text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition"
          >
            {isEditing ? "Save Changes" : "Edit"}
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          {[
            { label: "Full Name", field: "fullName", type: "text" },
            { label: "Father Name", field: "fatherName", type: "text" },
            { label: "Email Address", field: "email", type: "email" },
            { label: "Phone Number", field: "phone", type: "text" },
            { label: "CNIC Number", field: "cnicNumber", type: "text" },
            { label: "Country", field: "country", type: "text" },
            { label: "City", field: "city", type: "text" },
            { label: "Date of Birth", field: "dob", type: "date" },
          ].map((f, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {f.label}
              </label>
              <input
                type={f.type}
                value={(user as any)[f.field] || ""}
                disabled={!isEditing}
                onChange={(e) => handleChange(f.field, e.target.value)}
                className={`w-full p-2 rounded-md border text-gray-900 ${
                  isEditing
                    ? "border-amber-400 bg-white"
                    : "border-gray-300 bg-gray-100"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Addresses Section */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200 mb-8">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">📍 Addresses</h2>
          <button
            onClick={handleAddNewAddress}
            className="px-4 py-2 rounded-md text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition"
          >
            {isAddingAddress ? "Save Address" : "Add New Address"}
          </button>
        </div>

        <div className="p-6 space-y-4">
          {user.addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <div>
                <p className="font-semibold text-gray-900">{addr.label}</p>
                <p className="text-gray-600">{addr.address}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => alert("Edit Address feature coming soon!")}
                  className="text-amber-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {isAddingAddress && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
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
            </div>
          )}
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            ⚙️ Account Settings
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={() => navigate("/change-password")}
            className="block text-left w-full text-gray-800 hover:text-amber-600"
          >
            Change Password
          </button>

          {/*
          <button
            onClick={() => navigate("/enable-2fa")}
            className="block text-left w-full text-gray-800 hover:text-amber-600"
          >
            Enable 2FA (Two-Factor Authentication)
          </button> */}

          {/*
          <button
            onClick={() => navigate("/notification-preferences")}
            className="block text-left w-full text-gray-800 hover:text-amber-600"
          >
            Notification Preferences
          </button>    */}

          <button className="block text-left w-full text-red-600 hover:text-red-700">
            Delete Account
          </button>

          {/* --- Logout Button --- */}
          <button
            onClick={handleLogout}
            className="mt-4 block w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
