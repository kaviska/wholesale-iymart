"use client";
import DataTableMy from "@/components/main/DataTable";
import Title from "@/components/main/Title";
import { useEffect, useState } from "react";
import type { Variation } from "@/types/type";
import UpdateIcon from "@mui/icons-material/Update";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ViewModal from "@/components/main/ViewModal";
import DeleteModal from "@/components/main/DeleteModal";
import VariationUpdate from "@/components/UpdateModels/VariationUpdate";
import { AlertColor } from "@mui/material";
import ToastMessage from "@/components/dashboard/ToastMessage";

export default function ViewVariation() {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [variationModelOpen, setVariationModelOpen] = useState(false);
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
      selector: (row: Variation) => row.name,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Variation) => (
        <div className="flex gap-2 cursor-pointer">
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedVariation(row);
              setVariationModelOpen(true);
            }}
          >
            <UpdateIcon fontSize="small" color="primary" />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedVariation(row);
              setViewModalOpen(true);
            }}
          >
            <RemoveRedEyeIcon fontSize="small" color="action" />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setDeleteModalOpen(true);
              setSelectedVariation(row);
            }}
          >
            <HighlightOffIcon fontSize="small" color="error" />
          </button>
        </div>
      ),
    },
  ];

  const fetchVariations = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/variations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch variations");
      }

      const result = await response.json();
      if (result.status === "success") {
        setVariations(result.data);
      }
    } catch (error) {
      console.error("Error fetching variations:", error);
    }
  };

  useEffect(() => {
    fetchVariations();
  }, []);

  return (
    <div>
      <Title
        title="View Variations"
        breadCrumbs={[
          { label: "Product", href: "/products" },
          { label: "Variations", href: "/variations" },
        ]}
        active="list of variations"
      />
      {variations.length === 0 ? (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-2xl text-gray-500">No variations found</h1>
        </div>
      ) : (
        <div className="mt-8">
          <DataTableMy columns={columns} data={variations} />
        </div>
      )}

      {viewModalOpen && (
        <ViewModal
          onClose={() => setViewModalOpen(false)}
          title="Variation Details"
          data={variations}
          fields={[
            { label: "Name", value: selectedVariation?.name || "N/A" },
          ]}
        />
      )}

      {variationModelOpen && (
        <VariationUpdate
          variationModelOpen={variationModelOpen}
          handleCloseUpdateModal={() => setVariationModelOpen(false)}
          initialData={selectedVariation}
          onUpdateSuccess={() => {
            setVariations([]);
            fetchVariations();
          }}
        />
      )}

      {deleteModalOpen && (
        <DeleteModal
          id={String(selectedVariation?.id || "")}
          title="variation"
          url="variations"
          onClose={() => setDeleteModalOpen(false)}
          setToast={setToast}
          onDeleteSuccess={() => {
            setVariations([]);
            fetchVariations();
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