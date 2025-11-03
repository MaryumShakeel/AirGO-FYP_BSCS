import React, { useState } from "react";

const Enable2FA: React.FC = () => {
  const [method, setMethod] = useState("email");
  const [verificationCode, setVerificationCode] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleEnable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim() === "") {
      alert("❌ Please enter the verification code.");
      return;
    }

    
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsEnabled(true);
      alert("✅ Two-Factor Authentication enabled successfully!");
    }, 1000);
  };

  const handleDisable2FA = () => {
    if (window.confirm("Are you sure you want to disable 2FA?")) {
      setIsEnabled(false);
      alert("⚠️ Two-Factor Authentication has been disabled.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-amber-600 mb-2">
          Two-Factor Authentication
        </h1>
        <p className="text-gray-600 mb-6">
          Add an extra layer of security to your account. After enabling 2FA,
          you’ll need both your password and a verification code to sign in.
        </p>

        {!isEnabled ? (
          <form onSubmit={handleEnable2FA}>
            {/* Choose Method */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choose Verification Method
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="email"
                    checked={method === "email"}
                    onChange={(e) => setMethod(e.target.value)}
                  />
                  <span>Email Code</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="sms"
                    checked={method === "sms"}
                    onChange={(e) => setMethod(e.target.value)}
                  />
                  <span>SMS Code</span>
                </label>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              {method === "email" ? (
                <p>
                  📩 A 6-digit verification code will be sent to your registered
                  email address.
                </p>
              ) : (
                <p>
                  📱 A 6-digit verification code will be sent to your registered
                  phone number via SMS.
                </p>
              )}
            </div>

            {/* Verification Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. 123456"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className={`w-full py-2.5 rounded-lg font-semibold transition ${
                isVerifying
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-amber-500 text-white hover:bg-amber-600 shadow-md"
              }`}
            >
              {isVerifying ? "Verifying..." : "Enable 2FA"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-5">
              <h2 className="text-lg font-semibold text-amber-600 mb-1">
                ✅ 2FA is Enabled
              </h2>
              <p className="text-gray-600 text-sm">
                Your account is now protected with Two-Factor Authentication.
              </p>
            </div>
            <button
              onClick={handleDisable2FA}
              className="py-2 px-6 rounded-lg font-semibold bg-black text-white hover:bg-gray-800 transition"
            >
              Disable 2FA
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enable2FA;
