"use client"
import { Payment, RestartAlt, Save, History } from "@mui/icons-material";
import { useState } from "react";
import ConformPayModel from "./ConformPayModel";
import ToastMessage from "../dashboard/ToastMessage";
import { OrderData } from "@/types/type";
import { AlertColor } from "@mui/material";

interface PaySectionProps {
  total: number;
  setUiChange: React.Dispatch<React.SetStateAction<number>>;
  setLocalDiscounts?: React.Dispatch<Record<number, number>>;
   uiChnageForPos: number;
  setUiChnageForPos: React.Dispatch<React.SetStateAction<number>>;
}

export default function PaySection({ total, setUiChange,setLocalDiscounts,uiChnageForPos,setUiChnageForPos }: PaySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<OrderData | null>(null);
    const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "error",
  });
  // New states for inputs
  const [discount, setDiscount] = useState(0); // Discount in percentage
  const [shippingCost, setShippingCost] = useState(0); // Shipping cost in Yen
  const [taxRate, setTaxRate] = useState(0); // Tax rate in percentage

  //customer screen cjnage

 


  const reset = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart_items");
      window.location.reload();
    }
  };

  const tokenGenartor = (tokens?: Array<{ token_id: string | number; token: string }>) => {
    if (!tokens || tokens.length === 0) return null;
    const lastToken = tokens[tokens.length - 1];
    return `${lastToken.token_id}|${lastToken.token}`;
  };

  const handlePayment = async () => {
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    const cartItems = JSON.parse(localStorage.getItem("cart_items") || "[]");
    console.log("User Data", userData);
    console.log("Cart Items", cartItems);
    if (!userData || cartItems.length === 0) {
      setToast({
        open: true,
        message: "User data or cart items are missing!",
        severity: "error",
      });
      return;
    }

    let finalDiscount = discount;

    if (typeof window !== "undefined") {
      const totalDiscountForAllProduct = localStorage.getItem("totalDiscountForAllProduct");
      if (totalDiscountForAllProduct) {
      finalDiscount += Number(totalDiscountForAllProduct);
      }
    }

    const paymentData = {
      userData,
      paymentData: {
      method: "cash_on_delivery",
      due_date: "2030-04-04 15:49:06",
      },
      type: "pos",
      discount: finalDiscount, // Include combined discount
      tax_amount: taxRate, // Calculate tax amount
      shipping_cost: shippingCost, // Include shipping cost
      cart_items: cartItems.map((item: { stock_id: string; quantity: number }) => ({
      stock_id: item.stock_id,
      quantity: item.quantity,
      })),
    };

    console.log("User Data", userData.tokens);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/pos-place-order`,
        {
          method: "POST",
          headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userData.tokens[userData.tokens.length - 1].token}`,
        Accept: "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      const result = await response.json();
      console.log("Order Response", result);

      if (response.ok) {
        setToast({
          open: true,
          message: "Order placed successfully!",
          severity: "success",
        });
        localStorage.removeItem("cart_items");
        localStorage.removeItem("totalDiscountForAllProduct");

        setTaxRate(0); // Reset tax rate
        setShippingCost(0); // Reset shipping cost
        setDiscount(0); // Reset discount

        setUiChange((prev: number) => prev + 1); // Trigger UI change
        setUiChnageForPos((prev) => prev + 1); // Trigger UI change

        setIsOpen(true);
        setData(result.data);
      } else {
        setToast({
          open: true,
          message: result.errors.message || "Failed to place order!",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setToast({
        open: true,
        message: "An error occurred while placing the order.",
        severity: "error",
      });
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        className="mt-4 w-full cursor-pointer bg-secondary text-white p-3 flex justify-center items-center"
      >
        <h1 className="text-[40px] font-bold">
          Total Payable <span>¥{total}</span>
        </h1>
      </button>

   {/* Input Section */}
<div className="mt-6 grid md:grid-cols-3 gap-4">
  {/* Discount */}
  <div className="relative">
    <label htmlFor="discount" className="block mb-1 text-sm font-medium text-gray-700">Discount</label>
      
    
    
    <input
      type="number"
      id="discount"
      value={discount}
    
      onChange={(e) => setDiscount(Number(e.target.value))}
      className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="Discount"
    />
    <span className="absolute right-3 top-[45px] -translate-y-1/2 text-gray-500 pointer-events-none">
    ¥ 
    </span>
  </div>

  {/* Shipping Cost */}
  <div className="relative">
    <label htmlFor="discount" className="block mb-1 text-sm font-medium text-gray-700">Shipping Cost</label>

    <input
      type="number"
      id="shippingCost"
      value={shippingCost}
     
      onChange={(e) => setShippingCost(Number(e.target.value))}
      className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="Shipping Cost"
    />
    <span className="absolute right-3 top-[45px] -translate-y-1/2 text-gray-500 pointer-events-none">
      ¥
    </span>
  </div>

  {/* Tax Rate */}
  <div className="relative">
    <label htmlFor="discount" className="block mb-1 text-sm font-medium text-gray-700">Tax Rate</label>

    <input
      type="number"
      id="taxRate"
     
      onChange={(e) => setTaxRate(Number(e.target.value))}
      value={taxRate}
      className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="Tax Rate"
    />
    <span className="absolute right-3 top-[45px] -translate-y-1/2 text-gray-500 pointer-events-none">
      %
    </span>
  </div>
</div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {/* Pay Now Button */}
        <button
          onClick={handlePayment}
          className="flex flex-col items-center justify-center py-8 rounded-xl shadow-lg bg-gradient-to-br from-green-500 to-green-700 text-white text-2xl font-bold transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-400/40"
          style={{ minHeight: 120 }}
        >
          <Payment style={{ fontSize: 40 }} className="mb-2" />
          Pay Now
        </button>
        {/* Reset Button */}
        <button
          onClick={reset}
          className="flex flex-col items-center justify-center py-8 rounded-xl shadow-lg bg-gradient-to-br from-red-400 to-red-600 text-white text-2xl font-bold transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-400/40"
          style={{ minHeight: 120 }}
        >
          <RestartAlt style={{ fontSize: 40 }} className="mb-2" />
          Reset
        </button>
      </div>

      <ConformPayModel isOpen={isOpen} data={data} onClose={() => setIsOpen(false)} setLocalDiscounts={setLocalDiscounts} uiChnageForPos={uiChnageForPos} setUiChnageForPos={setUiChnageForPos}/>

      <ToastMessage
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </div>
  );
}