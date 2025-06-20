import React, { useState, useEffect } from "react";
import { Modal, Box, Button, Typography, AlertColor } from "@mui/material";
import FormGenerator from "@/components/main/FormGenerator";
import ToastMessage from "@/components/dashboard/ToastMessage";
import { SelectChangeEvent } from "@mui/material/Select";
import { Variation } from "@/types/type";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface Purchase {
  id: number;
  product_id: number;
  quantity: number;
  web_price: number;
  pos_price: number;
  web_discount: number;
  pos_discount: number;
  cost: number;
  alert_quantity: number;
  purchase_date: string;
  barcode: string | null;
  supplier_id: number;
  variation_id: number | null | string | undefined;
  variation_option_id: number | null | string | undefined;
}

interface FormData {
  id: number;
  product_id: number;
  quantity: number;
  web_price: number;
  pos_price: number;
  web_discount: number;
  pos_discount: number;
  supplier_id: number;
  cost: number;
  alert_quantity: number;
  purchase_date: string;
  barcode: string | null;
  variation_id: number | null | string | undefined;
  variation_option_id: number | null | string | undefined;
}

interface UpdateProps {
  purchaseModelOpen: boolean;
  handleCloseUpdateModal: () => void;
  initialData: Purchase | null;
  onUpdateSuccess: () => void;
}

export default function PurchaseUpdate({
  purchaseModelOpen,
  handleCloseUpdateModal,
  initialData,
  onUpdateSuccess,
}: UpdateProps) {
  const [formData, setFormData] = useState<FormData>({
    id: initialData?.id || 0,
    product_id: initialData?.product_id || 0,
    quantity: initialData?.quantity || 0,
    web_price: initialData?.web_price || 0,
    pos_price: initialData?.pos_price || 0,
    web_discount: initialData?.web_discount || 0,
    pos_discount: initialData?.pos_discount || 0,
    supplier_id: initialData?.supplier_id || 0,
    cost: initialData?.cost || 0,
    purchase_date:
      initialData?.purchase_date || new Date().toISOString().split("T")[0],
    alert_quantity: initialData?.alert_quantity || 10,
    barcode: initialData?.barcode || "",
    variation_id: initialData?.variation_id ?? "",
    variation_option_id: initialData?.variation_option_id ?? "",
  });

  useEffect(() => {
    setFormData({
      id: initialData?.id || 0,
      product_id: initialData?.product_id || 0,
      quantity: initialData?.quantity || 0,
      web_price: initialData?.web_price || 0,
      pos_price: initialData?.pos_price || 0,
      web_discount: initialData?.web_discount || 0,
      pos_discount: initialData?.pos_discount || 0,
      supplier_id: initialData?.supplier_id || 0,
      cost: initialData?.cost || 0,
      purchase_date:
        initialData?.purchase_date || new Date().toISOString().split("T")[0],
      alert_quantity: initialData?.alert_quantity || 10,
      barcode: initialData?.barcode || "",
      variation_id: initialData?.variation_id ?? "",
      variation_option_id: initialData?.variation_option_id ?? "",
    });
  }, [initialData]);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [variations, setVariations] = useState<Variation[]>([]);
  const [variationOptions, setVariationOptions] = useState<Variation[]>([]);

  useEffect(() => {
    const loadVariations = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/variations`
        );
        const data = await response.json();
        setVariations(data.data);
      } catch (error) {
        console.error("Error fetching variations:", error);
      }
    };

    loadVariations();
  }, []);

  const loadVariationOptions = async (variationId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/variation-options?variation_id=${variationId}`
      );
      const data = await response.json();
      setVariationOptions(data.data);
    } catch (error) {
      console.error("Error fetching variation options:", error);
    }
  };

  // Ensure all number fields are numbers before sending to API
  const sanitizeFormData = (data: FormData) => {
    return {
      ...data,
      product_id: data.product_id ? Number(data.product_id) : 0,
      quantity: data.quantity ? Number(data.quantity) : 0,
      web_price: data.web_price ? Number(data.web_price) : 0,
      pos_price: data.pos_price ? Number(data.pos_price) : 0,
      web_discount: data.web_discount ? Number(data.web_discount) : 0,
      pos_discount: data.pos_discount ? Number(data.pos_discount) : 0,
      supplier_id: data.supplier_id ? Number(data.supplier_id) : 0,
      cost: data.cost ? Number(data.cost) : 0,
      alert_quantity: data.alert_quantity ? Number(data.alert_quantity) : 0,
      variation_id:
        data.variation_id === "" || data.variation_id === undefined
          ? null
          : Number(data.variation_id),
      variation_option_id:
        data.variation_option_id === "" || data.variation_option_id === undefined
          ? null
          : Number(data.variation_option_id),
    };
  };

  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;

    // List of fields that should be numbers
    const numberFields = [
      "product_id",
      "quantity",
      "web_price",
      "pos_price",
      "web_discount",
      "pos_discount",
      "supplier_id",
      "cost",
      "alert_quantity",
      "variation_id",
      "variation_option_id",
    ];

    if (name === "variation_id") {
      const selectedVariationId = value === "" ? "" : Number(value);
      if (selectedVariationId) loadVariationOptions(selectedVariationId as number);
      setFormData({
        ...formData,
        variation_id: selectedVariationId,
        variation_option_id: "",
      });
    } else if (numberFields.includes(name)) {
      setFormData({
        ...formData,
        [name]: value === "" ? "" : Number(value),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdate = async () => {
    try {
      setToast({
        open: true,
        message: "Updating purchase...",
        severity: "info",
      });

      const sanitizedData = sanitizeFormData(formData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/pos-stocks-update`,
        {
          method: "POST",
          body: JSON.stringify(sanitizedData),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        setToast({
          open: true,
          message: "Purchase updated successfully!",
          severity: "success",
        });
        handleCloseUpdateModal();
        onUpdateSuccess();
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to update purchase.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating purchase:", error);
      setToast({
        open: true,
        message: "An error has occurred",
        severity: "error",
      });
    }
  };

  const inputFields = [
    {
      name: "product_id",
      label: "Product",
      type: "selector",
      field: "selector",
      endPoint: "products?all-products=true",
    },
    { name: "quantity", label: "Quantity", type: "text", field: "text" },
    { name: "web_price", label: "Web Price", type: "text", field: "text" },
    { name: "pos_price", label: "POS Price", type: "text", field: "text" },
    {
      name: "web_discount",
      label: "Web Discount",
      type: "text",
      field: "text",
    },
    {
      name: "pos_discount",
      label: "POS Discount",
      type: "text",
      field: "text",
    },
    {
      name: "supplier_id",
      label: "Supplier",
      type: "selector",
      field: "selector",
      endPoint: "suppliers",
    },
    {
      name: "purchase_date",
      label: "Purchase Date",
      type: "date",
      field: "date",
    },
    { name: "cost", label: "Cost", type: "text", field: "text" },
    {
      name: "alert_quantity",
      label: "Alert Quantity",
      type: "number",
      field: "number",
    },
    { name: "barcode", label: "Bar Code", type: "text", field: "text" },
  ];

  return (
    <div>
      <Modal open={purchaseModelOpen} onClose={handleCloseUpdateModal}>
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
            Update Purchase
          </Typography>
          <div className="grid grid-cols-1 gap-8">
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
            <FormControl fullWidth>
              <InputLabel id="variation-label">Variation</InputLabel>
              <Select
                labelId="variation-label"
                id="variation-select"
                value={formData.variation_id ? String(formData.variation_id) : ""}
                name="variation_id"
                label="Variation"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Select Variation</em>
                </MenuItem>
                {variations.map((variation) => (
                  <MenuItem key={variation.id} value={variation.id}>
                    {variation.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="variation-option-label">Variation Option</InputLabel>
              <Select
                labelId="variation-option-label"
                id="variation-option-select"
                value={
                  formData.variation_option_id
                    ? String(formData.variation_option_id)
                    : ""
                }
                name="variation_option_id"
                label="Variation Option"
                onChange={handleChange}
                disabled={!formData.variation_id}
              >
                <MenuItem value="">
                  <em>Select Variation Option</em>
                </MenuItem>
                {variationOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
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
            Update Purchase
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