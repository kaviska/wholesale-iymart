"use client";

import { useEffect, useState } from "react";
import { Alert, CircularProgress, Typography, Card, CardContent } from "@mui/material";

interface AlertData {
  barcode: string;
  product: string;
  name: string;
  quantity: number;
  alertQuantity: number;
}

export default function Notifications() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/reports/alert-table`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      setError("Failed to load notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="p-5">
      <Typography variant="h4" className="text-center text-gray-700 mb-5">
        Notifications
      </Typography>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      ) : error ? (
        <Alert severity="error" className="mb-5">
          {error}
        </Alert>
      ) : alerts.length === 0 ? (
        <Typography variant="h6" className="text-center text-gray-500">
          No notifications to display.
        </Typography>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <Card
              key={alert.barcode}
              className={`shadow-md ${
                alert.quantity < alert.alertQuantity ? "border-red-500 border-l-4" : "border-green-500 border-l-4"
              }`}
            >
              <CardContent>
                <Typography variant="h6" className="font-bold text-gray-800">
                  {alert.product}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Barcode: {alert.barcode}
                </Typography>
                <Typography
                  variant="body2"
                  className={`font-medium ${
                    alert.quantity < alert.alertQuantity ? "text-red-500" : "text-green-500"
                  }`}
                >
                  Quantity: {alert.quantity}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Alert Quantity: {alert.alertQuantity}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}