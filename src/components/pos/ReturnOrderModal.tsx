"use client";
import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ToastMessage from "../dashboard/ToastMessage";
import Image from "next/image";

type OrderItem = {
  id: number;
  stock_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  unit_quantity: number;
  line_total: number;
  product_image?: string;
};

type OrderData = {
  id: number;
  user_id: number;
  order_number: string;
  order_items: OrderItem[];
};

type ReturnOrderModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function ReturnOrderModal({
  open,
  setOpen,
}: ReturnOrderModalProps) {
  const [billNumber, setBillNumber] = useState("IY-");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>(
    {}
  );
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Fetch order details by bill number
  const fetchOrder = async () => {
    setLoading(true);
    setOrder(null);
    setSelectedItems({});
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/pos-orders?order_id=${billNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setOrder(data.data);
        setToast({
          open: true,
          message: "Order loaded successfully.",
          severity: "success",
        });
      } else {
        setToast({
          open: true,
          message: data.message || "Order not found.",
          severity: "error",
        });
      }
    } catch (error) {
      setToast({
        open: true,
        message: "Failed to fetch order.",
        severity: "error",
      });
    }
    setLoading(false);
  };

  // Handle checkbox toggle for return items
  const handleSelectItem = (item: OrderItem, checked: boolean) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      if (checked) {
        updated[item.stock_id] = 1;
      } else {
        delete updated[item.stock_id];
      }
      return updated;
    });
  };

  // Handle quantity change for return items
  const handleQuantityChange = (
    stock_id: number,
    value: number,
    max: number
  ) => {
    setSelectedItems((prev) => ({
      ...prev,
      [stock_id]: Math.max(1, Math.min(value, max)),
    }));
  };

  // Submit return order
  const handleReturn = async () => {
    if (!order) return;
    if (!reason.trim()) {
      setToast({
        open: true,
        message: "Please provide a reason for return.",
        severity: "error",
      });
      return;
    }
    if (Object.keys(selectedItems).length === 0) {
      setToast({
        open: true,
        message: "Please select at least one item to return.",
        severity: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const return_items = Object.entries(selectedItems).map(
        ([stock_id, quantity]) => ({
          stock_id: Number(stock_id),
          quantity,
        })
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/order-return`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            order_id: order.id,
            user_id: order.user_id,
            return_items,
            reason,
          }),
        }
      );
      const blob = await response.blob();
      if (response.ok) {
        setToast({
          open: true,
          message: "Return processed successfully.",
          severity: "success",
        });
        setOrder(null);
        setBillNumber("IY-");
        setReason("");
        setSelectedItems({});
        setOpen(false);

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
      } else {
      }
    } catch (error) {
      setToast({
        open: true,
        message: "Failed to process return.",
        severity: "error",
      });
    }
    setLoading(false);
  };

  // Get product image (mock or real)
  const getProductImage = (item: OrderItem) => {
    if (item.product_image) {
      return `${process.env.NEXT_PUBLIC_IMAGE_BASE || ""}${item.product_image}`;
    }
    return "/no-image.png";
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: "10px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Return Order</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Bill Number Input */}
        {!order && (
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Bill Number"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              fullWidth
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchOrder();
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={fetchOrder}
              sx={{ mt: 2 }}
              disabled={loading || !billNumber}
              fullWidth
            >
              {loading ? "Loading..." : "Load Order"}
            </Button>
          </Box>
        )}

        {/* Order Details and Return Items */}
        {order && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Order Number: {order.order_number}
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Select</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Qty Bought</TableCell>
                    <TableCell>Return Qty</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.order_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems[item.stock_id] !== undefined}
                          onChange={(e) =>
                            handleSelectItem(item, e.target.checked)
                          }
                        />
                      </TableCell>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>
                        {/* <img
                          src={getProductImage(item)}
                          alt={item.product_name}
                          width={40}
                          height={40}
                          style={{ objectFit: "cover", borderRadius: 4 }}
                        /> */}
                      </TableCell>
                      <TableCell>{item.unit_quantity}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={selectedItems[item.stock_id] || ""}
                          disabled={selectedItems[item.stock_id] === undefined}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.stock_id,
                              Number(e.target.value),
                              item.unit_quantity
                            )
                          }
                          inputProps={{
                            min: 1,
                            max: item.unit_quantity,
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                /{item.unit_quantity}
                              </InputAdornment>
                            ),
                          }}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Reason Input */}
            <TextField
              label="Reason for Return"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              color="secondary"
              onClick={handleReturn}
              disabled={loading}
              fullWidth
            >
              {loading ? "Processing..." : "Return Selected Items"}
            </Button>
          </>
        )}

        <ToastMessage
          open={toast.open}
          onClose={() => setToast({ ...toast, open: false })}
          message={toast.message}
          severity={toast.severity}
        />
      </Box>
    </Modal>
  );
}
