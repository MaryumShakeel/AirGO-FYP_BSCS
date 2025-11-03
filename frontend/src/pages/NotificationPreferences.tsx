import React, { useState } from "react";

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState({
    accountAlerts: true,
    securityAlerts: true,
    deliveryUpdates: true,
    deliveryIssues: false,
    marketingEmails: false,
    productUpdates: true,
  });

  const handleToggle = (key: string) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✅ Notification preferences saved successfully!");
    console.log("Saved preferences:", preferences);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 p-6 text-gray-900">
      <form
        onSubmit={handleSave}
        className="bg-white w-full max-w-2xl shadow-xl rounded-2xl border border-gray-200 p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Notification Preferences
        </h1>
        <p className="text-gray-600 mb-8">
          Choose what types of notifications you'd like to receive and how you
          want to be notified.
        </p>

        {/* Section: Account Notifications */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-amber-600 mb-4">
            👤 Account & Security
          </h2>
          <div className="space-y-3">
            {[
              { label: "Account activity alerts", key: "accountAlerts" },
              { label: "Security or login notifications", key: "securityAlerts" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition"
              >
                <span className="text-gray-800">{item.label}</span>
                <input
                  type="checkbox"
                  checked={preferences[item.key as keyof typeof preferences]}
                  onChange={() => handleToggle(item.key)}
                  className="appearance-none w-12 h-6 bg-gray-300 rounded-full relative 
                             checked:bg-amber-500 transition-all cursor-pointer
                             before:content-[''] before:absolute before:top-0.5 before:left-0.5 
                             before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all
                             checked:before:translate-x-6"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Section: Delivery Updates */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-amber-600 mb-4">
            🚁 Delivery Updates
          </h2>
          <div className="space-y-3">
            {[
              { label: "Receive delivery status updates", key: "deliveryUpdates" },
              { label: "Notify me about delays or issues", key: "deliveryIssues" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition"
              >
                <span className="text-gray-800">{item.label}</span>
                <input
                  type="checkbox"
                  checked={preferences[item.key as keyof typeof preferences]}
                  onChange={() => handleToggle(item.key)}
                  className="appearance-none w-12 h-6 bg-gray-300 rounded-full relative 
                             checked:bg-amber-500 transition-all cursor-pointer
                             before:content-[''] before:absolute before:top-0.5 before:left-0.5 
                             before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all
                             checked:before:translate-x-6"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Section: Promotions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-amber-600 mb-4">
            🎁 Marketing & Updates
          </h2>
          <div className="space-y-3">
            {[
              { label: "Receive marketing emails or offers", key: "marketingEmails" },
              { label: "Product news & updates", key: "productUpdates" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition"
              >
                <span className="text-gray-800">{item.label}</span>
                <input
                  type="checkbox"
                  checked={preferences[item.key as keyof typeof preferences]}
                  onChange={() => handleToggle(item.key)}
                  className="appearance-none w-12 h-6 bg-gray-300 rounded-full relative 
                             checked:bg-amber-500 transition-all cursor-pointer
                             before:content-[''] before:absolute before:top-0.5 before:left-0.5 
                             before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all
                             checked:before:translate-x-6"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-md transition"
        >
          Save Preferences
        </button>
      </form>
    </div>
  );
};

export default NotificationPreferences;
