import * as React from "react";
import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import { OrderData } from "@/types/type";

interface ConformPayModelProps {
  isOpen: boolean;
  onClose: () => void;
  data: OrderData | null;
  setUiChange?: React.Dispatch<React.SetStateAction<number>>;
  setLocalDiscounts?: React.Dispatch<Record<number, number>>;
   uiChnageForPos: number;
  setUiChnageForPos: React.Dispatch<React.SetStateAction<number>>;
}

export default function ConformPayModel({
  isOpen,
  onClose,
  data,
  setUiChange,
  setLocalDiscounts,
  uiChnageForPos,
  setUiChnageForPos,
}: ConformPayModelProps) {
  const [payingAmount, setPayingAmount] = useState<number | "">("");
  const totalAmount = data?.payment?.order?.total || 0;
  const tax = data?.payment?.order?.tax || 0;
  const shipping = data?.payment?.order?.shipping_cost || 0;
  const discount = data?.payment?.order?.total_discount || 0;

    // ...existing code...
  
  useEffect(() => {
    if (isOpen && totalAmount > 0) {
      const payable = discount > 0 ? totalAmount + discount + '-'+ discount : totalAmount;
      fetch("http://localhost:3000/total", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: payable }),
      }).catch((err) => {
        console.error("Error sending total to customer screen:", err.message);
      });
    }
  }, [isOpen, totalAmount, discount]);
  
  // ...existing code...

  

  const [paymentType, setPaymentType] = useState("cash");

  // const totalPayable = totalAmount + tax + shipping - discount;
  const returnAmount = payingAmount ? payingAmount - totalAmount : 0;

  // ...existing code...
  useEffect(() => {
    if (typeof payingAmount === "number" && !isNaN(payingAmount)) {
      if (payingAmount <= totalAmount) {
        // Only send collect when paying or underpaying
        fetch("http://localhost:3000/collect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: payingAmount }),
        });
      } else if (payingAmount > totalAmount) {
        // Only send change when overpaying
        fetch("http://localhost:3000/change", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: payingAmount - totalAmount }),
        });
      }
    }
  }, [payingAmount, totalAmount]);
  // ...existing code...

  const handleClose = () => {
    onClose();
  };

  const printRecipt = async () => {
    try {
      onClose();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/pos-print-bill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer 3|85MPD3fuiEGXIJYlvgV0PCOhLPVEzLL2JBBJl349f9ff23f6",
            Accept: "application/json",
          },
          body: JSON.stringify({
            id: data?.payment?.order?.id,
            payment_type: paymentType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to print receipt");
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

      orderChangeStatus();
      setPayingAmount(""); // Reset paying amount after payment
      setPaymentType("cash"); // Reset payment type after payment

      if (setLocalDiscounts) {
        setLocalDiscounts({}); // Reset local discounts to 0 after payment
      }

      const sendTotalToLocalhost = (label: string, value: number) => {
        fetch(`http://localhost:3000/${label}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value }),
        })
          .then((res) => res.text())
          .then((text) => {
            // Optionally handle response, e.g., show a toast or log
            console.log("Localhost response:", text);
          })
          .catch((err) => {
            console.error("Error sending to localhost:", err.message);
          });
      };

      sendTotalToLocalhost("total", 0);
    } catch (error) {
      console.error("Error printing receipt:", error);
    }
  };

  const orderChangeStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/update/order-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer 3|85MPD3fuiEGXIJYlvgV0PCOhLPVEzLL2JBBJl349f9ff23f6",
            Accept: "application/json",
          },
          body: JSON.stringify({
            order_id: data?.payment?.order?.id,
            status: "completed",
            isCreateInvoice: true,
            isSendInvoice: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const result = await response.json();
      console.log("Order status updated:", result);
      if (result.status === "success") {
        if (setUiChange) {
          setUiChange((prev: number) => prev + 1); // Trigger UI change
        setUiChnageForPos((prev) => prev + 1); // Trigger UI change

        }
      } else {
        console.error("Failed to update order status:", result.message);
      }
      //refresh the page or update the UI as needed
      //window.location.reload();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handlePayingAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPayingAmount(isNaN(value) ? "" : value);
  };

  return (
    <React.Fragment>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={isOpen}
        maxWidth={"md"}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Create Payment
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <div className="text-center text-[18px] font-medium">
            Walk In Customer
          </div>

          <Box
            noValidate
            component="form"
            sx={{
              width: "fit-content",
            }}
          >
            <div className="mt-4 flex flex-row gap-12">
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="text"
                    value={totalAmount.toFixed(2)}
                    disabled
                    className="rounded-[8px] px-3 py-3 min-w-[400px] border border-gray-200 outline-green-100 bg-gray-100"
                  />
                </div>

                <div className="relative min-h-[120px] border border-green-400 rounded-[8px] flex items-center justify-center bg-green-50 mb-4">
                  <input
                  type="text"
                  value={payingAmount}
                  onChange={handlePayingAmountChange}
                  className="text-green-700 text-[48px] font-bold text-center bg-transparent border-none outline-none w-full"
                  style={{ minHeight: "80px" }}
                 
                  />
                  <span className="absolute top-2 left-2 text-green-600 text-sm font-medium">
                  Paying Amount
                  </span>
                </div>

                <div className="relative min-h-[200px] border border-gray-200 rounded-[8px] flex items-center justify-center">
                  <h1 className="text-red-400 text-[48px]">
                    {returnAmount.toFixed(2)}
                  </h1>
                  <span className="absolute top-2 left-2 text-gray-500 text-sm">
                    Return Amount
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="border border-gray-200 rounded-[8px] p-4 min-w-[400px] shadow-sm">
                  <table className="w-full text-left text-sm text-gray-700">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Order Tax</td>
                        <td className="py-3 text-right"> ¥ {tax.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Discount</td>
                        <td className="py-3 text-right">
                          {" "}
                          ¥ {discount.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Shipping</td>
                        <td className="py-3 text-right">
                          {" "}
                          ¥ {shipping.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-lg">
                          Total Payable
                        </td>
                        <td className="py-3 text-right text-lg font-bold text-green-600">
                          ¥ {totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type
                  </label>
                  <select
                    className="rounded-[8px] px-3 py-3 min-w-[400px] border border-gray-200 outline-green-100"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
              </div>
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <button
            onClick={printRecipt}
            className="bg-green-400 cursor-pointer rounded-[8px] text-white px-3 py-2"
          >
            Pay Now
          </button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
