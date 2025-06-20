"use client";
import { useState, useEffect, FormEvent } from "react";
import { db } from "@/lib/firebase"; // Adjust the import path as necessary
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
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
  TablePagination,
} from "@mui/material";

interface Employee {
  id: string;
  name: string;
  phone: string;
  role: string;
  verificationId: string;
}

export default function AddEmployee() {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [verificationId, setVerificationId] = useState<string>("");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const q = query(collection(db, "employees"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const employeeList: Employee[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Employee, "id">),
    }));
    setEmployees(employeeList);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !phone || !role || !verificationId) {
      alert("Please fill all fields!");
      return;
    }

    try {
      await addDoc(collection(db, "employees"), {
        name,
        phone,
        role,
        verificationId,
        createdAt: serverTimestamp(),
      });
      alert("Employee added successfully!");
      setName("");
      setPhone("");
      setRole("");
      setVerificationId("");
      fetchEmployees(); // Refresh list
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee.");
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      {/* ADD EMPLOYEE CARD */}
      <Card className="w-full max-w-md mb-8 shadow-lg">
        <CardContent>
          <Typography variant="h5" className="text-center mb-6 font-bold">
            Add Employee
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Role"
              fullWidth
              select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Employee">Employee</MenuItem>
              {/* cashier */}
              <MenuItem value="Cashier">Cashier</MenuItem>
              {/* Add more roles as needed */}
            </TextField>
            <TextField
              label="Verification ID"
              fullWidth
              value={verificationId}
              onChange={(e) => setVerificationId(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="bg-blue-500 hover:bg-blue-700 text-white"
            >
              Add Employee
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* EMPLOYEE LIST */}
      <Card className="w-full max-w-4xl shadow-lg">
        <CardContent>
          <Typography variant="h6" className="text-center mb-4 font-semibold">
            Employee List
          </Typography>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Verification ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.phone}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.verificationId}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            component="div"
            count={employees.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
