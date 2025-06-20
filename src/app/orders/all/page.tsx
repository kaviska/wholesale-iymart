"use client";

import CollapsibleTable from "@/components/dashboard/CollapsibleTable";
import Title from "@/components/main/Title";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import axios from "axios";
import React from "react";

export default function Orders() {
  const [orderId, setOrderId] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [orderStatus, setOrderStatus] = React.useState<string>("all");
  const [data, setData] = React.useState<any[]>([]);

  const [debounceTimeout, setDebounceTimeout] = React.useState<any>(null);

  const orderStatusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
    { value: "failed", label: "Failed" },
    { value: "on_hold", label: "On Hold" },
    { value: "delivered", label: "Delivered" },
  ];

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/orders`,
        {
          params: {
            order_number: orderId,
            order_status: orderStatus === "all" ? "" : orderStatus,
            user_email: email,
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("Response data:", response.data?.data);
      setData(response.data?.data.filter((order: any) => order.type !== "pos") || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Debounced fetch
  React.useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    const timeout = setTimeout(() => {
      fetchOrders();
    }, 500); // wait 500ms after user stops typing/selecting

    setDebounceTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [orderId, email, orderStatus]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title
          title="All Orders"
          breadCrumbs={[{ label: "Orders", href: "/orders" }]}
          active="all Orders"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={fetchOrders}
        >
          Refresh
        </button>
      </div>

      <div className="p-4 rounded-md mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FormControl className="w-full">
            <TextField
              label="Order ID"
              className="w-full"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </FormControl>
          <FormControl className="w-full">
            <TextField
              label="Customer Email"
              className="w-full"
              value={email}
              onChange={(e) => {setEmail(e.target.value);
                
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="order-status-label">Order Status</InputLabel>
            <Select
              labelId="order-status-label"
              id="order-status-select"
              value={orderStatus}
              label="Order Status"
              onChange={(e) => setOrderStatus(e.target.value)}
            >
              {orderStatusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      <CollapsibleTable data={data} />
    </div>
  );
}
