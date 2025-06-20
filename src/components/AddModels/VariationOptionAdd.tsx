import React, { useState } from "react";
import { Modal, Box, Button, Typography, AlertColor } from "@mui/material";
import FormGenerator from "@/components/main/FormGenerator";
import ToastMessage from "@/components/dashboard/ToastMessage";
import { SelectChangeEvent } from "@mui/material/Select";

interface VariationOption {
  name: string;
  variation_id: number;
}

interface AddProps {
  variationOptionModelOpen: boolean;
  handleCloseAddModal: () => void;
  onAddSuccess: () => void; // Callback to update the UI on success
}

export default function VariationOptionAdd({
  variationOptionModelOpen,
  handleCloseAddModal,
  onAddSuccess,
}: AddProps) {
  const [formData, setFormData] = useState<VariationOption>({
    name: "",
    variation_id: 0,
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
    { name: "name", label: "Option Name", type: "text", field: "text" },
    {
      name: "variation_id",
      label: "Variation",
      type: "selector",
      field: "Selector",
      endPoint: "variations", // Assuming variations are fetched from this endpoint
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = async () => {
    try {
      setToast({
        open: true,
        message: "Adding variation option...",
        severity: "info",
      });

      if (!formData.name || !formData.variation_id) {
        setToast({
          open: true,
          message: "Please fill in all required fields",
          severity: "error",
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/variation-options`, {
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
          message: "Variation option added successfully!",
          severity: "success",
        });
        handleCloseAddModal();
        onAddSuccess(); // Trigger UI update
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to add variation option.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error adding variation option:", error);
      setToast({
        open: true,
        message: "An error has occurred",
        severity: "error",
      });
    }
  };

  return (
    <div>
      <Modal open={variationOptionModelOpen} onClose={handleCloseAddModal}>
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
            Add Variation Option
          </Typography>
          <div className="grid grid-cols-1 gap-6">
            {inputFields.map((field) => (
              <FormGenerator
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                value={formData[field.name as keyof VariationOption]}
                onChange={handleChange}
                endPoint={field.endPoint} // For selector fields
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
            Add Variation Option
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