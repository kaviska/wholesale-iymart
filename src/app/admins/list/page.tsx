"use client";
import DataTableMy from "@/components/main/DataTable";
import Title from "@/components/main/Title";
import { useEffect, useState } from "react";
import type { Admin } from "@/types/type"; // Import the Admin type
import UpdateIcon from "@mui/icons-material/Update";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ViewModal from "@/components/main/ViewModal"; // Import the ViewModal component
import DeletModal from "@/components/main/DeleteModal";
import { AlertColor } from "@mui/material";
import ToastMessage from "@/components/dashboard/ToastMessage"; // Import ToastMessage component

export default function ViewAdmin() {
  const [admins, setAdmins] = useState<Admin[]>([]); // Use the Admin type here
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null); // State to hold the selected admin
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
      selector: (row: Admin) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: Admin) => row.email,
      sortable: true,
    },
    {
      name: "Mobile", // New column for mobile
      selector: (row: Admin) => row.mobile || "N/A", // Display "N/A" if mobile is not available
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Admin) => (
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
              setSelectedAdmin(row); // Set the selected admin
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
              setSelectedAdmin(row); // Set the selected admin for deletion
            }}
          >
            <HighlightOffIcon fontSize="small" color="error" />{" "}
            {/* Red for delete */}
          </button>
        </div>
      ),
    },
  ];

  const fetchAdmins = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/admin",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }

      const result = await response.json();
      if (result.status === "success") {
        setAdmins(result.data);
      }
      console.log(result); // Use the result as needed
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  console.log("Columns:", columns);
  console.log("Data:", admins);

  return (
    <div>
      <Title
        title="View Admins"
        breadCrumbs={[
          { label: "Users", href: "/users" },
          { label: "Admins", href: "/admins" },
        ]}
        active="list of admins"
      />
      {admins.length === 0 ? (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-2xl text-gray-500">No admins found</h1>
        </div>
      ) : (
        <div className="mt-8">
          <DataTableMy
            columns={columns}
            data={admins} // Pass the admins data to the DataTableMy component
          ></DataTableMy>
        </div>
      )}

      {viewModalOpen && (
        <ViewModal
          onClose={() => setViewModalOpen(false)}
          title="Admins"
          data={admins}
          fields={[
            { label: "Name", value: selectedAdmin?.name || "N/A" },
            { label: "Email", value: selectedAdmin?.email || "N/A" },
          ]}
        />
      )}

      {deleteModalOpen && (
        <DeletModal
          id={String(selectedAdmin?.id || "")} // Ensure the ID is always a string
          title="admin"
          url="admin"
          onClose={() => setDeleteModalOpen(false)} // Close the modal
          setToast={setToast}
          onDeleteSuccess={() => {
            setAdmins([]); // Refresh the admins list on success
            fetchAdmins(); // Fetch the updated admins list
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
