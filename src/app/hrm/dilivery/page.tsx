"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { db } from "@/lib/firebase"; // Make sure this path is correct
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

interface DeliveryEntry {
  id: string;
  name: string;
  orderAmount: number;
  payingAmount: number;
  status: "Paid" | "Unpaid";
}

export default function DeliveryManagement() {
  const [entries, setEntries] = useState<DeliveryEntry[]>([]);
  const [name, setName] = useState<string>("");
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [payingAmount, setPayingAmount] = useState<number>(0);
  const [status, setStatus] = useState<"Paid" | "Unpaid">("Unpaid");

  // Fetch delivery records from Firestore
  const fetchEntries = async () => {
    const snapshot = await getDocs(collection(db, "delivery"));
    const list: DeliveryEntry[] = snapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        name: data.name,
        orderAmount: data.orderAmount,
        payingAmount: data.payingAmount ?? 0,
        status: data.status,
      };
    });
    setEntries(list);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleAddEntry = async () => {
    if (!name || orderAmount <= 0 || payingAmount < 0) return;
    try {
      const docRef = await addDoc(collection(db, "delivery"), {
        name,
        orderAmount,
        payingAmount,
        status,
        createdAt: serverTimestamp(),
      });
      setEntries([
        ...entries,
        {
          id: docRef.id,
          name,
          orderAmount,
          payingAmount,
          status,
        },
      ]);
      setName("");
      setOrderAmount(0);
      setPayingAmount(0);
      setStatus("Unpaid");

      alert("Delivery record saved successfully!");
    } catch (error) {
      alert("Failed to save delivery record.");
      console.error(error);
    }
  };

  const handleChangeStatus = async (id: string, newStatus: "Paid" | "Unpaid") => {
    try {
      await updateDoc(doc(db, "delivery", id), { status: newStatus });
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, status: newStatus } : entry
        )
      );
    } catch (error) {
      alert("Failed to update status.");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-3xl mb-6">
        <CardContent>
          <Typography variant="h5" className="mb-4 font-bold">
            Delivery Management
          </Typography>

          <Box display="grid" gap={2}>
            <TextField
              label="Delivery Person Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Order Amount"
              type="number"
              value={orderAmount}
              onChange={(e) => setOrderAmount(Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Paying Amount"
              type="number"
              value={payingAmount}
              onChange={(e) => setPayingAmount(Number(e.target.value))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value as "Paid" | "Unpaid")}
              >
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Unpaid">Unpaid</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={handleAddEntry}>
              Add Delivery Record
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card className="w-full max-w-4xl">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Delivery Records
          </Typography>
          {entries.length === 0 ? (
            <Typography>No records yet.</Typography>
          ) : (
            <table className="min-w-full table-auto text-sm border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Order Amount</th>
                  <th className="border p-2">Paying Amount</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-100">
                    <td className="border p-2">{entry.name}</td>
                    <td className="border p-2">{entry.orderAmount}</td>
                    <td className="border p-2">{entry.payingAmount}</td>
                    <td className="border p-2">
                      {entry.status}
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                        onClick={() =>
                          handleChangeStatus(
                            entry.id,
                            entry.status === "Paid" ? "Unpaid" : "Paid"
                          )
                        }
                      >
                        Mark as {entry.status === "Paid" ? "Unpaid" : "Paid"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}