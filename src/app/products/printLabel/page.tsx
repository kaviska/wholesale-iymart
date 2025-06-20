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

interface FormData {
  stock_id: string;
  type: string;
  price_name_avilability: string;
  product_id: string;
}

interface Product {
  id: number;
  name: string;
}

export default function Add() {
  const [formData, setFormData] = useState<FormData>({
    stock_id: "",
    type: "",
    price_name_avilability: "",
    product_id: "",
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

  const [product, setProduct] = useState<Product[]>([]);
  const [stock, setStock] = useState<
    { id: number; variationOptionId: number; name: string }[]
  >([]);

  const loadProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products?all-products=true`
      );
      const data = await response.json();
      setProduct(data.data);
    } catch (error) {
      console.error("Error fetching Products:", error);
    }
  };

  const loadStock = async (ProductId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/stocks?product_id=${ProductId}`
      );
      const data = await response.json();
      console.log("Stock Data", data);

      interface VariationStock {
        variation_option_id: number;
        variation_option: {
          name: string;
        };
      }

      interface StockItem {
        id: number;
        barcode?: string;
        purchase_date: string;
        variation_stocks: VariationStock[];
      }

      const formattedStock = data.data.flatMap((stockItem: StockItem) =>
        stockItem.variation_stocks.map((variationStock: VariationStock) => ({
          id: stockItem.id,
          variationOptionId: variationStock.variation_option_id, // Add variation_option_id for unique key
          name: `${variationStock.variation_option.name} - ${
            stockItem.barcode || "No Barcode"
          } - ${stockItem.purchase_date}`,
        }))
      );
      setStock(formattedStock);
    } catch (error) {
      console.error("Error fetching Product options:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | SelectChangeEvent,
    child?: React.ReactNode
  ) => {
    const { name, value } = e.target;

    if (name === "product_id") {
      const selectedProductId = parseInt(value, 10);
      loadStock(selectedProductId);
      setFormData({ ...formData, [name]: value });
    } else if (name === "stock_id") {
      setFormData({ ...formData, [name]: value }); // Ensure stock_id updates correctly
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
        !formData.stock_id ||
        !formData.type ||
        !formData.price_name_avilability
      ) {
        setToast({
          open: true,
          message: "Please fill all the fields",
          severity: "error",
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/stocks/print-label`,
        {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer 3|85MPD3fuiEGXIJYlvgV0PCOhLPVEzLL2JBBJl349f9ff23f6",
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "barcodes.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setToast({
          open: true,
          message: "PDF downloaded successfully!",
          severity: "success",
        });
        setFormData({
          stock_id: "",
          type: "",
          price_name_avilability: "",
          product_id: "",
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

  const inputFields = [
    {
      name: "type",
      label: "Bar Code Type",
      type: "selector",
      endPoint: "bar-code-type",
    },
    {
      name: "price_name_avilability",
      label: "Price Name Availability",
      type: "switch",
      endPoint: "product-types",
    },
  ];

  return (
    <div className="">
      <Title
        title="Print Labels"
        breadCrumbs={[
          { label: "Product", href: "/products" },
          { label: "Print Label", href: "/products" },
        ]}
        active="print label"
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
              endPoint={field.endPoint}
            />
          ))}

          {/* Product Selector */}
          <FormControl fullWidth>
            <InputLabel id="Product-label">Product</InputLabel>
            <Select
              labelId="Product-label"
              id="Product-select"
              value={formData.product_id || ""}
              name="product_id"
              label="Product"
              onChange={handleChange}
              sx={{ minWidth: 120, height: 50, fontSize: 14 }}
            >
              <MenuItem value="">
                <em>Select Product</em>
              </MenuItem>
              {product.map((varItem) => (
                <MenuItem key={varItem.id} value={varItem.id}>
                  {varItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Product Option Selector */}
          <FormControl fullWidth>
            <InputLabel id="Product-option-label">Stock</InputLabel>
            <Select
              labelId="Product-option-label"
              id="Product-option-select"
              value={formData.stock_id || ""}
              name="stock_id"
              label="Stock"
              onChange={handleChange}
              disabled={!formData.product_id} // Disable if no Product is selected
              sx={{ minWidth: 120, height: 50, fontSize: 14 }}
            >
              <MenuItem value="">
                <em>Select Product Option</em>
              </MenuItem>
              {stock.map((option) => (
                <MenuItem
                  key={`${option.id}-${option.variationOptionId}`} // Unique key
                  value={option.id}
                >
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
           Print My Bill
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