// src/pages/AdminPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Delivery {
  _id: string;
  pickupLocation: string;
  dropoffLocation: string;
  itemName: string;
  itemWeight: number;
  status: string;
  createdAt: string;
}

interface User {
  _id: string;
  fullName: string;
  fatherName: string;
  email: string;
  phone: string;
  cnicNumber: string;
  country: string;
  city: string;
  dob: string;
  educationLevel: string;
  createdAt: string;
}

const AdminPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/droneOrders");
        setDeliveries(res.data);
      } catch (err) {
        console.error("Failed to fetch deliveries:", err);
      }
    };
    fetchDeliveries();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-amber-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center bg-white shadow-md py-4 px-8">
        <h1
          className="text-3xl font-extrabold text-amber-700 cursor-pointer hover:text-amber-600 transition-all"
          onClick={() => window.location.href = "/"}
        >
          <span className="text-amber-500">Air</span>GO
        </h1>

        <div className="text-2xl font-bold text-amber-800">Admin</div>

        <button
          onClick={() => window.location.href = "/"}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-all"
        >
          Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-10 space-y-10">
        {/* Delivery History */}
        <section>
          <h2 className="text-3xl font-bold text-amber-700 mb-4">Delivery History</h2>
          {deliveries.length === 0 ? (
            <p className="text-gray-500">No deliveries yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-2xl shadow-md border border-amber-200">
                <thead className="bg-amber-100">
                  <tr>
                    <th className="py-2 px-4 border-b">Pickup</th>
                    <th className="py-2 px-4 border-b">Dropoff</th>
                    <th className="py-2 px-4 border-b">Item</th>
                    <th className="py-2 px-4 border-b">Weight</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d._id} className="text-center">
                      <td className="py-2 px-4 border-b">{d.pickupLocation}</td>
                      <td className="py-2 px-4 border-b">{d.dropoffLocation}</td>
                      <td className="py-2 px-4 border-b">{d.itemName}</td>
                      <td className="py-2 px-4 border-b">{d.itemWeight} kg</td>
                      <td className="py-2 px-4 border-b">{d.status}</td>
                      <td className="py-2 px-4 border-b">{new Date(d.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Registered Users */}
        <section>
          <h2 className="text-3xl font-bold text-amber-700 mb-4">Registered Users</h2>
          {users.length === 0 ? (
            <p className="text-gray-500">No users registered yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-2xl shadow-md border border-amber-200">
                <thead className="bg-amber-100">
                  <tr>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Father Name</th>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Phone</th>
                    <th className="py-2 px-4 border-b">CNIC</th>
                    <th className="py-2 px-4 border-b">Country</th>
                    <th className="py-2 px-4 border-b">City</th>
                    <th className="py-2 px-4 border-b">DOB</th>
                    <th className="py-2 px-4 border-b">Education</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="text-center">
                      <td className="py-2 px-4 border-b">{u.fullName}</td>
                      <td className="py-2 px-4 border-b">{u.fatherName}</td>
                      <td className="py-2 px-4 border-b">{u.email}</td>
                      <td className="py-2 px-4 border-b">{u.phone}</td>
                      <td className="py-2 px-4 border-b">{u.cnicNumber}</td>
                      <td className="py-2 px-4 border-b">{u.country}</td>
                      <td className="py-2 px-4 border-b">{u.city}</td>
                      <td className="py-2 px-4 border-b">{u.dob}</td>
                      <td className="py-2 px-4 border-b">{u.educationLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-amber-700 text-white py-6 text-center mt-auto">
        <p className="text-sm mb-2">
          <a href="/privacy-policy" className="hover:underline mx-2">Privacy Policy</a> |
          <a href="/refund-policy" className="hover:underline mx-2">Return & Refund Policy</a> |
          <a href="/service-policy" className="hover:underline mx-2">Service Policy</a> |
          <a href="/terms" className="hover:underline mx-2">Terms & Conditions</a>
        </p>
        <p className="text-xs text-amber-200">
          © {new Date().getFullYear()} AirGO | Drone Delivery System
        </p>
      </footer>
    </div>
  );
};

export default AdminPage;
