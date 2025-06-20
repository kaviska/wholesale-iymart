"use client";
import DataTableMy from "@/components/main/DataTable";
import Title from "@/components/main/Title";
import { useEffect, useState } from "react";
import type { Supplier } from '@/types/type'; // Import the Supplier type
import UpdateIcon from '@mui/icons-material/Update';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

export default function TestPage() {
     const [suppliers, setSuppliers] = useState<Supplier[]>([]); // Use the Supplier type here
      useEffect(() => {
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
            if(result.status=='success'){
              console.log('adding suppliers')
              setSuppliers(result.data);
            }
            // if (result.status === "success") {
            //   setSuppliers((prevSuppliers) => {
            //     // Only update state if the data has changed
            //     if (JSON.stringify(prevSuppliers) !== JSON.stringify(result.data)) {
            //       return result.data;
            //     }
            //     return prevSuppliers;
            //   });
            // }
          } catch (error) {
            console.error("Error fetching suppliers:", error);
          }
        };
      
        fetchSuppliers(); // Call the function once when the component mounts
      }, []); // Ensure the dependency array is empty

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
          name:"Actions",
          cell: (row: Supplier) => (
            <div className="flex gap-2 cursor-pointer">
                <UpdateIcon fontSize="small" color="primary" /> {/* Blue for update */}
                <RemoveRedEyeIcon fontSize="small" color="action" /> {/* Gray for view */}
                <HighlightOffIcon fontSize="small" color="error" /> {/* Red for delete */}
            </div>
          ),
        }
      ];
    
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
            <h1>No suppliers</h1>
         ):(
            <DataTableMy
               columns={columns}
               data={suppliers} // Pass the suppliers data to the DataTableMy component
             ></DataTableMy>
         )}
        
         {/* {suppliers.length === 0 ? (
           <div className="flex justify-center items-center h-screen">
             <h1 className="text-2xl text-gray-500">No suppliers found</h1>
           </div>
         ) : (
           <div className="mt-8">
             <DataTableMy
               columns={columns}
               data={suppliers} // Pass the suppliers data to the DataTableMy component
             ></DataTableMy>
           </div>
         )} */}
   
       
       </div>
  );
}