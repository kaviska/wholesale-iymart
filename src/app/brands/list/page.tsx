"use client";
import DataTableMy from "@/components/main/DataTable";
import Title from "@/components/main/Title";
import { useEffect, useState } from "react";
import type { Brand } from "@/types/type"; // Import the Brand type
import UpdateIcon from "@mui/icons-material/Update";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ViewModal from "@/components/main/ViewModal"; // Import the ViewModal component
import DeletModal from "@/components/main/DeleteModal";
import { Modal, Box, TextField, Button, Typography } from "@mui/material";
import ToastMessage from "@/components/dashboard/ToastMessage"; // Import ToastMessage component
import FormGenerator from "@/components/main/FormGenerator"; // Import FormGenerator component
import { AlertColor } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select"; // Import SelectChangeEvent for handling select changes

export default function ViewBrand() {
  const [brands, setBrands] = useState<Brand[]>([]); // Use the Brand type here
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null); // State to hold the selected brand
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [brandModelOpen, setBrandModelOpen] = useState(false);
  const [formData, setFormData] = useState<{ name: string }>({ name: "" });
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
      name: "Name",
      selector: (row: Brand) => row.name,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Brand) => (
        <div className="flex gap-2 cursor-pointer">
          <button
            className="cursor-pointer"
            onClick={() => handleOpenUpdateModal(row)}
          >
            <UpdateIcon fontSize="small" color="primary" />{" "}
            {/* Blue for update */}
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedBrand(row); // Set the selected brand
              setViewModalOpen(true); // Open the modal
            }}
          >
            <RemoveRedEyeIcon fontSize="small" color="action" />{" "}
            {/* Gray for view */}
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setDeleteModalOpen(true); // Open the delete modal
              setSelectedBrand(row); // Set the selected brand for deletion
            }}
          >
            <HighlightOffIcon fontSize="small" color="error" />{" "}
            {/* Red for delete */}
          </button>
        </div>
      ),
    },
  ];

  const fetchBrands = async () => {
    try {
      console.log("Fetching brands from server..."); // Log the fetch action
      const response = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/brands",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }

      const result = await response.json();
      if (result.status === "success") {
        setBrands(result.data);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenUpdateModal = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormData({ name: brand.name }); // Pre-fill the form with the selected brand's data
    setBrandModelOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setBrandModelOpen(false);
    setSelectedBrand(null);
  };

  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      if (!formData.name) {
        setToast({
          open: true,
          message: "Please fill the brand name",
          severity: "error",
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/brands`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: formData.name,
            id: String(selectedBrand?.id), // Ensure the ID is always a string
          }),
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
          message: "Brand updated successfully!",
          severity: "success",
        });
        setBrandModelOpen(false);
        setBrands([]);
        fetchBrands(); // Fetch the updated brands list
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || "Failed to update brand.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating brand:", error);
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
        title="View Brands"
        breadCrumbs={[
          { label: "Product", href: "/products" },
          { label: "Brands", href: "/brands" },
        ]}
        active="list of brands"
      />
      {brands.length === 0 ? (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-2xl text-gray-500">No brands found</h1>
        </div>
      ) : (
        <div className="mt-8">
          <DataTableMy
            columns={columns}
            data={brands} // Pass the brands data to the DataTableMy component
          ></DataTableMy>
        </div>
      )}

      {viewModalOpen && (
        <ViewModal
          onClose={() => setViewModalOpen(false)}
          title="Brands"
          data={brands}
          fields={[{ label: "Name", value: selectedBrand?.name || "N/A" }]}
        />
      )}

           {deleteModalOpen && (
        <DeletModal
          id={String(selectedBrand?.id || "")} // Ensure the ID is always a string
          title="brand"
          url="brands"
          onClose={() => setDeleteModalOpen(false)} // Close the modal
          onDeleteSuccess={() => {
            setBrands([]); // Refresh the brands list on success
            fetchBrands(); // Fetch the updated brands list
          }} // Refresh the brands list on success
          setToast={setToast} // Pass the toast handler
        />
      )}
      {brandModelOpen && (
        <Modal open={brandModelOpen} onClose={handleCloseUpdateModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Update Brand
            </Typography>
            <FormGenerator
              name="name"
              label="Brand Name"
              type="text"
              value={formData.name}
              onChange={handleChange}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleUpdate}
              sx={{ mt: 2 }}
            >
              Update Brand
            </Button>
          </Box>
        </Modal>
      )}

      <ToastMessage
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </div>
  );
}
