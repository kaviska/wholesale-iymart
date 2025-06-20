import React, { useEffect, useState } from "react";
import { Modal, Box, Button, Typography, AlertColor } from "@mui/material";
import FormGenerator from "@/components/main/FormGenerator";
import ToastMessage from "@/components/dashboard/ToastMessage";
import { SelectChangeEvent } from "@mui/material/Select";

interface Variation {
  id: number;
  name: string;
}

interface UpdateProps {
  variationModelOpen: boolean;
  handleCloseUpdateModal: () => void;
  initialData: Variation | null;
  onUpdateSuccess: () => void;
}

export default function VariationUpdate({
  variationModelOpen,
  handleCloseUpdateModal,
  initialData,
  onUpdateSuccess,
}: UpdateProps) {
  const [formData, setFormData] = useState<Variation>({
    id: 0,
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || 0,
        name: initialData.name || "",
      });
    }
  }, [initialData, variationModelOpen]);

  const inputFields = [
    { name: "name", label: "Variation Name", type: "text", field: "text" },
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
        message: "Updating variation...",
        severity: "info",
      });

      if (!initialData) return;

      const updatedData = {
        name: formData.name,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/variations/${formData.id}`,
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
          message: "Variation updated successfully!",
          severity: "success",
        });
        handleCloseUpdateModal();
        onUpdateSuccess();
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to update variation.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating variation:", error);
      setToast({
        open: true,
        message: "An error has occurred",
        severity: "error",
      });
    }
  };

  return (
    <div>
      <Modal open={variationModelOpen} onClose={handleCloseUpdateModal}>
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
            Update Variation
          </Typography>
          <div className="grid grid-cols-1 gap-6">
            {inputFields.map((field) => (
              <FormGenerator
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                value={formData[field.name as keyof Variation]}
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
            Update Variation
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