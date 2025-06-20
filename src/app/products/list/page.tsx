"use client";
import { useEffect, useState } from "react";
import DataTableMy from "@/components/main/DataTable";
import Title from "@/components/main/Title";
import type { Product } from "@/types/type";
import UpdateIcon from "@mui/icons-material/Update";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ViewModal from "@/components/main/ViewModal";
import DeleteModal from "@/components/main/DeleteModal";
import ProductUpdate from "@/components/UpdateModels/ProductUpdate";
import { AlertColor } from "@mui/material";
import ToastMessage from "@/components/dashboard/ToastMessage";
import Image from "next/image";

export default function List() {
  const [products, setProducts] = useState<Product[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productModelOpen, setProductModelOpen] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const columns = [
    {
      name: "Actions",
       style: {
    maxWidth: "150px", // Set your desired max width
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
      cell: (row: Product) => (
        <div className="flex gap-2 cursor-pointer">
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedProduct(row);
              setProductModelOpen(true);
            }}
          >
            <UpdateIcon fontSize="small" color="primary" />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedProduct(row);
              setViewModalOpen(true);
            }}
          >
            <RemoveRedEyeIcon fontSize="small" color="action" />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setDeleteModalOpen(true);
              setSelectedProduct(row);
            }}
          >
            <HighlightOffIcon fontSize="small" color="error" />
          </button>
        </div>
      ),
    },
    {
      name: "Image",
       style: {
    maxWidth: "150px", // Set your desired max width
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
      cell: (row: Product) => (
        <img
          src={
            (process.env.NEXT_PUBLIC_IMAGE_BASE || "") +
            (row.primary_image ?? "") +
            `?t=${new Date().getTime()}` // Add a timestamp to bust the cache
          }
          alt={row.name}
          width={64}
          height={64}
           className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    {
      name: "Name",
       style: {
    maxWidth: "150px", // Set your desired max width
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
      selector: (row: Product) => row.name,
      sortable: true,
    },
    {
      name: "Slug",
       style: {
    maxWidth: "150px", // Set your desired max width
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
      selector: (row: Product) => row.slug,
      sortable: true,
    },
    {
      name: "Description",
       style: {
    maxWidth: "400px", // Set your desired max width now
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
      selector: (row: Product) => row.description,
    },
    {
      name: "Category",
       style: {
    maxWidth: "150px", // Set your desired max width
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
      selector: (row: Product) => row.category?.name?.toString() || "N/A",
    },
    {
      name: "Brand",
       style: {
    maxWidth: "150px", // Set your desired max width
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
      selector: (row: Product) => row.brand?.name?.toString() || "N/A",
    },
   
  ];

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/products?all-products",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();
      if (result.status === "success") {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <Title
        title="Product List"
        breadCrumbs={[
          { label: "Product", href: "/products" },
          { label: "List", href: "/products/list" },
        ]}
        active="list of products"
      />
      {products.length === 0 ? (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-2xl text-gray-500">No products found</h1>
        </div>
      ) : (
        <div className="mt-8">
          <DataTableMy columns={columns} data={products} />
        </div>
      )}

      {viewModalOpen && (
        <ViewModal
          onClose={() => setViewModalOpen(false)}
          title="Product Details"
          data={products}
          fields={[
            { label: "Name", value: selectedProduct?.name || "N/A" },
            { label: "Slug", value: selectedProduct?.slug || "N/A" },
            { label: "Description", value: selectedProduct?.description || "N/A" },
            { label: "Category", value: selectedProduct?.category?.name || "N/A" },
            { label: "Brand", value: selectedProduct?.brand?.name || "N/A" },
          ]}
        />
      )}

      {productModelOpen && (
        <ProductUpdate
          productModelOpen={productModelOpen}
          handleCloseUpdateModal={() => setProductModelOpen(false)}
          initialData={selectedProduct}
          onUpdateSuccess={() => {
            setProducts([]);
            fetchProducts();
          }}
        />
      )}

      <ToastMessage
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />

      {deleteModalOpen && (
        <DeleteModal
          id={String(selectedProduct?.id || "")}
          title="product"
          url="products"
          onClose={() => setDeleteModalOpen(false)}
          setToast={setToast}
          onDeleteSuccess={() => {
            setProducts([]);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}