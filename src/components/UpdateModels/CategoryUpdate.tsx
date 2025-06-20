import React, { useState } from "react";
import { Modal, Box, Button, Typography, AlertColor } from "@mui/material";
import FormGenerator from "@/components/main/FormGenerator";
import ToastMessage from "@/components/dashboard/ToastMessage";
import { Category } from "@/types/type";



interface UpdateProps {
  categoryModelOpen: boolean;
  handleCloseUpdateModal: () => void;
  initialData: Category | null;
  onUpdateSuccess: () => void; // Callback to update the UI on success
}

export default function Update({
  categoryModelOpen,
  handleCloseUpdateModal,
  initialData,
  onUpdateSuccess
}: UpdateProps) {
  const [formData, setFormData] = useState<Category>({
    id: initialData?.id || 0, // Provide a default value for id
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    image: null,
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
    { name: "name", label: "Category Name", type: "text", field: "text" },
    { name: "slug", label: "Product Slug", type: "text", field: "text" },
    { name: "image", label: "Category Image", type: "file", field: "file",previewUpadte: initialData?.image }, // Added preview for image
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
        message: "Updating category...",
        severity: "info",
      });

      if (!formData.name || !formData.slug) {
        setToast({
          open: true,
          message: "Please fill all the fields",
          severity: "error",
        });
        return;
      }

      const formDataToSend = new FormData();
      if (formData.name !== initialData?.name) {
        formDataToSend.append("name", formData.name);
      }
      if (formData.slug !== initialData?.slug) {
        formDataToSend.append("slug", formData.slug);
      }
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      formDataToSend.append("id", formData.id.toString()); // Always send the id

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/categories/update`, {
        method: "POST",
        body: formDataToSend,
        headers: {
        
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setToast({
          open: true,
          message: "Category updated successfully!",
          severity: "success",
        });
        handleCloseUpdateModal();
        onUpdateSuccess(); // Trigger UI update
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to update category.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      setToast({
        open: true,
        message: "An error has occurred",
        severity: "error",
      });
    }
  };

  return (
    <div>
      <Modal open={categoryModelOpen} onClose={handleCloseUpdateModal}>
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
            Update Category
          </Typography>
          <div className="grid grid-cols-1 gap-4">
            {inputFields.map((field) => (
              <FormGenerator
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                value={field.type === "file" ? undefined : formData[field.name as keyof Category]} // Avoid passing File object directly
                onChange={handleChange}
                previewUpadte={field.previewUpadte} // Pass the preview image if available
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
            Update Category
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