"use client"
import React, { useState } from "react";
import Title from "@/components/main/Title";
import TextField from "@mui/material/TextField";
import { validator } from "@/lib/validator";
import ToastMessage from "@/components/dashboard/ToastMessage";
import { AlertColor } from "@mui/material";

interface FormData {
  name: string;
  email: string;
  mobile: string;
  address: string;
  bank_name: string;
  bank_account_number: string;
}

interface Errors {
  [key: string]: string | boolean;
}

// interface InputField {
//   name: keyof FormData;
//   label: string;
//   type: string;
// }

export default function SuppliersPage() {


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    bank_name: "",
    bank_account_number: "",
  });
  const [errors, setErrors] = useState<Errors>({});
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
    { name: "name", label: "Full Name", type: "name" },
    { name: "email", label: "Email", type: "email" },
    { name: "mobile", label: "Mobile", type: "mobile" },
    { name: "address", label: "Address", type: "text" },
    { name: "bank_name", label: "Bank Name", type: "text" },
    { name: "bank_account_number", label: "Bank Account Number", type: "text" },
  ];





const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error on change
};

  const handleSubmit = async () => {
    const newErrors: Errors = {};
    inputFields.forEach((field) => {
      const error = validator(formData[field.name as keyof FormData], field.type);
      if (error) newErrors[field.name] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/suppliers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer 3|85MPD3fuiEGXIJYlvgV0PCOhLPVEzLL2JBBJl349f9ff23f6",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setToast({
          open: true,
          message: "Supplier added successfully!",
          severity: "success",
        });
        setFormData({
          name: "",
          email: "",
          mobile: "",
          address: "",
          bank_name: "",
          bank_account_number: "",
        });
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to add supplier.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      setToast({
        open: true,
        message: 'Erros has Occured',
        severity: "error",
      });
    }
  };

  return (
    <div className="">
      <Title
        title="Create Suppliers"
        breadCrumbs={[
          { label: "People", href: "/suppliers" },
          { label: "Suppliers", href: "/suppliers" },
        ]}
        active="add suppliers"
      />

      <div className="mt-7">
        <div className="grid grid-cols-1 cols-1 gap-6">
          {inputFields.map((field) => (
            <TextField
              key={field.name}
              fullWidth
              name={field.name}
              label={field.label}
              variant="outlined"
              value={formData[field.name as keyof FormData]}
              onChange={handleChange}
              error={!!errors[field.name]}
              helperText={errors[field.name]}
              InputProps={{ style: { height: "50px", fontSize: "14px" } }}
              InputLabelProps={{ style: { fontSize: "14px" } }}
            />
          ))}
        </div>
        <div className="mt-5">
          <button
            className="px-3 py-3 rounded-[6px] w-full bg-[#53B175] cursor-pointer text-white"
            onClick={handleSubmit}
          >
            Add Supplier
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