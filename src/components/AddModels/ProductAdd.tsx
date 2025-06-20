import React, { useState } from "react";
import { Modal, Box, Button, Typography, AlertColor } from "@mui/material";
import FormGenerator from "@/components/main/FormGenerator";
import ToastMessage from "@/components/dashboard/ToastMessage";

interface AddProps {
  productModelOpen: boolean;
  handleCloseUpdateModal: () => void;
  onUpdateSuccess: () => void;
}

export default function ProductAdd({
  productModelOpen,
  handleCloseUpdateModal,
  onUpdateSuccess,
}: AddProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category_id: 0,
    brand_id: 0,
    primary_image: null,
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
    { name: "name", label: "Product Name", type: "text", field: "text" },
    { name: "slug", label: "Product Slug", type: "text", field: "text" },
    {
      name: "description",
      label: "Description",
      type: "text",
      field: "textArea",
    },
    {
      name: "category_id",
      label: "Category ID",
      type: "selector",
      field: "Selector",
      endPoint: "categories?limit=100000",
    },
    {
      name: "brand_id",
      label: "Brand ID",
      type: "selector",
      field: "Selector",
      endPoint: "brands?limit=100000",
    },
    {
      name: "primary_image",
      label: "Primary Image",
      type: "file",
      field: "file",
    },
  ];

  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;

    if (
      e.target instanceof HTMLInputElement &&
      e.target.type === "file" &&
      e.target.files
    ) {
      setFormData({ ...formData, [name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAdd = async () => {
    try {
      setToast({
        open: true,
        message: "Adding product...",
        severity: "info",
      });

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category_id", formData.category_id.toString());
      formDataToSend.append("brand_id", formData.brand_id.toString());

      if (formData.primary_image ) {
        formDataToSend.append("primary_image", formData.primary_image);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products`,
        {
          method: "POST",
          body: formDataToSend,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        setToast({
          open: true,
          message: "Product added successfully!",
          severity: "success",
        });
        handleCloseUpdateModal();
        onUpdateSuccess();
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to add product.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setToast({
        open: true,
        message: "An error has occurred",
        severity: "error",
      });
    }
  };

  return (
    <div>
      <Modal open={productModelOpen} onClose={handleCloseUpdateModal}>
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
            Add Product
          </Typography>
          <div className="grid grid-cols-1 gap-8">
            {inputFields.map((field) => (
              <FormGenerator
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                value={
                  field.type === "file"
                    ? undefined
                    : formData[field.name as keyof typeof formData]
                }
                onChange={handleChange}
                endPoint={field.endPoint}
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
            Add Product
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