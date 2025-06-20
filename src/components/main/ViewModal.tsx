"use client";
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";

interface Field {
  label: string;
  value: string | number | null;
}

interface ViewModalProps<T> {
  title: string;
  data?: T;
  fields: Field[];
  onClose: () => void;
}

export default function ViewModal<T>({ title, data, fields, onClose }: ViewModalProps<T>) {
  return (
    <Dialog onClose={onClose} open={true}>
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {fields.map((field, index) => (
          <TextField
            key={index}
            label={field.label}
            value={field.value || "N/A"}
            fullWidth
            margin="normal"
            
            InputProps={{ style: { height: "50px", fontSize: "14px" } }}
            InputLabelProps={{ style: { fontSize: "14px" } }}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}