import React from "react";

const TermsAndConditions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-amber-600">Terms & Conditions</h1>
      <p className="mb-3">
        By using <strong>AirGO</strong>, you agree to the following terms and conditions.
        Please read them carefully before using our services.
      </p>

      <h2 className="text-xl font-semibold mt-4">1. Service Use</h2>
      <p className="mb-3">
        AirGO provides drone-based delivery services. You must provide accurate
        information and comply with all local regulations during usage.
      </p>

      <h2 className="text-xl font-semibold mt-4">2. Payment</h2>
      <p className="mb-3">
        All payments are processed securely through PayFast. The user must
        complete payment before a delivery request is accepted.
      </p>

      <h2 className="text-xl font-semibold mt-4">3. Liability</h2>
      <p className="mb-3">
        AirGO is not responsible for delays or failures caused by weather,
        no-fly zones, or technical issues beyond our control.
      </p>

      <h2 className="text-xl font-semibold mt-4">4. Contact</h2>
      <p>
        For any queries, please contact us at
        <a
          href="mailto:contact@airgo.com"
          className="text-amber-600 underline ml-1"
        >
          contact@airgo.com
        </a>.
      </p>
    </div>
  );
};

export default TermsAndConditions;
