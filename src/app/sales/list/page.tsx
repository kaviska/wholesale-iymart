"use client";
import { useEffect, useState } from "react";
import DataTableMy from "@/components/main/DataTable";
import Title from "@/components/main/Title";

interface OrderItem {
  product_name: string;
  unit_quantity: number;
}

interface Order {
  order_number: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  subtotal: number;
  total_discount: number;
  tax: number;
  shipping_cost: number;
  total: number;
  order_items: OrderItem[];
  order_status: string;
  type: string;
}

export default function SalesList() {
  const [orders, setOrders] = useState<Order[]>([]);

const columns = [
    {
        name: "Order Number",
        selector: (row: Order) => row.order_number,
        sortable: true,
    },
    {
        name: "Customer Name",
        selector: (row: Order) => row.user_name,
        sortable: true,
    },
    {
        name: "Email",
        selector: (row: Order) => row.user_email,
    },
    {
        name: "Phone",
        selector: (row: Order) => row.user_phone,
    },
    {
        name: "Subtotal",
        selector: (row: Order) => `¥${row.subtotal.toFixed(2)}`,
    },
    {
        name: "Discount",
        selector: (row: Order) => `¥${row.total_discount.toFixed(2)}`,
    },
    {
        name: "Tax",
        selector: (row: Order) => `¥${row.tax.toFixed(2)}`,
    },
    {
        name: "Shipping",
        selector: (row: Order) => `¥${row.shipping_cost.toFixed(2)}`,
    },
    {
        name: "Total",
        selector: (row: Order) => `¥${row.total.toFixed(2)}`,
    },
];

  const fetchOrders = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/admin/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const result = await response.json();
      if (result.status === "success") {
        const filteredOrders = result.data.filter((order: Order) => order.type === "pos");
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <Title
        title="Sales List"
        breadCrumbs={[
          { label: "Sales", href: "/sales" },
          { label: "List", href: "/sales/list" },
        ]}
        active="list of sales"
      />
      {orders.length === 0 ? (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-2xl text-gray-500">No sales found</h1>
        </div>
      ) : (
        <div className="mt-8">
          <DataTableMy columns={columns} data={orders} />
        </div>
      )}
    </div>
  );
}