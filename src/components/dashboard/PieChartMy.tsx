"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { useMediaQuery } from "@mui/material";

interface PieChartData {
  id: number;
  value: number;
  label: string;
}

export default function PieChartMy() {
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const [chartData, setChartData] = useState<PieChartData[]>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/reports/pie-chart`);
        if (!response.ok) {
          throw new Error("Failed to fetch pie chart data");
        }
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div className="sm:w-[700px] md:ml-[-180px] w-[300px]  text-left">
  <PieChart
    series={[
      {
        data: chartData,
        highlightScope: { fade: "global", highlight: "item" },
      },
    ]}
    height={200}
    sx={{
      margin: 0, // Remove default margin
      display: 'inline-block', // Avoid centering in container
    }}
  />
</div>

   
  );
}



{/* <PieChart
series={[
  {
    data: [
      { id: 0, value: 100, label: 'Rice' },
      { id: 1, value: 120, label: 'Tea', color: '#1565C0' },
      { id: 2, value: 123, label: 'Coffe' },
      { id: 3, value: 500, label: 'Milk', color: '#53B175' },
      { id: 4, value: 75, label: 'Black Peper' },
    ],
    highlightScope: { fade: 'global', highlight: 'item' },
  },
]}
width={isSmallScreen ? 300 : 400}
height={200} */}