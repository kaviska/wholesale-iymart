"use client";
import Title from "@/components/main/Title";
import { useState, useEffect } from "react";
import ToastMessage from "@/components/dashboard/ToastMessage";
import FormGenerator from "@/components/main/FormGenerator";
import { AlertColor } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

interface FormData {
  name: string;
  slug: string;
  image: File | null; // Added image field
}

// Function to generate slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading or trailing hyphens
};

export default function Add() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    image: null, // Initialize image field
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
    { name: "slug", label: "Category Slug", type: "text", field: "text" },
    { name: "image", label: "Category Image", type: "file", field: "file" }, // Added image field
  ];

  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;

    if (e.target instanceof HTMLInputElement && e.target.type === "file" && e.target.files) {
      setFormData({ ...formData, [name]: e.target.files[0] }); // Handle file input
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Automatically generate slug when the category name changes
  useEffect(() => {
    if (formData.name) {
      const slug = generateSlug(formData.name);
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const handleSubmit = async () => {
    try {
      setToast({
        open: true,
        message: "Adding category...",
        severity: "info",
      });

      // Check if all required fields are filled
      if (!formData.name || !formData.slug) {
        setToast({
          open: true,
          message: "Please fill all the fields",
          severity: "error",
        });
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("slug", formData.slug);
      if (formData.image) {
        formDataToSend.append("image", formData.image); // Append image
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/categories`, {
        method: "POST",
        body: formDataToSend,
        headers: {
          'Authorization': 'Bearer 3|85MPD3fuiEGXIJYlvgV0PCOhLPVEzLL2JBBJl349f9ff23f6',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        setToast({
          open: true,
          message: "Category added successfully!",
          severity: "success",
        });
        setFormData({
          name: "",
          slug: "",
          image: null, // Reset image field
        });
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to add category.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      setToast({
        open: true,
        message: "An error has occurred",
        severity: "error",
      });
    }
  };

  return (
    <div>
      <Title
        title="Create Category"
        breadCrumbs={[
          { label: "Product", href: "/products/list" },
          { label: "Category", href: "/categories" },
        ]}
        active="add categories"
      />

      <div className="mt-7">
        <div className="grid grid-cols-2 cols-1 gap-6">
          {inputFields.map((field) => (
            <FormGenerator
              key={field.name}
              name={field.name}
              label={field.label}
              type={field.type}
              value={formData[field.name as keyof FormData]}
              onChange={handleChange}
            />
          ))}
        </div>
        <div className="mt-5">
          <button
            className="px-3 py-3 rounded-[6px] w-full bg-[#53B175] cursor-pointer text-white"
            onClick={handleSubmit}
          >
            Add Category
          </button>
        </div>
      </div>

      <ToastMessage
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </div>
  );
}