import React, { useState } from "react";
import { Modal, Box, Button, Typography, AlertColor } from "@mui/material";
import TextField from "@mui/material/TextField";
import ToastMessage from "@/components/dashboard/ToastMessage";

interface Supplier {
  name: string;
  email: string;
  mobile: string;
  address: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
}

interface AddProps {
  supplierModelOpen: boolean;
  handleCloseAddModal: () => void;
  onAddSuccess: () => void; // Callback to update the UI on success
}

export default function SupplierAdd({
  supplierModelOpen,
  handleCloseAddModal,
  onAddSuccess,
}: AddProps) {
  const [formData, setFormData] = useState<Supplier>({
    name: "",
    email: "",
    mobile: "",
    address: "",
    bank_name: "",
    bank_account_number: "",
  });

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const inputFields = [
    { name: "name", label: "Full Name", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "mobile", label: "Mobile", type: "text" },
    { name: "address", label: "Address", type: "text" },
    { name: "bank_name", label: "Bank Name", type: "text" },
    { name: "bank_account_number", label: "Bank Account Number", type: "text" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = async () => {
    try {
      setToast({
        open: true,
        message: "Adding supplier...",
        severity: "info",
      });

      if (!formData.name || !formData.email || !formData.mobile) {
        setToast({
          open: true,
          message: "Please fill in all required fields (Name, Email, Mobile)",
          severity: "error",
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/suppliers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setToast({
          open: true,
          message: "Supplier added successfully!",
          severity: "success",
        });
        handleCloseAddModal();
        onAddSuccess(); // Trigger UI update
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to add supplier.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      setToast({
        open: true,
        message: "An error has occurred",
        severity: "error",
      });
    }
  };

  return (
    <div>
      <Modal open={supplierModelOpen} onClose={handleCloseAddModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            maxHeight: "80vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Add Supplier
          </Typography>
          <div className="grid grid-cols-1 gap-6">
            {inputFields.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                name={field.name}
                label={field.label}
                variant="outlined"
                value={formData[field.name as keyof Supplier]}
                onChange={handleChange}
              />
            ))}
          </div>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAdd}
            sx={{ mt: 2 }}
          >
            Add Supplier
          </Button>
        </Box>
      </Modal>
      <ToastMessage
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </div>
  );
}