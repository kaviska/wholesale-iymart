"use client";
import { useState, useEffect, FormEvent } from "react";
import { db } from "@/lib/firebase"; // Adjust the import path as necessary
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import {
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  FormControl,
  InputLabel,
  AlertColor,
} from "@mui/material";
import Title from "@/components/main/Title";
import ToastMessage from "@/components/dashboard/ToastMessage";

interface Employee {
  id: string;
  name: string;
}

// ... other imports remain unchanged
interface Salary {
  id: string;
  employeeId: string;
  hourlyRate: number;
  totalHours: number;
  amount: number;
  frequency: "Daily" | "Weekly" | "Monthly";
  status: "Paid" | "Unpaid";
  paymentDate: string;
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [frequency, setFrequency] = useState<"Daily" | "Weekly" | "Monthly">("Monthly");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as AlertColor,
  });

  useEffect(() => {
    fetchEmployees();
    fetchSalaries();
  }, []);

  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, "employees"));
    const list: Employee[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Employee, "id">),
    }));
    setEmployees(list);
  };

  const fetchSalaries = async () => {
    const snapshot = await getDocs(collection(db, "salaries"));
    const list: Salary[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Salary, "id">),
    }));
    setSalaries(list);
  };

  const handleAddSalary = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployee || hourlyRate <= 0 || totalHours <= 0) {
      setToast({
        open: true,
        message: "Please fill all fields correctly.",
        severity: "error",
      });
      return;
    }

    const amount = hourlyRate * totalHours;

    try {
      await addDoc(collection(db, "salaries"), {
        employeeId: selectedEmployee,
        hourlyRate,
        totalHours,
        amount,
        frequency,
        status: "Unpaid",
        paymentDate: serverTimestamp(),
      });
      setToast({ open: true, message: "Salary added successfully!", severity: "success" });
      fetchSalaries();
    } catch (error) {
      console.error("Error adding salary:", error);
      setToast({ open: true, message: "Failed to add salary.", severity: "error" });
    }
  };

  const handleMarkAsPaid = async (salaryId: string) => {
    try {
      const salaryRef = doc(db, "salaries", salaryId);
      await updateDoc(salaryRef, { status: "Paid" });
      setToast({ open: true, message: "Marked as Paid!", severity: "success" });
      fetchSalaries();
    } catch (error) {
      console.error("Error updating salary status:", error);
      setToast({ open: true, message: "Failed to update status.", severity: "error" });
    }
  };

  return (
    <div>
      <Title
        title="Payroll Management"
        breadCrumbs={[{ label: "HRM", href: "/hrm" }, { label: "Payroll", href: "/hrm/payroll" }]}
        active="Manage Payroll"
      />

      <div className="mt-7 grid grid-cols-1 gap-6">
        {/* Add Salary Form */}
        <Card className="shadow-lg">
          <CardContent>
            <Typography variant="h5" className="text-center mb-6 font-bold">
              Add Salary
            </Typography>
            <form onSubmit={handleAddSalary} className="space-y-6">
              <FormControl fullWidth>
                <InputLabel id="employee-label">Employee</InputLabel>
                <Select
                  labelId="employee-label"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Hourly Rate"
                type="number"
                fullWidth
                value={hourlyRate}
                sx={{marginTop: 4}}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                required
              />
              <TextField
                label="Total Hours"
                type="number"
                fullWidth
                value={totalHours}
                sx={{marginTop: 4}}

                onChange={(e) => setTotalHours(Number(e.target.value))}
                required
              />

              <FormControl fullWidth>
                <InputLabel id="frequency-label">Payment Frequency</InputLabel>
                <Select
                  labelId="frequency-label"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                sx={{marginTop: 4}}

                  required
                >
                  <MenuItem value="Daily">Daily</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                </Select>
              </FormControl>

              <Button sx={{marginTop: 4}} type="submit" variant="contained" className="bg-[#53B175] hover:bg-green-700 text-white w-full">
                Add Salary
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Salary Table */}
        <Card className="shadow-lg">
          <CardContent>
            <Typography variant="h6" className="text-center mb-4 font-semibold">
              Salary List
            </Typography>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Hourly Rate</TableCell>
                    <TableCell>Total Hours</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaries.map((salary) => {
                    const employee = employees.find((e) => e.id === salary.employeeId);
                    return (
                      <TableRow key={salary.id}>
                        <TableCell>{employee?.name || "Unknown"}</TableCell>
                        <TableCell>{salary.hourlyRate}</TableCell>
                        <TableCell>{salary.totalHours}</TableCell>
                        <TableCell>{salary.amount}</TableCell>
                        <TableCell>{salary.frequency}</TableCell>
                        <TableCell>{salary.status}</TableCell>
                        <TableCell>
                          {salary.status === "Unpaid" && (
                            <Button
                              variant="contained"
                              className="bg-[#53B175] hover:bg-green-700 text-white"
                              onClick={() => handleMarkAsPaid(salary.id)}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ToastMessage
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </div>
  );
}
