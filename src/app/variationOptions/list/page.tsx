"use client";
import DataTableMy from "@/components/main/DataTable";
import Title from "@/components/main/Title";
import { useEffect, useState } from "react";
import type { VariationOption } from "@/types/type";
import UpdateIcon from "@mui/icons-material/Update";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ViewModal from "@/components/main/ViewModal";
import DeleteModal from "@/components/main/DeleteModal";
import VariationOptionUpdate from "@/components/UpdateModels/VariationOptionUpdate";
import { AlertColor } from "@mui/material";
import ToastMessage from "@/components/dashboard/ToastMessage";

export default function ViewVariationOptions() {
  const [variationOptions, setVariationOptions] = useState<VariationOption[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedVariationOption, setSelectedVariationOption] = useState<VariationOption | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [variationOptionModelOpen, setVariationOptionModelOpen] = useState(false);
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
      selector: (row: VariationOption) => row.name,
      sortable: true,
    },
    {
      name: "Variation",
      selector: (row: VariationOption) => row.variation?.name || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: VariationOption) => (
        <div className="flex gap-2 cursor-pointer">
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedVariationOption(row);
              setVariationOptionModelOpen(true);
            }}
          >
            <UpdateIcon fontSize="small" color="primary" />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedVariationOption(row);
              setViewModalOpen(true);
            }}
          >
            <RemoveRedEyeIcon fontSize="small" color="action" />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setDeleteModalOpen(true);
              setSelectedVariationOption(row);
            }}
          >
            <HighlightOffIcon fontSize="small" color="error" />
          </button>
        </div>
      ),
    },
  ];

  const fetchVariationOptions = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/variation-options", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch variation options");
      }

      const result = await response.json();
      if (result.status === "success") {
        setVariationOptions(result.data);
      }
    } catch (error) {
      console.error("Error fetching variation options:", error);
    }
  };

  useEffect(() => {
    fetchVariationOptions();
  }, []);

  return (
    <div>
      <Title
        title="View Variation Options"
        breadCrumbs={[
          { label: "Product", href: "/products" },
          { label: "Variation Options", href: "/variationOptions" },
        ]}
        active="list of variation options"
      />
      {variationOptions.length === 0 ? (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-2xl text-gray-500">No variation options found</h1>
        </div>
      ) : (
        <div className="mt-8">
          <DataTableMy columns={columns} data={variationOptions} />
        </div>
      )}

      {viewModalOpen && (
        <ViewModal
          onClose={() => setViewModalOpen(false)}
          title="Variation Option Details"
          data={variationOptions}
          fields={[
            { label: "Name", value: selectedVariationOption?.name || "N/A" },
            { label: "Variation", value: selectedVariationOption?.variation?.name || "N/A" },
          ]}
        />
      )}

      {variationOptionModelOpen && (
        <VariationOptionUpdate
          variationOptionModelOpen={variationOptionModelOpen}
          handleCloseUpdateModal={() => setVariationOptionModelOpen(false)}
          initialData={
            {
              id: selectedVariationOption?.id ?? 0,
              name: selectedVariationOption?.name ?? "",
              variation_id: selectedVariationOption?.variation?.id ?? 0,
            }
          }
          onUpdateSuccess={() => {
            setVariationOptions([]);
            fetchVariationOptions();
          }}
        />
      )}

      {deleteModalOpen && (
        <DeleteModal
          id={String(selectedVariationOption?.id || "")}
          title="variation option"
          url="variation-options"
          onClose={() => setDeleteModalOpen(false)}
          setToast={setToast}
          onDeleteSuccess={() => {
            setVariationOptions([]);
            fetchVariationOptions();
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