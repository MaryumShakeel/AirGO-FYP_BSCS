import React from "react";

const RefundPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-amber-600">Refund Policy</h1>
      <p className="mb-3">
        Thank you for choosing <strong>AirGO</strong>. Our goal is to deliver your
        packages quickly and securely through our drone delivery network.
      </p>

      <h2 className="text-xl font-semibold mt-4">Refunds</h2>
      <p className="mb-3">
        Once a drone delivery request is confirmed and dispatched,
        payments are non-refundable. However, if a delivery cannot
        be completed due to technical or weather issues, a full refund
        will be issued automatically within 5–7 business days.
      </p>

      <h2 className="text-xl font-semibold mt-4">Contact Us</h2>
      <p>
        For refund-related questions, please email us at
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

export default RefundPolicy;
