"use client";
import DataTableMy from "@/components/main/DataTable";
import Title from "@/components/main/Title";
import { useEffect, useState } from "react";
import type { Supplier } from "@/types/type";
import UpdateIcon from "@mui/icons-material/Update";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ViewModal from "@/components/main/ViewModal";
import DeleteModal from "@/components/main/DeleteModal";
import SupplierUpdate from "@/components/UpdateModels/SupplierUpdate";
import { AlertColor } from "@mui/material";
import ToastMessage from "@/components/dashboard/ToastMessage";

export default function ViewSupplier() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierModelOpen, setSupplierModelOpen] = useState(false);
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
      selector: (row: Supplier) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: Supplier) => row.email,
      sortable: true,
    },
    {
      name: "Mobile",
      selector: (row: Supplier) => row.mobile || "N/A",
      sortable: true,
    },
    {
      name: "Address",
      selector: (row: Supplier) => row.address || "N/A",
      sortable: true,
    },
    {
      name: "Bank Name",
      selector: (row: Supplier) => row.bank_name || "N/A",
      sortable: true,
    },
    {
      name: "Bank Account Number",
      selector: (row: Supplier) => row.bank_account_number || "N/A",
      sortable: true,
    },
    {
      name: "Created At",
      selector: (row: Supplier) => new Date(row.created_at).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Updated At",
      selector: (row: Supplier) => new Date(row.updated_at).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Supplier) => (
        <div className="flex gap-2 cursor-pointer">
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedSupplier(row);
              setSupplierModelOpen(true);
            }}
          >
            <UpdateIcon fontSize="small" color="primary" />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedSupplier(row);
              setViewModalOpen(true);
            }}
          >
            <RemoveRedEyeIcon fontSize="small" color="action" />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setDeleteModalOpen(true);
              setSelectedSupplier(row);
            }}
          >
            <HighlightOffIcon fontSize="small" color="error" />
          </button>
        </div>
      ),
    },
  ];

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/suppliers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }

      const result = await response.json();
      if (result.status === "success") {
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <div>
      <Title
        title="View Suppliers"
        breadCrumbs={[
          { label: "People", href: "/suppliers" },
          { label: "Suppliers", href: "/suppliers" },
        ]}
        active="list of suppliers"
      />
      {suppliers.length === 0 ? (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-2xl text-gray-500">No suppliers found</h1>
        </div>
      ) : (
        <div className="mt-8">
          <DataTableMy columns={columns} data={suppliers} />
        </div>
      )}

      {viewModalOpen && (
        <ViewModal
          onClose={() => setViewModalOpen(false)}
          title="Supplier Details"
          data={suppliers}
          fields={[
            { label: "Name", value: selectedSupplier?.name || "N/A" },
            { label: "Email", value: selectedSupplier?.email || "N/A" },
            { label: "Mobile", value: selectedSupplier?.mobile || "N/A" },
            { label: "Address", value: selectedSupplier?.address || "N/A" },
            { label: "Bank Name", value: selectedSupplier?.bank_name || "N/A" },
            { label: "Bank Account Number", value: selectedSupplier?.bank_account_number || "N/A" },
            {
              label: "Created At",
              value: selectedSupplier?.created_at
                ? new Date(selectedSupplier.created_at).toLocaleDateString()
                : "N/A",
            },
            {
              label: "Updated At",
              value: selectedSupplier?.updated_at
                ? new Date(selectedSupplier.updated_at).toLocaleDateString()
                : "N/A",
            },
          ]}
        />
      )}

      {supplierModelOpen && (
        <SupplierUpdate
          supplierModelOpen={supplierModelOpen}
          handleCloseUpdateModal={() => setSupplierModelOpen(false)}
          initialData={selectedSupplier}
          onUpdateSuccess={() => {
            setSuppliers([]);
            fetchSuppliers();
          }}
        />
      )}

      {deleteModalOpen && (
        <DeleteModal
          id={String(selectedSupplier?.id || "")}
          title="supplier"
          url="suppliers"
          onClose={() => setDeleteModalOpen(false)}
          setToast={setToast}
          onDeleteSuccess={() => {
            setSuppliers([]);
            fetchSuppliers();
          }}
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