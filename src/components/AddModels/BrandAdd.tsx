import React, { useState } from "react";
import { Modal, Box, Button, Typography, AlertColor } from "@mui/material";
import FormGenerator from "@/components/main/FormGenerator";
import ToastMessage from "@/components/dashboard/ToastMessage";

interface AddProps {
  brandModelOpen: boolean;
  handleCloseAddModal: () => void;
  onAddSuccess: () => void; // Callback to update the UI on success
}

export default function BrandAdd({
  brandModelOpen,
  handleCloseAddModal,
  onAddSuccess,
}: AddProps) {
  const [formData, setFormData] = useState({
    name: "",
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
    { name: "name", label: "Brand Name", type: "text", field: "text" },
  ];

  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = async () => {
    try {
      setToast({
        open: true,
        message: "Adding brand...",
        severity: "info",
      });

      if (!formData.name) {
        setToast({
          open: true,
          message: "Please enter the brand name",
          severity: "error",
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/brands`, {
        method: "POST",
        body: JSON.stringify({ name: formData.name }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setToast({
          open: true,
          message: "Brand added successfully!",
          severity: "success",
        });
        handleCloseAddModal();
        onAddSuccess(); // Trigger UI update
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to add brand.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error adding brand:", error);
      setToast({
        open: true,
        message: "An error has occurred",
        severity: "error",
      });
    }
  };

  return (
    <div>
      <Modal open={brandModelOpen} onClose={handleCloseAddModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "80vh", // Set a maximum height for the modal
            overflowY: "auto", // Enable vertical scrolling if content exceeds maxHeight
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Add Brand
          </Typography>
          <div className="grid grid-cols-1 gap-4">
            {inputFields.map((field) => (
              <FormGenerator
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                value={formData[field.name as keyof typeof formData]}
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
            Add Brand
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