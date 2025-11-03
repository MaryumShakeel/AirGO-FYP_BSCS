import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      alert("❌ New passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ " + response.data.message);

      // ✅ Clear token and logout
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error: any) {
      console.error("Change password error:", error);
      if (error.response?.data?.message)
        alert("❌ " + error.response.data.message);
      else alert("❌ Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Change Password
        </h2>
        <p className="text-gray-600 mb-6">
          Keep your account secure by updating your password regularly.
        </p>

        {/* Input Fields */}
        {[
          {
            label: "Current Password",
            field: "currentPassword",
            type: "password",
          },
          { label: "New Password", field: "newPassword", type: "password" },
          {
            label: "Confirm New Password",
            field: "confirmPassword",
            type: "password",
          },
        ].map((f, i) => (
          <div key={i} className="mb-5">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {f.label}
            </label>
            <input
              type={f.type}
              value={(form as any)[f.field]}
              onChange={(e) => handleChange(f.field, e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
        ))}

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? "bg-gray-400" : "bg-amber-500 hover:bg-amber-600"
          } text-white py-2.5 rounded-lg font-semibold shadow-md transition`}
        >
          {loading ? "Saving..." : "Save Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
