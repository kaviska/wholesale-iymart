"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useRouter } from "next/navigation";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TablePagination,
} from "@mui/material";
import ToastMessage from "./ToastMessage";
import axios from "axios";

// Types
interface OrderItem {
  product_name: string;
  unit_quantity: number;
  unit_price: number;
}

interface OrderData {
  id: number;
  order_number: string;
  user_email: string;
  order_status: string;
  payment_method: string;
  total: number;
  user_address_line1: string;
  user_address_line2: string;
  user_prefecture: string;
  user_city: string;
  user_postal_code: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total_discount: number;
  user_region: string;
  user_phone: string;
  type: string;
  payment_status: string;
  order_items: OrderItem[];
}

interface CollapsibleTableProps {
  data: OrderData[];
}

// Modal styles
const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

// Row Component
function Row({ row }: { row: OrderData }) {
  const [open, setOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  //order status
  const [orderStatus, setOrderStatus] = React.useState("pending");
  const [paymentStatus, setPaymentStatus] = React.useState("pending");

  const orderStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
    { value: "failed", label: "Failed" },
    { value: "on_hold", label: "On Hold" },
    { value: "delivered", label: "Delivered" },
  ];

  const router = useRouter();

  const openPDF = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/report/order-invoice`,
        {
          method: "POST",
          body: JSON.stringify({
            order_number: row.order_number,
          }),
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

  const updateOrderStatus = async () => {
    try {
      // Make the API request using axios
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/update/order-status`,
        {
          order_id: row.id,
          status: orderStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Check the response status code
      if (response.status === 200) {
        console.log("Order status updated successfully");
        alert("Order status updated successfully");
        handleClose();
        router.refresh();
      } else {
        console.error("Failed to update order status:", response.status);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      // Handle the error appropriately
      alert("Error updating order status : Check again later");
    }
  };
  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.order_number}</TableCell>
        <TableCell>{row.user_email}</TableCell>
<TableCell>
  <p
    className={`inline-block px-2 py-1 rounded text-white text-xs ${
      row.order_status === "pending"
        ? "bg-yellow-500"
        : row.order_status === "processing"
        ? "bg-blue-500"
        : row.order_status === "completed"
        ? "bg-green-500"
        : row.order_status === "cancelled"
        ? "bg-gray-500"
        : row.order_status === "refunded"
        ? "bg-purple-500"
        : row.order_status === "failed"
        ? "bg-red-600"
        : row.order_status === "on_hold"
        ? "bg-orange-500"
        : row.order_status === "delivered"
        ? "bg-teal-600"
        : "bg-gray-300"
    }`}
  >
    {row.order_status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
  </p>
</TableCell>

        <TableCell>{row.payment_method}</TableCell>
        <TableCell>¥{row.total}</TableCell>
        <TableCell>
          <Button variant="outlined" size="small" onClick={handleOpen}>
            View Details
          </Button>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.order_items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.unit_quantity}</TableCell>
                      <TableCell>¥{item.unit_price}</TableCell>
                      <TableCell>
                        ¥{item.unit_quantity * item.unit_price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Modal */}
      <Modal open={modalOpen} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 800,
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
          className="rounded-2xl shadow-lg"
        >
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Order Details:{" "}
              <span className="text-green-600">{row.order_number}</span>
            </h2>

            <button
              onSubmit={openPDF}
              onClick={openPDF}
              className="px-4 py-3 mt-6 w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-colors text-white font-semibold text-sm shadow-md"
            >
              Print Invoice
            </button>

            {/* User Information */}
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-medium">User Email:</p>
                <p>{row.user_email}</p>
              </div>
              <div>
                <p className="font-medium">Phone:</p>
                <p>{row.user_phone}</p>
              </div>

              <div className="md:col-span-2">
                <p className="font-medium">Address:</p>
                <p>
                  {row.user_address_line1}, {row.user_address_line2},{" "}
                  {row.user_city}, {row.user_postal_code}, {row.user_region},{" "}
                  {row.user_prefecture}
                </p>
              </div>

              <div>
                <p className="font-medium">Subtotal:</p>
                <p>¥{row.subtotal}</p>
              </div>
              <div>
                <p className="font-medium">Tax:</p>
                <p>¥{row.tax}</p>
              </div>
              <div>
                <p className="font-medium">Shipping:</p>
                <p>¥{row.shipping_cost}</p>
              </div>
              <div>
                <p className="font-medium">Discount:</p>
                <p>¥{row.total_discount}</p>
              </div>
              <div>
                <p className="font-medium">Total:</p>
                <p className="text-lg font-bold text-green-700">¥{row.total}</p>
              </div>
              <div>
                <p className="font-medium">Payment Status:</p>
                <p
                  className={`inline-block px-2 py-1 rounded text-white text-xs ${
                    row.payment_status === "completed"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {row.payment_status}
                </p>
              </div>
            </div>

            {/* Order Status and Payment Status Selectors */}
            <div className="mt-4 space-y-4">
              {/* Order Status */}
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

            {/* Update Button */}
            <button
              onClick={() => {
                updateOrderStatus();
              }}
              className="px-4 py-3 mt-6 w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-colors text-white font-semibold text-sm shadow-md"
            >
              Update Order Status
            </button>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold mt-6 mb-2">Items</h3>
              <div className="border rounded-md p-3 bg-gray-50 space-y-2">
                {row.order_items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-medium">{item.product_name}</span>
                    <span>
                      {item.unit_quantity} × ¥{item.unit_price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
}

// Main CollapsibleTable Component
export default function CollapsibleTable({ data }: CollapsibleTableProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow className="bg-green-300">
              <TableCell />
              <TableCell>Order Number</TableCell>
              <TableCell>User Email</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </>
  );
}
