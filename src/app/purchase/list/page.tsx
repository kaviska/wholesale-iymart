"use client";
import { useEffect, useState } from "react";
import DataTableMy from "@/components/main/DataTable";
import Title from "@/components/main/Title";
import UpdateIcon from "@mui/icons-material/Update";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ViewModal from "@/components/main/ViewModal";
import DeleteModal from "@/components/main/DeleteModal";
import PurchaseUpdate from "@/components/UpdateModels/PurchaseUpdate";
import { AlertColor } from "@mui/material";
import ToastMessage from "@/components/dashboard/ToastMessage";

interface Purchase {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    description: string;
    primary_image: string;
  };
  quantity: number;
  web_price: number;
  pos_price: number;
  web_discount: number;
  pos_discount: number;
  cost: number;
  alert_quantity: number;
  purchase_date: string;
  barcode: string | null;
  supplier_id: number;
  variation_stocks: Array<{
    id: number;
    variation_option_id:number
    variation_option: {
      id: number;
      variation_id: number;
      name: string;
    };
  }> | null;


}

export default function List() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [purchaseModelOpen, setPurchaseModelOpen] = useState(false);
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
      cell: (row: Purchase) => (
        <div className="flex gap-2 cursor-pointer">
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedPurchase(row);
              setPurchaseModelOpen(true);
            }}
          >
            <UpdateIcon fontSize="small" color="primary" />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedPurchase(row);
              setViewModalOpen(true);
            }}
          >
            <RemoveRedEyeIcon fontSize="small" color="action" />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              setDeleteModalOpen(true);
              setSelectedPurchase(row);
            }}
          >
            <HighlightOffIcon fontSize="small" color="error" />
          </button>
        </div>
      ),
    },
    {
      name: "Image",
      cell: (row: Purchase) =>
        row.product && row.product.primary_image ? (
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE}${row.product.primary_image}`}
            alt={row.product?.name || "Product Image"}
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <span>N/A</span>
        ),
    },
    {
      name: "Product Name",
      selector: (row: Purchase) => row.product?.name || "N/A",
      sortable: true,
    },
    {
      name: "Quantity",
      selector: (row: Purchase) => row.quantity?.toString() || "N/A",
      sortable: true,
    },
    {
      name: "Web Price",
      selector: (row: Purchase) => `¥${row.web_price?.toFixed(2) || "0.00"}`,
      sortable: true,
    },
    {
      name: "POS Price",
      selector: (row: Purchase) => `¥${row.pos_price?.toFixed(2) || "0.00"}`,
      sortable: true,
    },
    {
      name: "Web Discount",
      selector: (row: Purchase) => `${row.web_discount || "0"}`,
      sortable: true,
    },
    {
      name: "POS Discount",
      selector: (row: Purchase) => `${row.pos_discount || "0"}`,
      sortable: true,
    },
    {
      name: "Variation Option",
      selector: (row: Purchase) =>
        row.variation_stocks &&
        row.variation_stocks.length > 0 &&
        row.variation_stocks[0]?.variation_option?.name
          ? row.variation_stocks[0].variation_option.name
          : "N/A",
      sortable: true,
    },
    {
      name: "Cost",
      selector: (row: Purchase) => `¥${row.cost?.toFixed(2) || "0.00"}`,
      sortable: true,
    },
    {
      name: "Alert Quantity",
      selector: (row: Purchase) => row.alert_quantity?.toString() || "N/A",
      sortable: true,
    },
    {
      name: "Purchase Date",
      selector: (row: Purchase) => row.purchase_date || "N/A",
      sortable: true,
    },
    {
      name: "Barcode",
      selector: (row: Purchase) => row.barcode || "N/A",
      sortable: true,
    },
  ];

  const fetchPurchases = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/all-stocks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch purchases");
      }

      const result = await response.json();
      if (result.status === "success") {
        setPurchases(result.data);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <div>
      <Title
        title="Purchase List"
        breadCrumbs={[
          { label: "Product", href: "/products" },
          { label: "Purchase", href: "/purchase/list" },
        ]}
        active="list of purchases"
      />
      {purchases.length === 0 ? (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-2xl text-gray-500">No purchases found</h1>
        </div>
      ) : (
        <div className="mt-8">
          <DataTableMy columns={columns} data={purchases} />
        </div>
      )}

      {viewModalOpen && (
        <ViewModal
          onClose={() => setViewModalOpen(false)}
          title="Purchase Details"
          data={purchases}
          fields={[
            { label: "Product Name", value: selectedPurchase?.product.name || "N/A" },
            { label: "Quantity", value: selectedPurchase?.quantity.toString() || "N/A" },
            { label: "Web Price", value: `¥${selectedPurchase?.web_price.toFixed(2)}` || "N/A" },
            { label: "POS Price", value: `¥${selectedPurchase?.pos_price.toFixed(2)}` || "N/A" },
            { label: "Web Discount", value: selectedPurchase?.web_discount.toString() || "N/A" },
            { label: "POS Discount", value: selectedPurchase?.pos_discount.toString() || "N/A" },
            { label: "Cost", value: `¥${selectedPurchase?.cost.toFixed(2)}` || "N/A" },
            { label: "Alert Quantity", value: selectedPurchase?.alert_quantity.toString() || "N/A" },
            { label: "Purchase Date", value: selectedPurchase?.purchase_date || "N/A" },
            { label: "Barcode", value: selectedPurchase?.barcode || "N/A" },
          ]}
        />
      )}

      {purchaseModelOpen && (
        <PurchaseUpdate
          purchaseModelOpen={purchaseModelOpen}
          handleCloseUpdateModal={() => setPurchaseModelOpen(false)}
          initialData={{
            id: selectedPurchase?.id ?? 0,
            product_id: selectedPurchase?.product.id ?? 0,
            quantity: selectedPurchase?.quantity ?? 0,
            web_price: selectedPurchase?.web_price ?? 0,
            pos_price: selectedPurchase?.pos_price ?? 0,
            web_discount: selectedPurchase?.web_discount ?? 0,
            pos_discount: selectedPurchase?.pos_discount ?? 0,
            cost: selectedPurchase?.cost ?? 0,
            alert_quantity: selectedPurchase?.alert_quantity ?? 0,
            purchase_date: selectedPurchase?.purchase_date ?? "",
            barcode: selectedPurchase?.barcode ?? "",
            supplier_id: selectedPurchase?.supplier_id ?? 0,
            variation_id: selectedPurchase?.variation_stocks?.[0].variation_option.variation_id ?? 0,
            variation_option_id: selectedPurchase?.variation_stocks?.[0].variation_option_id ?? 0,
           
          }}
          onUpdateSuccess={() => {
            setPurchases([]);
            fetchPurchases();
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
          id={String(selectedPurchase?.id || "")}
          title="purchase"
          url="stocks"
          onClose={() => setDeleteModalOpen(false)}
          setToast={setToast}
          onDeleteSuccess={() => {
            setPurchases([]);
            fetchPurchases();
          }}
        />
      )}
    </div>
  );
}