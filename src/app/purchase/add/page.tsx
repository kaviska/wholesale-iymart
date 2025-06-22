"use client";
import Title from "@/components/main/Title";
import { useState, useEffect } from "react";
import ToastMessage from "@/components/dashboard/ToastMessage";
import FormGenerator from "@/components/main/FormGenerator";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import { AlertColor } from "@mui/material";
import ProductAdd from "@/components/AddModels/ProductAdd";
import AddIcon from '@mui/icons-material/Add';
import SupplierAdd from "@/components/AddModels/SupplierAdd";
import VariationAdd from "@/components/AddModels/VariationAdd";
import VariationOptionAdd from "@/components/AddModels/VariationOptionAdd";

interface FormData {
  product_id: string;
  quantity: string;
  web_price: string;
  pos_price: string;
  web_discount: string;
  pos_discount: string;
  supplier_id: string;
  cost: string;
  variation_id: string;
  variations: string[];
  purchase_date: string;
  alert_quantity: number;
  barcode: string;
}

interface Variation {
  id: number;
  name: string;
}

export default function Add() {
  const [formData, setFormData] = useState<FormData>({
    product_id: "",
    quantity: "",
    web_price: "0", // Not shown, sent as 0
    pos_price: "",
    web_discount: "0", // Not shown, sent as 0
    pos_discount: "0", // Not shown, sent as 0
    supplier_id: "1", // Always send as 1
    cost: "0", // Not shown, sent as 0
    variation_id: "",
    variations: [],
    purchase_date: new Date().toISOString().split("T")[0],
    alert_quantity: 10,
    barcode: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
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

  const [variation, setVariation] = useState<Variation[]>([]);
  const [variationOptions, setVariationOptions] = useState<Variation[]>([]);
  const [productId, setProductId] = useState<string>("");

  const [productModelOpen, setProductModelOpen] = useState(false);
  const [supplierModelOpen, setSupplierModelOpen] = useState(false);
  const [variationModelOpen, setVariationModelOpen] = useState(false);
  const [variationOptionModelOpen, setVariationOptionModelOpen] = useState(false);
  const [uiChange, setUiChange] = useState(1);

  const handleAddSupplierClick = () => setSupplierModelOpen(true);
  const handleAddVariationClick = () => setVariationModelOpen(true);
  const handleAddVariationOptionClick = () => setVariationOptionModelOpen(true);

  const handleSupplierAddSuccess = () => {
    setSupplierModelOpen(false);
  };

  const handleVariationAddSuccess = () => {
    setVariationModelOpen(false);
    loadVariations();
  };

  const handleVariationOptionAddSuccess = () => {
    setVariationOptionModelOpen(false);
    if (formData.variation_id) {
      loadVariationOptions(parseInt(formData.variation_id, 10));
    }
  };

  const handleCloseSupplierModal = () => setSupplierModelOpen(false);
  const handleCloseVariationModal = () => setVariationModelOpen(false);
  const handleCloseVariationOptionModal = () => setVariationOptionModelOpen(false);

  const handleAddProductClick = () => {
    setProductModelOpen(true);
  };

  const handleCloseProductModal = () => {
    setProductModelOpen(false);
    setUiChange((prev) => prev + 1);
  };

  const handleProductAddSuccess = () => {
    setProductModelOpen(false);
    setUiChange((prev) => prev + 1);
    window.location.reload();
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("product_id");
    if (id) {
      setProductId(id);
      setFormData((prevFormData) => ({
        ...prevFormData,
        product_id: id,
      }));
    }
  }, []);

  const loadVariations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/variations`
      );
      const data = await response.json();
      setVariation(data.data);
    } catch (error) {
      console.error("Error fetching variations:", error);
    }
  };

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

  useEffect(() => {
    loadVariations();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | SelectChangeEvent<string>,
  ) => {
    const { name, value } = e.target;

    if (name === "variation_id") {
      const selectedVariationId = parseInt(value, 10);
      loadVariationOptions(selectedVariationId);
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleVariationOptionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | SelectChangeEvent<string>,
  ) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      variations: [value],
    }));
  };

  const handleSubmit = async () => {
    try {
      setToast({
        open: true,
        message: "Adding product...",
        severity: "info",
      });

      if (
        !formData.product_id ||
        !formData.quantity ||
        !formData.pos_price
      ) {
        setToast({
          open: true,
          message: "Please fill all the fields",
          severity: "error",
        });
        return;
      }

      // Prepare data to send, with fixed/sensible values for removed fields
      const dataToSend = {
        ...formData,
        web_price: "0",
        web_discount: "0",
        pos_discount: "0",
        supplier_id: "1",
        cost: "0",
        purchase_date: formData.purchase_date,
        alert_quantity: formData.alert_quantity,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/stocks`,
        {
          method: "POST",
          body: JSON.stringify(dataToSend),
          headers: {
            "Content-Type": "application/json",
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
        setFormData((prevFormData) => ({
          ...prevFormData,
          quantity: "",
          pos_price: "",
          barcode: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        }));
        setProductId("");
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

  // Only show product, quantity, pos_price, barcode in input fields
  const inputFields = [
    ...(productId
      ? []
      : [
          {
            name: "product_id",
            label: "Product",
            type: "selector",
            field: "selector",
            endPoint: "products?all-products",
          },
        ]),
    { name: "quantity", label: "Quantity", type: "number", field: "number" },
    { name: "pos_price", label: "POS Price", type: "number", field: "number" },
    { name: "barcode", label: "Bar Code", type: "text", field: "text" },
  ];

  return (
    <div className="">
      <Title
        title="Create Purchase"
        breadCrumbs={[
          { label: "Product", href: "/products" },
          { label: "Purchase", href: "/products" },
        ]}
        active="add purchase"
      />

      <div className="flex flex-wrap gap-3 mt-3">
        <button
          onClick={handleAddProductClick}
          className="px-3 py-2 justify-center items-center flex gap-3 cursor-pointer bg-amber-400 text-white rounded-[8px] w-full sm:w-auto"
        >
          <AddIcon /> Add Product
        </button>
        <button
          onClick={handleAddSupplierClick}
          className="px-3 py-2 justify-center items-center flex gap-3 cursor-pointer bg-blue-400 text-white rounded-[8px] w-full sm:w-auto"
        >
          <AddIcon /> Add Supplier
        </button>
        <button
          onClick={handleAddVariationClick}
          className="px-3 py-2 justify-center items-center flex gap-3 cursor-pointer bg-green-400 text-white rounded-[8px] w-full sm:w-auto"
        >
          <AddIcon /> Add Variation
        </button>
        <button
          onClick={handleAddVariationOptionClick}
          className="px-3 py-2 justify-center items-center flex gap-3 cursor-pointer bg-purple-400 text-white rounded-[8px] w-full sm:w-auto"
        >
          <AddIcon /> Add Variation Option
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

          {/* Variation Selector */}
          <FormControl fullWidth>
            <InputLabel id="variation-label">Variation</InputLabel>
            <Select
              labelId="variation-label"
              id="variation-select"
              value={formData.variation_id || ""}
              name="variation_id"
              label="Variation"
              onChange={handleChange}
              sx={{ minWidth: 120, height: 50, fontSize: 14 }}
            >
              <MenuItem value="">
                <em>Select Variation</em>
              </MenuItem>
              {variation.map((varItem) => (
                <MenuItem key={varItem.id} value={varItem.id}>
                  {varItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Variation Option Selector */}
          <FormControl fullWidth>
            <InputLabel id="variation-option-label">Variation Option</InputLabel>
            <Select
              labelId="variation-option-label"
              id="variation-option-select"
              value={formData.variations[0] || ""}
              name="variation_option"
              label="Variation Option"
              onChange={handleVariationOptionChange}
              disabled={!formData.variation_id}
              sx={{ minWidth: 120, height: 50, fontSize: 14 }}
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
        <div className="mt-5">
          <button
            className="px-3 py-3 rounded-[6px] w-full bg-[#53B175] cursor-pointer text-white"
            onClick={handleSubmit}
          >
            Add Purchase
          </button>
        </div>
      </div>

      <ToastMessage
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />

      <ProductAdd
        productModelOpen={productModelOpen}
        handleCloseUpdateModal={handleCloseProductModal}
        onUpdateSuccess={handleProductAddSuccess}
      />

      <SupplierAdd
        supplierModelOpen={supplierModelOpen}
        handleCloseAddModal={handleCloseSupplierModal}
        onAddSuccess={handleSupplierAddSuccess}
      />
      <VariationAdd
        variationModelOpen={variationModelOpen}
        handleCloseAddModal={handleCloseVariationModal}
        onAddSuccess={handleVariationAddSuccess}
      />
    <VariationOptionAdd
        variationOptionModelOpen={variationOptionModelOpen}
        handleCloseAddModal={handleCloseVariationOptionModal}
        onAddSuccess={handleVariationOptionAddSuccess}
      />
    </div>
  );
}