"use client";
import DataTableMy from "@/components/main/DataTable";
import Title from "@/components/main/Title";
import { useEffect, useState } from "react";
import type { Customer } from "@/types/type"; // Import the Customer type
import UpdateIcon from "@mui/icons-material/Update";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ViewModal from "@/components/main/ViewModal"; // Import the ViewModal component
import DeletModal from "@/components/main/DeleteModal";
import { AlertColor } from "@mui/material";
import ToastMessage from "@/components/dashboard/ToastMessage"; // Import ToastMessage component

export default function ViewCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]); // Use the Customer type here
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null); // State to hold the selected customer
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
      selector: (row: Customer) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: Customer) => row.email,
      sortable: true,
    },
    {
      name: "Mobile", // New column for mobile
      selector: (row: Customer) => row.mobile || "N/A", // Display "N/A" if mobile is not available
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Customer) => (
        <div className="flex gap-2 cursor-pointer">
          <button
            className="cursor-pointer"
            onClick={() => console.log("Update clicked")}
          >
            <UpdateIcon fontSize="small" color="primary" />{" "}
            {/* Blue for update */}
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedCustomer(row); // Set the selected customer
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
              setSelectedCustomer(row); // Set the selected customer for deletion
            }}
          >
            <HighlightOffIcon fontSize="small" color="error" />{" "}
            {/* Red for delete */}
          </button>
        </div>
      ),
    },
  ];

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/customers",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const result = await response.json();
      if (result.status === "success") {
        // Filter out customers whose type is "admin"
        const nonAdminCustomers = result.data.filter(
          (customer: Customer) => customer.user_type !== "admin"
        );
        setCustomers(nonAdminCustomers);
      }
      console.log(result); // Use the result as needed
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  console.log("Columns:", columns);
  console.log("Data:", customers);

  return (
    <div>
      <Title
        title="View Customers"
        breadCrumbs={[
          { label: "Users", href: "/users" },
          { label: "Customers", href: "/customers" },
        ]}
        active="list of customers"
      />
      {customers.length === 0 ? (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-2xl text-gray-500">No customers found</h1>
        </div>
      ) : (
        <div className="mt-8">
          <DataTableMy
            columns={columns}
            data={customers} // Pass the customers data to the DataTableMy component
          ></DataTableMy>
        </div>
      )}

      {viewModalOpen && (
        <ViewModal
          onClose={() => setViewModalOpen(false)}
          title="Customers"
          data={customers}
          fields={[
            { label: "Name", value: selectedCustomer?.name || "N/A" },
            { label: "Email", value: selectedCustomer?.email || "N/A" },
          ]}
        />
      )}

      {deleteModalOpen && (
        <DeletModal
          id={String(selectedCustomer?.id || "")} // Ensure the ID is always a string
          title="customer"
          url="customers"
          onClose={() => setDeleteModalOpen(false)} // Close the modal
          setToast={setToast}
          onDeleteSuccess={() => {
            setCustomers([]); // Refresh the customers list on success
            fetchCustomers(); // Fetch the updated customers list
          }} // Callback to update the UI on success
        />
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