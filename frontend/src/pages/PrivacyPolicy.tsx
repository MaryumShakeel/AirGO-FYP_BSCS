import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-amber-600">Privacy Policy</h1>
      <p className="mb-3">
        Welcome to <strong>AirGO</strong> — Pakistan’s first AI-driven Drone Delivery System.
        Your privacy is important to us. This policy explains how we collect, use,
        and protect your personal information when you use our platform.
      </p>

      <h2 className="text-xl font-semibold mt-4">Information We Collect</h2>
      <ul className="list-disc ml-6 mb-3">
        <li>Personal details like name, email, and phone number.</li>
        <li>Payment and transaction information processed securely via PayFast.</li>
        <li>Delivery location and drone request details.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4">How We Use Your Information</h2>
      <p className="mb-3">
        We use your information to process payments, confirm drone deliveries,
        and improve our services. We never sell or share your data with third parties.
      </p>

      <h2 className="text-xl font-semibold mt-4">Data Security</h2>
      <p>
        All sensitive data is encrypted and processed using PayFast’s secure payment gateway.
        AirGO complies with Pakistan’s data protection laws.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
