"use client";
import Title from "@/components/main/Title";
import { useState, useEffect } from "react";
import ToastMessage from "@/components/dashboard/ToastMessage";
import FormGenerator from "@/components/main/FormGenerator";
import { AlertColor } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import BrandAdd from "@/components/AddModels/BrandAdd"; // Import Brand Add modal
import CategoryAdd from "@/components/AddModels/CategoryAdd"; // Import Category Add modal
import AddIcon from "@mui/icons-material/Add";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface FormData {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  brand_id: string;
  primary_image: File | null;
  type: string;
  web_availability: string;
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
    description: "",
    category_id: "",
    brand_id: "",
    type: "variant",
    primary_image: null,
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

  const [brandModelOpen, setBrandModelOpen] = useState(false); // State for Brand Add modal
  const [categoryModelOpen, setCategoryModelOpen] = useState(false); // State for Category Add modal

  const handleAddBrandClick = () => setBrandModelOpen(true); // Open Brand Add modal
  const handleAddCategoryClick = () => setCategoryModelOpen(true); // Open Category Add modal

  const handleCloseBrandModal = () => setBrandModelOpen(false); // Close Brand Add modal
  const handleCloseCategoryModal = () => setCategoryModelOpen(false); // Close Category Add modal

  const handleBrandAddSuccess = () => {
    setBrandModelOpen(false);
    setToast({
      open: true,
      message: "Brand added successfully!",
      severity: "success",
    });
    window.location.reload();
  };

  const handleCategoryAddSuccess = () => {
    setCategoryModelOpen(false);
    setToast({
      open: true,
      message: "Category added successfully!",
      severity: "success",
    });
    window.location.reload();
  };

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
      filed: "Selector",
      endPoint: "categories?limit=100000",
    },
    {
      name: "brand_id",
      label: "Brand ID",
      type: "selector",
      filed: "Selector",
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
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    if (
      e.target instanceof HTMLInputElement &&
      e.target.type === "file" &&
      e.target.files
    ) {
      setFormData({ ...formData, [name]: e.target.files[0] }); // Set the selected file
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Automatically generate slug when the product name changes
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
        message: "Adding product...",
        severity: "info",
      });

      if (
        !formData.name ||
        !formData.slug ||
        !formData.description ||
        !formData.category_id ||
        !formData.brand_id
      ) {
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
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("brand_id", formData.brand_id);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("web_availability", formData.web_availability);
      if (formData.primary_image) {
        formDataToSend.append("primary_image", formData.primary_image);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products`,
        {
          method: "POST",
          body: formDataToSend,
          headers: {
            Authorization:
              "Bearer 3|85MPD3fuiEGXIJYlvgV0PCOhLPVEzLL2JBBJl349f9ff23f6",
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
        setFormData({
          name: "",
          slug: "",
          description: "",
          category_id: "",
          brand_id: "",
          primary_image: null,
          type: "fixed",
          web_availability: "true",
        });
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

  const handleSubmitWithStock = async () => {
    try {
      setToast({
        open: true,
        message: "Adding product...",
        severity: "info",
      });

      if (
        !formData.name ||
        !formData.slug ||
        !formData.description ||
        !formData.category_id ||
        !formData.brand_id
      ) {
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
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("brand_id", formData.brand_id);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("web_availability", formData.web_availability);
      if (formData.primary_image) {
        formDataToSend.append("primary_image", formData.primary_image);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products`,
        {
          method: "POST",
          body: formDataToSend,
          headers: {
            Authorization:
              "Bearer 3|85MPD3fuiEGXIJYlvgV0PCOhLPVEzLL2JBBJl349f9ff23f6",
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

        const data = await response.json();
        const id = data.data?.id;

        if (id) {
          window.location.href = `/purchase/add?product_id=${encodeURIComponent(id)}`;
        } else {
          setToast({
            open: true,
            message: "Failed to retrieve product ID.",
            severity: "error",
          });
        }

        setFormData({
          name: "",
          slug: "",
          description: "",
          category_id: "",
          brand_id: "",
          primary_image: null,
          type: "variant",
          web_availability: "true",
        });
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
    <div className="">
      <Title
        title="Create Product"
        breadCrumbs={[
          { label: "Product", href: "/products" },
          { label: "Products", href: "/products" },
        ]}
        active="add products"
      />

      <div className="flex flex-wrap gap-3 mt-3">
        <button
          onClick={handleAddBrandClick}
          className="px-3 py-2 justify-center items-center flex gap-3 cursor-pointer bg-pink-400 text-white rounded-[8px] w-full sm:w-auto"
        >
          <AddIcon /> Add Brand
        </button>
        <button
          onClick={handleAddCategoryClick}
          className="px-3 py-2 justify-center items-center flex gap-3 cursor-pointer bg-teal-400 text-white rounded-[8px] w-full sm:w-auto"
        >
          <AddIcon /> Add Category
        </button>
      </div>

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
              endPoint={field.endPoint}
            />
          ))}

          <FormControl>
            {/* add new selctor call type add two type as variant and fixed default fixed */}
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              id="type-select"
              value={formData.type || ""}
              name="type"
              label="Type"
              onChange={handleChange}
              sx={{ minWidth: 120, height: 50, fontSize: 14 }}
            >
              <MenuItem value="variant">variant</MenuItem>

              <MenuItem value="fixed">Fixed(For item Which has kg)</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            {/* add new selctor call type add two type as variant and fixed default fixed */}
            <InputLabel id="web_availability-label">
              Web Availability
            </InputLabel>
            <Select
              labelId="web_availability-label"
              id="web_availability-select"
              value={formData.web_availability || ""}
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
        <div className="mt-5 flex gap-3">
          <button
            className="px-3 py-3 rounded-[6px] w-full bg-[#53B175] cursor-pointer text-white"
            onClick={handleSubmit}
          >
            Add Product
          </button>

          <button
            className="px-3 py-3 rounded-[6px] w-full bg-[#53B175] cursor-pointer text-white"
            onClick={handleSubmitWithStock}
          >
            Add Product With Stock
          </button>
        </div>
      </div>

      <BrandAdd
        brandModelOpen={brandModelOpen}
        handleCloseAddModal={handleCloseBrandModal}
        onAddSuccess={handleBrandAddSuccess}
      />
      <CategoryAdd
        categoryModelOpen={categoryModelOpen}
        handleCloseAddModal={handleCloseCategoryModal}
        onAddSuccess={handleCategoryAddSuccess}
      />

      <ToastMessage
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </div>
  );
}
