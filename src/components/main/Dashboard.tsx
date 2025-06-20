"use client";

import * as React from "react";
import { useState } from "react";
import { createTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import { NextAppProvider } from "@toolpad/core/nextjs";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import BellIcon from "@mui/icons-material/Notifications";

// Define the theme
const demoTheme = createTheme({
  colorSchemes: { light: true, dark: false },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 },
  },
});
function TopNav() {
  return (
    <div className="flex items-center gap-5 mr-20 my-10">
      {/* mui bell icon */}
      <BellIcon />

      {/* mui bell icon */}
      <button className="rounded-[20px] border border-[#53B175] px-6 py-3 w-[80px]">
        POS
      </button>
      <div className="md:flex hidden items-center gap-3 ">
        <img
          src="/user.webp"
          alt="user-image"
          className="rounded-full w-[40px] h-[40px]"
        />
        <span>Kaviska Dilshan</span>
      </div>
    </div>
  );
}

// Page content component
function DemoPageContent({ selectedPage }: { selectedPage: string }) {
  switch (selectedPage) {
    case "dashboard":
      return <h1 className="text-black">Welcome to the Dashboard</h1>;
    case "orders":
      return <h1 className="text-black">Here are your Orders</h1>;
    case "reports/sales":
      return <h1 className="text-black">Sales Reports</h1>;
    case "reports/traffic":
      return <h1 className="text-black">Traffic Reports</h1>;
    case "integrations":
      return <h1 className="text-black">Integrations Page</h1>;
    default:
      return <h1 className="text-black">Hello World</h1>;
  }
}

// Main dashboard component
export default function Dashboard() {
  const [selectedPage, setSelectedPage] = useState("dashboard"); // Default page

  // Define navigation menu with click handlers
  const NAVIGATION = [
    { kind: "page" as const, title: "Main items", segment: "main" },
    {
      kind: "page" as const,
      segment: "dashboard",
      title: "Dashboard",
      icon: <DashboardIcon />,
    },
    {
      kind: "page" as const,
      segment: "orders",
      title: "Orders",
      icon: <ShoppingCartIcon />,
    },
    { kind: "divider" as const }, // Only 'kind' should be used
    {
      kind: "page" as const,
      segment: "analytics",
      title: "Analytics",
    },
    {
      kind: "page" as const,
      segment: "reports",
      title: "Reports",
      icon: <BarChartIcon />,
      children: [
        {
          kind: "page" as const,
          segment: "sales",
          title: "Sales",
          icon: <DescriptionIcon />,
        },
        {
          kind: "page" as const,
          segment: "traffic",
          title: "Traffic",
          icon: <DescriptionIcon />,
        },
      ],
    },
    {
      kind: "page" as const,
      segment: "integrations",
      title: "Integrations",
      icon: <LayersIcon />,
    },
  ];
  

  return (
    <NextAppProvider
      navigation={NAVIGATION}
      branding={{
        logo: <img src="/logo.png" alt="MUI logo" className="md:block hidden" />,
        title: "IYMart",
        homeUrl: "/toolpad/core/introduction",
      }}
      theme={demoTheme}
    >
      <DashboardLayout
        slots={{
          toolbarAccount: TopNav,
        }}
        sx={{ ".MuiStack-root": { padding: "0px 10px" } }}
      >
        <DemoPageContent selectedPage={selectedPage} />
      </DashboardLayout>
    </NextAppProvider>
  );
}
