"use client";
import Title from "@/components/main/Title";
import { useState } from "react";
import ToastMessage from "@/components/dashboard/ToastMessage";
import FormGenerator from "@/components/main/FormGenerator";
import { AlertColor } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import BrandAdd from "@/components/AddModels/BrandAdd";
import CategoryAdd from "@/components/AddModels/CategoryAdd";
import AddIcon from "@mui/icons-material/Add";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface FormData {
  name: string;
  category_id: string;
  brand_id: string;
}

function randomString(length = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default function Add() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category_id: "",
    brand_id: "",
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

  const [brandModelOpen, setBrandModelOpen] = useState(false);
  const [categoryModelOpen, setCategoryModelOpen] = useState(false);

  const handleAddBrandClick = () => setBrandModelOpen(true);
  const handleAddCategoryClick = () => setCategoryModelOpen(true);

  const handleCloseBrandModal = () => setBrandModelOpen(false);
  const handleCloseCategoryModal = () => setCategoryModelOpen(false);

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

  // Only include name, category_id, brand_id in input fields
  const inputFields = [
    { name: "name", label: "Product Name", type: "text", field: "text" },
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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setToast({
        open: true,
        message: "Adding product...",
        severity: "info",
      });

      if (
        !formData.name ||
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
      formDataToSend.append("slug", randomString(10));
      formDataToSend.append("description", randomString(20));
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("brand_id", formData.brand_id);
      formDataToSend.append("type", "variant");
      formDataToSend.append("web_availability", "true");

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
          category_id: "",
          brand_id: "",
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
      formDataToSend.append("slug", randomString(10));
      formDataToSend.append("description", randomString(20));
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("brand_id", formData.brand_id);
      formDataToSend.append("type", "variant");
      formDataToSend.append("web_availability", "true");

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
          category_id: "",
          brand_id: "",
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