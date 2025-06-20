"use client";
"use client"
import Card from "@/components/dashboard/Card";
import BiaxialBarChart from "@/components/dashboard/BiaxialBarChart";
import PieChartMy from "@/components/dashboard/PieChartMy";
import BiaxialLineChart from "@/components/dashboard/BiaxialLineChart";
import StockAlertTable from "@/components/dashboard/StockAlertTable";
import ToastMessage from "@/components/dashboard/ToastMessage";
import { useState, useEffect } from "react";

// sample commented

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const [webSales, setWebSales] = useState(0);
  const [posSales, setPosSales] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    const fetchCalculatorData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/reports/calcuator?web=true&pos=true&tax=true&customers=true`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch calculator data");
        }
        const data = await response.json();
        setWebSales(data.webSales);
        setPosSales(data.posSales);
        setTotalTax(data.totalTax);
        setTotalCustomers(Math.max(0, data.totalCustomers - 5));
      } catch (error) {
        console.error("Error fetching calculator data:", error);
      }
    };

    fetchCalculatorData();
  }, []);

  return (
    <div>
      <h1 className="text-[18px] mb-3">Usefull Data For This Month </h1>

      <div className="card-section flex md:flex-row flex-col gap-8">
        <Card title="Web Sales" number={`¥${webSales.toFixed(2)}`} />
        <Card title="POS Sales" number={`¥${posSales.toFixed(2)}`} />
        <Card title="Total Tax" number={`¥${totalTax.toFixed(2)}`} />
        <Card title="Total Customers" number={`${totalCustomers}`} />
      </div>

      <div className="chart-section flex md:flex-row flex-col mt-8 gap-6 ">
        <div className="chart-s-1 md:shadow-lg md:p-4 rounded-[10px]">
          <h1 className="text-[18px] mb-3">This Week Sales Pos & Web </h1>
          <BiaxialBarChart />
        </div>
        <div className="chart-s-2 md:shadow-lg md:block hidden px-2 py-4 rounded-[10px]">
          <h1 className="text-[18px] mx-2 mb-4">Top Selling Products</h1>
          <PieChartMy />
        </div>
      </div>

      <div className="chart-s-3 mt-8 md:shadow-lg md:p-4  rounded-[10px]">
        <h1 className="text-[18px] mb-3">Last Week Cash Flow </h1>
        <BiaxialLineChart />
      </div>

      <div className="chart-s-4 mt-8 flex md:flex-row flex-col gap-8">
        <StockAlertTable />

        {message && (
          <ToastMessage
            open={true}
            onClose={() => setMessage("")}
            message="Operation successful!"
            severity="warning"
            autoHideDuration={5000}
            showProgress={true}
          />
        )}
      </div>
    </div>
  );
}