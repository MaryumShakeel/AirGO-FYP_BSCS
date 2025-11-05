// src/pages/ServicePolicy.tsx
import React from "react";

const ServicePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-amber-600">Service Policy</h1>
        <p className="mb-4">
          At <strong>AirGO</strong>, we provide fast, secure, and reliable drone-based delivery services.
          Our goal is to ensure your items are safely transported from pickup to delivery.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-amber-700">1. Delivery Process</h2>
        <p className="mb-4">
          Once your order is confirmed, our system assigns an available drone for dispatch. 
          The drone will pick up your parcel from the provided location and deliver it directly 
          to the recipient’s address using optimized flight paths.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-amber-700">2. Service Availability</h2>
        <p className="mb-4">
          Our delivery services currently operate within selected regions. 
          Expansion to additional areas is in progress. You’ll be notified if your requested location 
          falls outside our operational zone.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-amber-700">3. Delivery Time</h2>
        <p className="mb-4">
          Delivery time may vary depending on factors such as distance, weather, and air traffic conditions.
          Real-time tracking is available through your dashboard for full visibility.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-amber-700">4. Service Charges</h2>
        <p className="mb-4">
          Pricing is based on distance, weight, and priority. All charges are displayed before you confirm the order.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-amber-700">5. Limitations</h2>
        <p className="mb-4">
          For safety reasons, we cannot transport hazardous materials, fragile goods, or items exceeding drone weight limits.
        </p>

        <p className="mt-10">
          If you have any questions regarding our delivery process, please contact us at{" "}
          <a href="mailto:support@airgo.com" className="text-amber-600 hover:underline">
            support@airgo.com
          </a>.
        </p>
      </div>
    </div>
  );
};

export default ServicePolicy;
