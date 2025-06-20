"use client";
import { useState } from "react";

export default function Invoices() {
  const [orderNumber, setOrderNumber] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/reports/order-invoice`,
        {
          method: "POST",
          body: JSON.stringify({
            order_number: orderNumber,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow?.print();
        if (iframe.contentWindow) {
          iframe.contentWindow.onafterprint = () => {
            document.body.removeChild(iframe);
          };
        }
      };
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="orderNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Order Number:
            </label>
            <input
              id="orderNumber"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Print Invoice
          </button>
        </form>
      </div>
    </div>
  );
}