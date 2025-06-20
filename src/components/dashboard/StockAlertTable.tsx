import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function StockAlertTable() {
  interface Row {
    barcode: string;
    product: string;
    quantity: number;
    alertQuantity: number;
  }

  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/reports/alert-table`); // Replace with your API endpoint
        const data = await response.json();
        setRows(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <TableContainer component={Paper} sx={{ borderRadius: '10px', boxShadow: '0px 0px 10px 0px #0000001a' }}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Barcode</TableCell>
            <TableCell align="left">Product</TableCell>
            <TableCell align="left">Quantity</TableCell>
            <TableCell align="left">Alert Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.barcode} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align="left">{row.barcode}</TableCell>
              <TableCell align="left">{row.product}</TableCell>
              <TableCell align="left">{row.quantity}</TableCell>
              <TableCell align="left">
                <button className="px-3 border border-red-600 rounded-[7px]">{row.alertQuantity}</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}