"use client";
import Title from "@/components/main/Title";
import { useState } from "react";
import ToastMessage from "@/components/dashboard/ToastMessage";
import FormGenerator from "@/components/main/FormGenerator";
import { AlertColor } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

interface FormData {
  name: string;
  email: string;
  password: string;
  mobile: string;
  device_name: string;
}

export default function Add() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    mobile: "",
    device_name: "web",
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
    { name: "name", label: "Name", type: "text", field: "text" },
    { name: "email", label: "Email", type: "email", field: "email" },
    { name: "password", label: "Password", type: "password", field: "password" },
    { name: "mobile", label: "Mobile", type: "text", field: "text" },
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
      message: "Adding admin...",
      severity: "info",
    });

    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.mobile) {
      setToast({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    const formDataToSend = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      mobile: formData.mobile,
        device_name: formData.device_name,

      
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/register`, {
      method: "POST",
      body: JSON.stringify(formDataToSend),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      setToast({
        open: true,
        message: "Admin added successfully!",
        severity: "success",
      });
      setFormData({
        name: "",
        email: "",
        password: "",
        mobile: "",
        device_name: "web",
      });

      const result = await response.json();
      console.log("Admin added:", result);

     
    } else {
      const errorData = await response.json();
      setToast({
        open: true,
        message: errorData.message || "Failed to add admin.",
        severity: "error",
      });
    }
  } catch (error) {
    console.error("Error adding admin:", error);
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
        title="Create Admin"
        breadCrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admins", href: "/admins" },
        ]}
        active="add admin"
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
            />
          ))}
        </div>
        <div className="mt-5">
          <button
            className="px-3 py-3 rounded-[6px] w-full bg-[#53B175] cursor-pointer text-white"
            onClick={handleSubmit}
          >
            Add Admin
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