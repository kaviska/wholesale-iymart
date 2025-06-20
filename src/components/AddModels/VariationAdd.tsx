import React, { useState } from "react";
import { Modal, Box, Button, Typography, AlertColor } from "@mui/material";
import TextField from "@mui/material/TextField";
import ToastMessage from "@/components/dashboard/ToastMessage";

interface Variation {
  name: string;
}

interface AddProps {
  variationModelOpen: boolean;
  handleCloseAddModal: () => void;
  onAddSuccess: () => void; // Callback to update the UI on success
}

export default function VariationAdd({
  variationModelOpen,
  handleCloseAddModal,
  onAddSuccess,
}: AddProps) {
  const [formData, setFormData] = useState<Variation>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = async () => {
    try {
      setToast({
        open: true,
        message: "Adding variation...",
        severity: "info",
      });

      if (!formData.name) {
        setToast({
          open: true,
          message: "Please enter the variation name",
          severity: "error",
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/variations`, {
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
          message: "Variation added successfully!",
          severity: "success",
        });
        handleCloseAddModal();
        onAddSuccess(); // Trigger UI update
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to add variation.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error adding variation:", error);
      setToast({
        open: true,
        message: "An error has occurred",
        severity: "error",
      });
    }
  };

  return (
    <div>
      <Modal open={variationModelOpen} onClose={handleCloseAddModal}>
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
            Add Variation
          </Typography>
          <div className="grid grid-cols-1 gap-4">
            <TextField
              fullWidth
              name="name"
              label="Variation Name"
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAdd}
            sx={{ mt: 2 }}
          >
            Add Variation
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