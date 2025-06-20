"use client";
import { useState } from "react";
import Title from "@/components/main/Title";

export default function Sales() {
  const [reportType, setReportType] = useState("daily");
  const [platformType, setPlatformType] = useState("pos");
  const [dateRange, setDateRange] = useState<[string, string]>(["", ""]);

  const handleDateChange = (index: number, value: string) => {
    setDateRange((prev) => {
      const updated = [...prev] as [string, string];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const body: any = {
        report_type: reportType,
        platform_type: platformType,
      };
      if (dateRange[0] && dateRange[1]) {
        body.date_range = dateRange;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/reports/sales`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },
        }
      );

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.");
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
      console.error("Error fetching report:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Title
        title="Sales Report"
        breadCrumbs={[
          { label: "Product", href: "/sales" },
          { label: "Purchase", href: "/reports/sales" },
        ]}
        active="list of sales"
      />
      <div className="max-w-lg mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
              Report Type:
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label htmlFor="platformType" className="block text-sm font-medium text-gray-700 mb-2">
              Platform Type:
            </label>
            <select
              id="platformType"
              value={platformType}
              onChange={(e) => setPlatformType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pos">POS</option>
              <option value="web">Web</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range (optional):
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange[0]}
                onChange={(e) => handleDateChange(0, e.target.value)}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="self-center">to</span>
              <input
                type="date"
                value={dateRange[1]}
                onChange={(e) => handleDateChange(1, e.target.value)}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              If date range is set, report type will be ignored.
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Report
          </button>
        </form>
      </div>
    </div>
  );
}