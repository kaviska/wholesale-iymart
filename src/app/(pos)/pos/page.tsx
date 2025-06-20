"use client";
import SearchIcon from "@mui/icons-material/Search";
import PosCard from "@/components/pos/PosCard";
import Pagination from "@mui/material/Pagination"; // Import Pagination
import { useState, useEffect } from "react";
import Logo from "../../../../public/logo.png";
import Image from "next/image"; // Ensure Image is used for optimization
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import DashboardIcon from "@mui/icons-material/Dashboard";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import PosTable from "@/components/pos/PosTable";
import CustomerLoad from "@/components/pos/CustomerLoad";
import { Product } from "@/types/type";
import calculatePrice from "@/lib/priceCalcuator";
import BarCode from "@/components/pos/BarCode";
import {quantityCalculator} from '@/lib/quantityCalculator';
import ToastMessage from "@/components/dashboard/ToastMessage";
import { AlertColor } from "@mui/material";
import RestoreIcon from '@mui/icons-material/Restore';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import ReturnOrderModal from "@/components/pos/ReturnOrderModal";
import SnowshoeingIcon from '@mui/icons-material/Snowshoeing';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Pos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const productsPerPage = 12; // Number of products per page
  const [uiChange, setUiChange] = useState(1); // State for UI change
  const [returnOpen, setReturnOpen] = useState(false); // State for return modal
  const [uiChnageForPos, setUiChnageForPos] = useState(1); // State for UI change in POS

   const [pendingOrderCount, setPendingOrderCount] = useState<number>(0);
   
  
    const fetchPendingOrderCount = async () => {
      try {
        const response = await fetch(
          `https://apivtwo.iymart.jp/api/admin/orders?order_number=&order_status=pending&user_email=`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to fetch pending order count");
        }
  
        const data = await response.json();
        setPendingOrderCount(data.data.filter((order: any) => order.type !== "pos").length || 0); // Count the number of pending orders
      } catch (error) {
        console.error("Error fetching pending order count:", error);
      }
    };
  
    useEffect(() => {
      fetchPendingOrderCount();
    }, []);

  useEffect(() => {
    const fetchMultipleStock = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/multiple-stock`);
        const data = await response.json();
        console.log("Multiple Stock Data:", data);
      } catch (error) {
        console.error("Error fetching multiple stock data:", error);
      }
    };

    fetchMultipleStock();
  }, []);

   const [toast, setToast] = useState<{
      open: boolean;
      message: string;
      severity: AlertColor;
    }>({
      open: false,
      message: "",
      severity: "success",
    });
  

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products?all-products-pos=true`
      );
      const data = await response.json();
      console.log("Products:", data.data);
      // Sort products by created_at or id descending to show newest first
      const sortedProducts = [...data.data].sort((a, b) => {
        // If created_at exists, sort by it, otherwise by id
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return b.id - a.id;
      });
      setProducts(sortedProducts);
    } catch (error) {
      console.error("Error fetching Products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

   useEffect(() => {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("admin-users");
        const token = localStorage.getItem("admin-token");
    
        if (!user || !token) {
          //window.location.href = "/login";
        }
      }
    }, []);

  useEffect(() => {
    fetchProducts();
  }, [uiChange]);

  // Calculate the products to display for the current page
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    else {
      document.documentElement.requestFullscreen();
    }
  }



  
  const dashboardredirect = () => {
    window.location.href = "/dashboard";
  }
  const attendecRedirect = () => {
    window.location.href = "/hrm/attendence";
  }
  const returnHandler = () => {
    setReturnOpen(true);
  }

  const recreveClear=async ()=>{
    const request =await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/clear-reserve`)
    const response=await request.json()

    setToast({
      open: true,
      message: "Reserve Clear successfully!",
      severity: "success",
    });

    if (response.ok) {
      setToast({
        open: true,
        message: "Reserve Clear successfully!",
        severity: "success",
      });
      
    } else {
      const errorData = await response.json();
      setToast({
        open: true,
        message: errorData.message || "Failed to add brand.",
        severity: "error",
      });
    }
   
  }

  return (
    <div>
      <div className="flex md:flex-row flex-col">
        <div className="md:w-60%] p-4">
          <CustomerLoad />

          <div className="mt-4">
            <PosTable uiChange={uiChange} setUiChange={setUiChange} uiChnageForPos={uiChnageForPos} setUiChnageForPos={setUiChnageForPos} />
          </div>

       
        
        </div>
        <div className="md:w-[40%] p-4 shadow-lg">
          <div className="mb-3 md:flex hidden justify-between px-3">
            <Image src={Logo} alt="logo" width={60} height={60} />
            <div className="flex gap-5 mt-4">
              <KeyboardReturnIcon className="text-[#53B175] cursor-pointer" style={{ fontSize: 34 }} onClick={returnHandler} />
              <DashboardIcon className="text-[#53B175] cursor-pointer" style={{ fontSize: 34 }} onClick={dashboardredirect}/>
              <OpenInFullIcon className="text-[#53B175] cursor-pointer" style={{ fontSize: 34 }}  onClick={handleFullScreen}/>
              <RestoreIcon className="text-[#53B175] cursor-pointer" style={{ fontSize: 34 }}  onClick={recreveClear}/>
              <SnowshoeingIcon className="text-[#53B175] cursor-pointer" style={{ fontSize: 34 }}  onClick={attendecRedirect}/>
 <LogoutIcon
          onClick={() => {
            if (typeof window !== "undefined") {
          localStorage.removeItem("admin-users");
          localStorage.removeItem("admin-token");
          window.location.href = "/login";
            }
          }}
          className="cursor-pointer "
            color="error" // Red color for logout icon
        />
              <div
                className="relative cursor-pointer"
                onClick={() => (window.location.href = "/orders/pending")}
              >
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-1">
                  {pendingOrderCount}
                </span>
                <ProductionQuantityLimitsIcon className="text-[#53B175]" style={{ fontSize: 34 }} />
              </div>

            </div>
          </div>
          <div className="relative">
            <BarCode product={products} setUiChange={setUiChange} uiChange={uiChange} uiChnageForPos={uiChnageForPos} setUiChnageForPos={setUiChnageForPos}/>
           
            <span className="absolute left-2 top-3">
              <SearchIcon />
            </span>
          </div>
          <div className="card-section flex md:gap-3 gap-1 py-5 md:px-8 justify-center px-2 flex-wrap">
            {currentProducts.map((product) => (
              <PosCard
                key={product.id}
                productName={product.name}
                productImage={typeof product.primary_image === "string" ? product.primary_image : product.primary_image ? URL.createObjectURL(product.primary_image) : ""}
                productQuantity={quantityCalculator(product.stocks || [])}
                productPrice={calculatePrice(product.stocks || [])}
                stocks={product.stocks || []}
                uiChange={uiChange}
                setUiChange={setUiChange}
                uiChnageForPos={uiChnageForPos} setUiChnageForPos={setUiChnageForPos}
              />
            ))}
          </div>
          {/* Pagination Component */}
          <div className="flex justify-center mt-4">
            <Pagination
              count={Math.ceil(products.length / productsPerPage)} // Total pages
              page={currentPage} // Current page
              onChange={handlePageChange} // Handle page change
              color="secondary"
            />
          </div>
        </div>
      </div>



        <ToastMessage
              open={toast.open}
              onClose={() => setToast({ ...toast, open: false })}
              message={toast.message}
              severity={toast.severity}
            />

      {/* Return Order Modal */}
      <ReturnOrderModal
        open={returnOpen}
        setOpen={setReturnOpen}
       
      />
    </div>
  );
}