import React, { useEffect, useState } from "react";
import { Modal, Box, Button, Typography, AlertColor } from "@mui/material";
import FormGenerator from "@/components/main/FormGenerator";
import ToastMessage from "@/components/dashboard/ToastMessage";
import { SelectChangeEvent } from "@mui/material/Select";

interface VariationOption {
  id: number;
  name: string;
  variation_id: number;
}

interface UpdateProps {
  variationOptionModelOpen: boolean;
  handleCloseUpdateModal: () => void;
  initialData: VariationOption | null;
  onUpdateSuccess: () => void;
}

export default function VariationOptionUpdate({
  variationOptionModelOpen,
  handleCloseUpdateModal,
  initialData,
  onUpdateSuccess,
}: UpdateProps) {
  const [formData, setFormData] = useState<VariationOption>({
    id: 0,
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || 0,
        name: initialData.name || "",
        variation_id: initialData.variation_id || 0,
      });
    }
  }, [initialData, variationOptionModelOpen]);

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

  const handleUpdate = async () => {
    try {
      setToast({
        open: true,
        message: "Updating variation option...",
        severity: "info",
      });

      if (!initialData) return;

      const updatedData = {
        name: formData.name,
        variation_id: formData.variation_id,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/variation-options/${formData.id}`,
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
          message: "Variation option updated successfully!",
          severity: "success",
        });
        handleCloseUpdateModal();
        onUpdateSuccess();
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to update variation option.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating variation option:", error);
      setToast({
        open: true,
        message: "An error has occurred",
        severity: "error",
      });
    }
  };

  return (
    <div>
      <Modal open={variationOptionModelOpen} onClose={handleCloseUpdateModal}>
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
            Update Variation Option
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
            onClick={handleUpdate}
            sx={{ mt: 2 }}
          >
            Update Variation Option
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