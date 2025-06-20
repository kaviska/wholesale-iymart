"use client";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useState, useEffect } from "react";
import { Customer } from "@/types/type";

interface SelectedCustomer {
  id: number | null;
  name: string;
  email: string;
  mobile: string;
  tokens?: Array<{
    token_id: string | number;
    token: string;
  }>

  address: {
  
    region_id: string | number;
    prefecture_id: string | number;
    city: string;
    country: string;
    postal_code: string;
    address_line_1: string | null;
    address_line_2: string | null;
  };
}

export default function CustomerLoad() {
  const [selectedValue, setSelectedValue] = useState<string>("0");
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null);

    const fetchCustomerData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Customers:", data.data);
  
      // Filter customers who have both addresses and tokens
      const filteredData = data.data.filter(
        (customer: Customer) =>
          customer.addresses && customer.addresses.length > 0 &&
          customer.tokens && customer.tokens.length > 0
      );
  
      setCustomerData(filteredData);
    } catch (error) {
      console.error("Error fetching Customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedValue(event.target.value);
    const customer = customerData.find(
      (customer: Customer) => customer.id === parseInt(event.target.value)
    );

    console.log("Selected Customer ID:", event.target.value);

    if (customer && customer.addresses && customer.addresses.length > 0) {
      const address = customer.addresses[0];
      setSelectedCustomer({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        tokens: customer.tokens,

        

        address: {
         
          region_id: address.region_id,
          prefecture_id: address.prefecture_id,
          country: address.country,
          city: address.city,
          postal_code: address.postal_code,
          address_line_1: address.address_line_1,
          address_line_2: address.address_line_2,
        },
      });
      console.log("Selected Customer :", selectedCustomer);

      const userData = {
        region_id: address.region_id,
        prefecture_id: address.prefecture_id,
        city: address.city,
        postal_code: address.postal_code,
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2,
        tokens: customer.tokens,
       
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        device_name: "ZTE v50", // Example device name
        
       user_id: customer.id,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("userData", JSON.stringify(userData));
      }
    } else {
      setSelectedCustomer(null);
    }
    console.log("Selected Customer:", customer);
  };

  return (
    <FormControl fullWidth>
      <Select
        id="customer-select"
        value={selectedValue}
        onChange={handleChange}
        sx={{ height: "50px", borderRadius: "10px" }}
      >
        <MenuItem value="0">Select Customer</MenuItem>
        {customerData.map((customer: Customer) => (
          <MenuItem key={customer.id} value={customer.id.toString()}>
            {customer.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}