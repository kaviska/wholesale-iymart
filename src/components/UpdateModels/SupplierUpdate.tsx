import React, { useEffect, useState } from "react";
import { Modal, Box, Button, Typography, AlertColor } from "@mui/material";
import TextField from "@mui/material/TextField";
import ToastMessage from "@/components/dashboard/ToastMessage";

interface Supplier {
    id: number;
    name: string;
    email: string;
    mobile: string ;
    address: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    
}

interface UpdateProps {
  supplierModelOpen: boolean;
  handleCloseUpdateModal: () => void;
  initialData: Supplier | null;
  onUpdateSuccess: () => void;
}

export default function SupplierUpdate({
  supplierModelOpen,
  handleCloseUpdateModal,
  initialData,
  onUpdateSuccess,
}: UpdateProps) {
  const [formData, setFormData] = useState<Supplier>({
    id: 0,
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || 0,
        name: initialData.name || "",
        email: initialData.email || "",
        mobile: initialData.mobile || "",
        address: initialData.address || "",
        bank_name: initialData.bank_name || "",
        bank_account_number: initialData.bank_account_number || "",
      });
    }
  }, [initialData, supplierModelOpen]);

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

  const handleUpdate = async () => {
    try {
      setToast({
        open: true,
        message: "Updating supplier...",
        severity: "info",
      });

      if (!initialData) return;

        const updatedData = {
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            address: formData.address,
            bank_name: formData.bank_name,
            bank_account_number: formData.bank_account_number,
        };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/suppliers/${formData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ id: formData.id, ...updatedData }),
        }
      );

      if (response.ok) {
        setToast({
          open: true,
          message: "Supplier updated successfully!",
          severity: "success",
        });
        handleCloseUpdateModal();
        onUpdateSuccess();
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to update supplier.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      setToast({
        open: true,
        message: "An error has occurred",
        severity: "error",
      });
    }
  };

  return (
    <div>
      <Modal open={supplierModelOpen} onClose={handleCloseUpdateModal}>
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
            Update Supplier
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
            onClick={handleUpdate}
            sx={{ mt: 2 }}
          >
            Update Supplier
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