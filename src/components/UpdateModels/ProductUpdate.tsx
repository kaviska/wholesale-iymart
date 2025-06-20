import React, { useEffect, useState } from "react";
import { Modal, Box, Button, Typography, AlertColor, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import FormGenerator from "@/components/main/FormGenerator";
import ToastMessage from "@/components/dashboard/ToastMessage";
import { Product } from "@/types/type";

interface UpdateProps {
  productModelOpen: boolean;
  handleCloseUpdateModal: () => void;
  initialData: Product | null;
  onUpdateSuccess: () => void;
}

export default function ProductUpdate({
  productModelOpen,
  handleCloseUpdateModal,
  initialData,
  onUpdateSuccess,
}: UpdateProps) {
  const [formData, setFormData] = useState<Product & { type?: string; web_availability?: string }>({
    id: 0,
    name: "",
    slug: "",
    description: "",
    category_id: 0,
    brand_id: 0,
    primary_image: null,
    type: "fixed",
    web_availability: "true",
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
        slug: initialData.slug || "",
        description: initialData.description || "",
        category_id: initialData.category_id || 0,
        brand_id: initialData.brand_id || 0,
        primary_image: initialData.primary_image || null,
        type: (initialData as any).type || "fixed",
        web_availability: (initialData as any).web_availability || "true",
      });
    }
  }, [initialData, productModelOpen]);

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
      preview: initialData?.primary_image,
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

  const handleUpdate = async () => {
    try {
      setToast({
        open: true,
        message: "Updating product...",
        severity: "info",
      });

      if (!initialData) return;

      const formDataToSend = new FormData();
      formDataToSend.append("id", formData.id.toString());

      // Append only changed fields
      if (formData.name !== initialData.name) {
        formDataToSend.append("name", formData.name);
      }

      if (formData.slug !== initialData.slug) {
        formDataToSend.append("slug", formData.slug);
      }

      if (formData.description !== initialData.description) {
        formDataToSend.append("description", formData.description);
      }

      if (formData.category_id !== initialData.category_id) {
        formDataToSend.append("category_id", formData.category_id.toString());
      }

      if (formData.brand_id !== initialData.brand_id) {
        formDataToSend.append("brand_id", formData.brand_id.toString());
      }

      // Always send type and web_availability
      formDataToSend.append("type", formData.type || "fixed");
      formDataToSend.append("web_availability", formData.web_availability || "true");

      // Check if the image has changed or is a new file
      if (
        formData.primary_image instanceof File || // New image uploaded
        formData.primary_image !== initialData.primary_image // Image changed
      ) {
        formDataToSend.append("primary_image", formData.primary_image as File);
      }

      // Debug log
      // console.log("🔍 FormData being sent:");
      // for (const [key, value] of formDataToSend.entries()) {
      //   console.log(`${key}:`, value);
      // }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products/update`,
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
          message: "Product updated successfully!",
          severity: "success",
        });
        handleCloseUpdateModal();
        onUpdateSuccess();
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to update product.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
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
            Update Product
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
                    : typeof formData[field.name as keyof Product] === "object"
                    ? (formData[field.name as keyof Product] as any)?.id || ""
                    : formData[field.name as keyof Product]
                }
                onChange={handleChange}
                endPoint={field.endPoint}
                previewUpadte={String(field.preview) || ""} // Pass the preview
              />
            ))}

            {/* Type Selector */}
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                id="type-select"
                value={formData.type || "fixed"}
                name="type"
                label="Type"
                onChange={handleChange}
                sx={{ minWidth: 120, height: 50, fontSize: 14 }}
              >
                <MenuItem value="fixed">Fixed</MenuItem>
                <MenuItem value="variant">Variant</MenuItem>
              </Select>
            </FormControl>

            {/* Web Availability Selector */}
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="web_availability-label">Web Availability</InputLabel>
              <Select
                labelId="web_availability-label"
                id="web_availability-select"
                value={formData.web_availability || "true"}
                name="web_availability"
                label="Web Availability"
                onChange={handleChange}
                sx={{ minWidth: 120, height: 50, fontSize: 14 }}
              >
                <MenuItem value="true">True</MenuItem>
                <MenuItem value="false">False</MenuItem>
              </Select>
            </FormControl>
          </div>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleUpdate}
            sx={{ mt: 2 }}
          >
            Update Product
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