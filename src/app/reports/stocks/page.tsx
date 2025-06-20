"use client";
import { useState, useEffect } from "react";
import Title from "@/components/main/Title";

export default function Stocks() {
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [alert, setAlert] = useState<boolean>(false);
  const [reportType, setReportType] = useState<string>("all"); // New state for report type

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products?limit=10000000`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();
      if (result.status === "success") {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/reports/stocks`,
        {
          method: "POST",
          body: JSON.stringify({
            product_id: selectedProduct || 0,
            alert,
            report_type: reportType, // Send report type to backend
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit stock data");
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
      console.error("Error submitting stock data:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Title
        title="Stock Management"
        breadCrumbs={[
          { label: "Stocks", href: "/stocks" },
          { label: "Manage", href: "/reports/stocks" },
        ]}
        active="manage stocks"
      />
      <div className="max-w-lg mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="product"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Product:
            </label>
            <select
              id="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="alert"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Alert Quantity:
            </label>
            <select
              id="alert"
              value={alert ? "true" : "false"}
              onChange={(e) => setAlert(e.target.value === "true")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="reportType"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Report Type:
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}