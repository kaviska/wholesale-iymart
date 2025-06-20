"use client";
import DataTableMy from "@/components/main/DataTable";
import Title from "@/components/main/Title";
import { useEffect, useState } from "react";
import type { Category } from '@/types/type'; // Import the Category type
import UpdateIcon from '@mui/icons-material/Update';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ViewModal from "@/components/main/ViewModal"; // Import the ViewModal component
import DeletModal from "@/components/main/DeleteModal";
import { AlertColor } from "@mui/material";
import CategoryUpdate from "@/components/UpdateModels/CategoryUpdate"; // Import CategoryUpdate component 
import ToastMessage from "@/components/dashboard/ToastMessage"; // Import ToastMessage component

export default function ViewCategory() {
  const [categories, setCategories] = useState<Category[]>([]); // Use the Category type here
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null); // State to hold the selected category
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);  
  const [categoryModelOpen, setCategoryModelOpen] = useState(false);
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
      name: "Image",
      cell: (row: Category) => (
        <img
          src={`${process.env.NEXT_PUBLIC_IMAGE_BASE || ""}${row.image ?? ""}?t=${new Date().getTime()}`} // Add a timestamp to bust the cache
          alt={row.name ?? "Category Image"} // Provide a fallback for alt text
          className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    {
      name: "Name",
      selector: (row: Category) => row.name,
      sortable: true,
    },
    {
      name: "Slug",
      selector: (row: Category) => row.slug || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Category) => (
        <div className="flex gap-2 cursor-pointer">
          <button className="cursor-pointer" onClick={() => {
            setSelectedCategory(row); // Set the selected category
            setCategoryModelOpen(true); // Open the update modal
          }}>
            <UpdateIcon fontSize="small" color="primary" /> {/* Blue for update */}
          </button>
          <button className="cursor-pointer" onClick={() => {
            setSelectedCategory(row); // Set the selected category
            setViewModalOpen(true); // Open the modal
          }}>
            <RemoveRedEyeIcon fontSize="small" color="action" /> {/* Gray for view */}
          </button>
          <button className="cursor-pointer" onClick={() => {
            setDeleteModalOpen(true); // Open the delete modal
            setSelectedCategory(row); // Set the selected category for deletion
          }}>
            <HighlightOffIcon fontSize="small" color="error" /> {/* Red for delete */}
          </button>
        </div>
      ),
    }
  ];

  const fetchCategories = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/categories?limit=100000", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const result = await response.json();
      if (result.status === "success") {
        setCategories(result.data);
      }
      console.log(result); // Use the result as needed
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  console.log("Columns:", columns);
  console.log("Data:", categories);

  return (
    <div>
      <Title
      title="View Categories"
      breadCrumbs={[
        { label: "Product", href: "/products" },
        { label: "Categories", href: "/categories" },
      ]}
      active="list of categories"
      />
      {categories.length === 0 ? (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl text-gray-500">No categories found</h1>
      </div>
      ) : (
      <div className="mt-8">
        <DataTableMy
        columns={columns}
        data={categories} // Pass the categories data to the DataTableMy component
        ></DataTableMy>
      </div>
      )}

      {viewModalOpen && (
      <ViewModal onClose={() => setViewModalOpen(false)} title='Categories' data={categories} fields={[
        { label: "Name", value: selectedCategory?.name || "N/A" },
        { label: "Slug", value: selectedCategory?.slug || "N/A" },
      ]}/>
      )}

      {categoryModelOpen && (
      <CategoryUpdate
        categoryModelOpen={categoryModelOpen} // Corrected prop name
        handleCloseUpdateModal={() => setCategoryModelOpen(false)} 
        initialData={selectedCategory} // Pass the selected category data to the form
      onUpdateSuccess={() => {
       
        setCategories([]); // Clear the categories state
        fetchCategories(); // Fetch the updated categories list
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
      <DeletModal
        id={String(selectedCategory?.id || "")} // Ensure the ID is always a string
        title="category"
        url="categories"
        onClose={() => setDeleteModalOpen(false)} // Close the modal
        setToast={setToast}
        onDeleteSuccess={() => {
           setCategories([])
          fetchCategories(); // Fetch the updated categories list
        }}
      />

    
      )}
    </div>
  );
}