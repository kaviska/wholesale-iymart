"use client";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust this path

interface Attendance {
  id: string;
  verificationId: string;
  type: "arrive" | "off";
  timestamp: Timestamp;
}

interface AttendanceRow {
  verificationId: string;
  date: string;
  arriveTime?: Date;
  offTime?: Date;
  hours?: number;
}

export default function AttendanceSystem() {
  const [verificationId, setVerificationId] = useState("");
  const [month, setMonth] = useState(""); // yyyy-mm
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [totalHours, setTotalHours] = useState<{ [key: string]: number }>({});

  const handleAddAttendance = async (type: "arrive" | "off") => {
    if (!verificationId) {
      alert("Please enter your verification ID.");
      return;
    }

    try {
      await addDoc(collection(db, "attendances"), {
        verificationId,
        type,
        timestamp: serverTimestamp(),
      });
      alert(`${type === "arrive" ? "Arrival" : "Off"} recorded.`);
      setVerificationId("");
    } catch (err) {
      console.error("Error recording attendance:", err);
      alert("Failed to record attendance.");
    }
  };

  const handleMonthChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedMonth = e.target.value;
    setMonth(selectedMonth);

    const [year, month] = selectedMonth.split("-");
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const q = query(
      collection(db, "attendances"),
      where("timestamp", ">=", Timestamp.fromDate(start)),
      where("timestamp", "<=", Timestamp.fromDate(end)),
      orderBy("timestamp", "asc")
    );

    const snapshot = await getDocs(q);
    const data: Attendance[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Attendance, "id">),
    }));

    // Group by verificationId and date
    const grouped: { [key: string]: AttendanceRow } = {};
    data.forEach((rec) => {
      const dateObj = rec.timestamp?.toDate();
      if (!dateObj) return;
      const dateStr = dateObj.toISOString().split("T")[0];
      const key = `${rec.verificationId}_${dateStr}`;
      if (!grouped[key]) {
        grouped[key] = {
          verificationId: rec.verificationId,
          date: dateStr,
        };
      }
      if (rec.type === "arrive") {
        grouped[key].arriveTime = dateObj;
      } else if (rec.type === "off") {
        grouped[key].offTime = dateObj;
      }
    });

    // Calculate hours
    const rows: AttendanceRow[] = Object.values(grouped).map((row) => {
      let hours = undefined;
      if (row.arriveTime && row.offTime) {
        hours = (row.offTime.getTime() - row.arriveTime.getTime()) / (1000 * 60 * 60);
        hours = Math.round(hours * 100) / 100; // round to 2 decimals
      }
      return { ...row, hours };
    });

    // Calculate total hours per verificationId
    const totals: { [key: string]: number } = {};
    rows.forEach((row) => {
      if (row.hours && row.verificationId) {
        if (!totals[row.verificationId]) totals[row.verificationId] = 0;
        totals[row.verificationId] += row.hours;
      }
    });

    setAttendanceRows(rows);
    setTotalHours(totals);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      {/* Attendance Entry */}
      <Card className="w-full max-w-md mb-8 shadow-md">
        <CardContent>
          <Typography variant="h5" className="text-center font-bold mb-4">
            Attendance Entry
          </Typography>
          <TextField
            label="Verification ID"
            fullWidth
            value={verificationId}
            onChange={(e) => setVerificationId(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <div className="flex gap-4 justify-between">
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={() => handleAddAttendance("arrive")}
            >
              Add Arrive
            </Button>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={() => handleAddAttendance("off")}
            >
              Add Off
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Attendance Viewer */}
      <Card className="w-full max-w-4xl shadow-md">
        <CardContent>
          <Typography variant="h6" className="text-center font-semibold mb-4">
            View Attendance by Month
          </Typography>
          <TextField
            type="month"
            label="Select Month"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={month}
            onChange={handleMonthChange}
            sx={{ mb: 3 }}
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Verification ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Arrive Time</TableCell>
                  <TableCell>Off Time</TableCell>
                  <TableCell>Hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRows.map((row, idx) => (
                  <TableRow key={row.verificationId + row.date + idx}>
                    <TableCell>{row.verificationId}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>
                      {row.arriveTime
                        ? row.arriveTime.toLocaleTimeString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {row.offTime
                        ? row.offTime.toLocaleTimeString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {row.hours !== undefined ? row.hours : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Show total hours per verificationId */}
                {Object.entries(totalHours).map(([vid, hours]) => (
                  <TableRow key={vid + "_total"}>
                    <TableCell colSpan={4} align="right" style={{ fontWeight: "bold" }}>
                      Total Hours for {vid}
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>{hours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}