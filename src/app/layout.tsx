"use client";

import * as React from "react";
import { useState,useEffect } from "react";
import { createTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import { NextAppProvider } from "@toolpad/core/nextjs";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import BellIcon from "@mui/icons-material/Notifications";
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import EngineeringIcon from '@mui/icons-material/Engineering';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import MoneyIcon from '@mui/icons-material/Money';
import PrintIcon from '@mui/icons-material/Print';
import { usePathname } from 'next/navigation';
import { Suspense } from "react";
import CategoryIcon from '@mui/icons-material/Category';
import RedditIcon from '@mui/icons-material/Reddit';
import LinkIcon from '@mui/icons-material/Link';
import QueueIcon from '@mui/icons-material/Queue';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import CircularProgress from "@mui/material/CircularProgress";
import Badge from "@mui/material/Badge";


import './globals.css'
import { Segment } from "@mui/icons-material";

// Define the theme
const demoTheme = createTheme({
  colorSchemes: { light: true, dark: false },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 },
  },
});
const posRedirecter = () => {
  window.location.href = "/pos";
}


function TopNav() {
 
  // Fetch pending order count
 
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("admin-users");
      const token = localStorage.getItem("admin-token");
  
      if (!user || !token) {
        window.location.href = "/login";
      }
    }
  }, []);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/reports/alert-table`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotificationCount(data.length); // Assuming the response is an array of notifications
    } catch (error) {
      console.error("Error fetching notification count:", error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchNotificationCount();
  }, []);

  return (
    <div className="flex items-center gap-5 mr-20 my-10">
      
      {loading ? (
                 <BellIcon color="action" />

      ) : (
        <Badge badgeContent={notificationCount} color="primary">
          <BellIcon
            color="action"
            className="cursor-pointer"
            onClick={() => {
              window.location.href = "/notifications";
            }}
          />
        </Badge>
      )}
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
      
      <button onClick={posRedirecter} className="md:rounded-[20px] cursor-pointer md:border md:border-[#53B175] md:x-6 md:py-3 md:w-[80px]">
        POS
      </button>
      <div className="md:flex hidden items-center gap-3 ">
        <img
          src="/user.webp"
          alt="user-image"
          className="rounded-full w-[40px] h-[40px]"
        />
         <span>
    {typeof window !== "undefined" && localStorage.getItem("admin-users")
      ? JSON.parse(localStorage.getItem("admin-users") || "{}").name.split(" ")[0]
      : "Admin"}
  </span>
      </div>
    </div>
  );
}

// Page content component
// function DemoPageContent({ selectedPage }: { selectedPage: string }) {
//   switch (selectedPage) {
//     case "dashboard":
//       return <h1 className="text-black">Welcome to the Dashboard</h1>;
//     case "orders":
//       return <h1 className="text-black">Here are your Orders</h1>;
//     case "reports/sales":
//       return <h1 className="text-black">Sales Reports</h1>;
//     case "reports/traffic":
//       return <h1 className="text-black">Traffic Reports</h1>;
//     case "integrations":
//       return <h1 className="text-black">Integrations Page</h1>;
//     default:
//       return <h1 className="text-black">Hello World</h1>;
//   }
// }



// Main dashboard component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [selectedPage, setSelectedPage] = useState("dashboard"); // Default page
  const [pendingOrderCount, setPendingOrderCount] = useState<number>(0);
  const [cashier, setCashier] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("admin-users");
      const token = localStorage.getItem("admin-token");

      if (!user || !token) {
       
      } else {
        const parsedUser = JSON.parse(user);
        const cashierNames = ["cashier", "cashier-1", "cashier-2", "cashier-3"];
        setCashier(
          typeof parsedUser.name === "string" &&
          cashierNames.some(
            (name) => parsedUser.name.toLowerCase() === name.toLowerCase()
          )
        );
      }
    }
  }, []);

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
      const count = data.data.filter((order: any) => order.type !== "pos").length;
      setPendingOrderCount(count); // Count the number of pending orders excluding type "pos"
    } catch (error) {
      console.error("Error fetching pending order count:", error);
    }
  };

  useEffect(() => {
    fetchPendingOrderCount();
  }, []);
  // Define navigation menu with click handlers
  const NAVIGATION = cashier
    ? [
        { kind: "header", title: "Main items" },
        {
          segment: "orders",
          title: (
            <span>
              Orders{" "}
              <span style={{ color: "red" }}>({pendingOrderCount})</span>
            </span>
          ), // Display pending order count in red
          icon: <ShoppingCartIcon onClick={() => setSelectedPage("orders")} />,
          children: [
            {
              segment: "all",
              title: "All Orders",
              icon: (
                <VisibilityIcon onClick={() => setSelectedPage("orders/all")} />
              ),
            },
            {
              segment: "pending",
              title: "Pending Order",
              icon: (
                <AddIcon onClick={() => setSelectedPage("orders/pending")} />
              ),
            },
          ],
        },

      
      ]
    : [
        { kind: "header", title: "Main items" },
        {
          segment: "dashboard",
          title: "Dashboard",
          icon: <DashboardIcon onClick={() => setSelectedPage("dashboard")} />,
        },
        {
          segment: "orders",
          title: (
            <span>
              Orders{" "}
              <span style={{ color: "red" }}>({pendingOrderCount})</span>
            </span>
          ), // Display pending order count in red
          icon: <ShoppingCartIcon onClick={() => setSelectedPage("orders")} />,
          children: [
            {
              segment: "all",
              title: "All Orders",
              icon: (
                <VisibilityIcon onClick={() => setSelectedPage("orders/all")} />
              ),
            },
            {
              segment: "pending",
              title: "Pending Order",
              icon: (
                <AddIcon onClick={() => setSelectedPage("orders/pending")} />
              ),
            },
          ],
        },

       

          { kind: "divider" },
        { kind: "header", title: "Analytics" },

        {
          segment: "reports",
          title: "Reports",
          icon: <BarChartIcon />,
          children: [
            {
              segment: "sales",
              title: "Sales",
              icon: (
                <BarChartIcon onClick={() => setSelectedPage("reports/sales")} />
              ),
            },
            {
              segment: "products",
              title: "Products",
              icon: (
                <BarChartIcon
                  onClick={() => setSelectedPage("reports/products")}
                />
              ),
            },
            {
              segment: "stocks",
              title: "Stocks",
              icon: (
                <BarChartIcon onClick={() => setSelectedPage("reports/stocks")} />
              ),
            },
          
            
          ],
        },


        { kind: "header", title: "Products" },
        { kind: "divider" },
        {
          segment: "products",
          title: "Products",
          icon: <Inventory2Icon />,
          children: [
            {
              segment: "add",
              title: "Add Product",
              icon: (
                <AddIcon onClick={() => setSelectedPage("products/add")} />
              ),
            },
            {
              segment: "list",
              title: "List Products",
              icon: (
                <VisibilityIcon
                  onClick={() => setSelectedPage("products/list")}
                />
              ),
            },
            {
              segment: "printLabel",
              title: "Print Label",
              icon: (
                <PrintIcon
                  onClick={() => setSelectedPage("products/printLabel")}
                />
              ),
            },
          ],
        },
        {
          segment: "categories",
          title: "Categories",
          icon: <CategoryIcon onClick={() => setSelectedPage("categories")} />,
          children: [
            {
              segment: "add",
              title: "Add Category",
              icon: (
                <AddIcon onClick={() => setSelectedPage("categories/add")} />
              ),
            },
            {
              segment: "list",
              title: "List Categories",
              icon: (
                <VisibilityIcon
                  onClick={() => setSelectedPage("categories/list")}
                />
              ),
            },
          ],
        },

        {
          segment: "variations",
          title: "Variations",
          icon: <LinkIcon onClick={() => setSelectedPage("variations")} />,
          children: [
            {
              segment: "add",
              title: "Add Variation",
              icon: (
                <AddIcon onClick={() => setSelectedPage("variations/add")} />
              ),
            },
            {
              segment: "list",
              title: "List Variations",
              icon: (
                <VisibilityIcon
                  onClick={() => setSelectedPage("variations/list")}
                />
              ),
            },
          ],
        },
        {
          segment: "variationOptions",
          title: "Variation Options",
          icon: <QueueIcon onClick={() => setSelectedPage("variationOptions")} />,
          children: [
            {
              segment: "add",
              title: "Add Variation Option",
              icon: (
                <AddIcon
                  onClick={() => setSelectedPage("variationOptions/add")}
                />
              ),
            },
            {
              segment: "list",
              title: "List Variation Options",
              icon: (
                <VisibilityIcon
                  onClick={() => setSelectedPage("variationOptions/list")}
                />
              ),
            },
          ],
        },

        {
          segment: "brands",
          title: "Brands",
          icon: <RedditIcon onClick={() => setSelectedPage("brands")} />,
          children: [
            {
              segment: "add",
              title: "Add Brand",
              icon: <AddIcon onClick={() => setSelectedPage("brands/add")} />,
            },
            {
              segment: "list",
              title: "List Brands",
              icon: (
                <VisibilityIcon onClick={() => setSelectedPage("brands/list")} />
              ),
            },
          ],
        },

        {
          segment: "purchase",
          title: "Purchase",
          icon: <MoneyIcon />,
          children: [
            {
              segment: "add",
              title: "Add Purchase",
              icon: <AddIcon onClick={() => setSelectedPage("purchase/add")} />,
            },
            {
              segment: "list",
              title: "List Purchase",
              icon: (
                <VisibilityIcon
                  onClick={() => setSelectedPage("purchase/list")}
                />
              ),
            },
          ],
        },

        { kind: "divider" },
        { kind: "header", title: "Sales" },
        {
          segment: "sales",
          title: "Sales",
          icon: <MoneyIcon onClick={() => setSelectedPage("sales")} />,
          children: [
            {
              segment: "list",
              title: "List Sales",
              icon: (
                <VisibilityIcon onClick={() => setSelectedPage("sales/list")} />
              ),
            },
          ],
        },

        { kind: "divider" },
        { kind: "header", title: "People" },
        {
          segment: "suppliers",
          title: "Suppliers",
          icon: (
            <EngineeringIcon onClick={() => setSelectedPage("suppliers")} />
          ),
          children: [
            {
              segment: "add",
              title: "Add Supplier",
              icon: (
                <AddIcon onClick={() => setSelectedPage("suppliers/add")} />
              ),
            },
            {
              segment: "list",
              title: "List Suppliers",
              icon: (
                <VisibilityIcon
                  onClick={() => setSelectedPage("suppliers/list")}
                />
              ),
            },
          ],
        },

        { kind: "divider" },
        { kind: "header", title: "Admin" },
        {
          segment: "admins",
          title: "Admins",
          icon: (
            <AdminPanelSettingsIcon onClick={() => setSelectedPage("admins")} />
          ),
          children: [
            {
              segment: "add",
              title: "Add Admin",
              icon: <AddIcon onClick={() => setSelectedPage("admins/add")} />,
            },
            {
              segment: "list",
              title: "List Admins",
              icon: (
                <VisibilityIcon onClick={() => setSelectedPage("admins/list")} />
              ),
            },
          ],
        },
        {
          segment: "customers",
          title: "Customers",
          icon: (
            <EngineeringIcon onClick={() => setSelectedPage("admins")} />
          ),
          children: [
            {
              segment: "list",
              title: "List Customers",
              icon: (
                <VisibilityIcon
                  onClick={() => setSelectedPage("customer/list")}
                />
              ),
            },
          ],
        },

      
       
      ];

  const pathname = usePathname();
    const isPos= pathname.includes("pos");
    const islogin= pathname.includes("login");
    const isfrogotPassword= pathname.includes("frogot-password");

  
  
  return (
    <html lang="en">
      <body>
      <Suspense fallback={<div>Loading...</div>}>
    {!isPos && !isfrogotPassword && !islogin ?  (
      
      <NextAppProvider
        navigation={NAVIGATION as any} // Temporarily cast to 'any' if type mismatch persists
        branding={{
          logo: <img src="/logo.png" alt="MUI logo" className="md:block hidden" />,
          title: "IYMart",
          homeUrl: "/dashboard",
        }}
        theme={demoTheme}
      >
        <DashboardLayout
          slots={{
            toolbarAccount: TopNav,
          }}
          sx={{ ".MuiStack-root": { padding: "0px 10px" } }}
        >
          <div className="p-10">{children}</div>
        </DashboardLayout>
      </NextAppProvider>
    ) : (
      <>{children}</>
    )}
   </Suspense>
    </body>
    </html>
  );
}
