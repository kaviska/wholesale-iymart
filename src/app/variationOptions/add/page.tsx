"use client";
import Title from "@/components/main/Title";
import { useState } from "react";
import ToastMessage from "@/components/dashboard/ToastMessage";
import FormGenerator from "@/components/main/FormGenerator";
import { AlertColor } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

interface FormData {
  name: string;
  variation_id:number
}

export default function AddVariation() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    variation_id:0
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
    { name: "variation_id", label: "Variation ", type: "selector", filed: "Selector", endPoint: "variations" },

    { name: "name", label: "Variation Option Name", type: "text", field: "text" },
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
        message: "Adding variation option...",
        severity: "info",
      });

      // Check if the required field is filled
      if (!formData.name) {
        setToast({
          open: true,
          message: "Please fill the all fields",
          severity: "error",
        });
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("variation_id", formData.variation_id.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/variation-options`, {
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
          message: "Variation added successfully!",
          severity: "success",
        });
        setFormData({
          name: "",
            variation_id:0
        });
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
      <Title
        title="Create Variation"
        breadCrumbs={[
          { label: "Product", href: "/products/list" },
          { label: "Variation", href: "/variations" },
        ]}
        active="add variations"
      />

      <div className="mt-7">
        <div className="grid grid-cols-1 gap-6">
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
        <div className="mt-5">
          <button
            className="px-3 py-3 rounded-[6px] w-full bg-[#53B175] cursor-pointer text-white"
            onClick={handleSubmit}
          >
            Add Variation
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