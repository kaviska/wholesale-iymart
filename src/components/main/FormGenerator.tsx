"use client";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Autocomplete from "@mui/material/Autocomplete";
// import FormHelperText from "@mui/material/FormHelperText";
import { useState, useEffect } from "react";
//mui upload icon
import { UploadFile } from "@mui/icons-material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { SelectChangeEvent } from "@mui/material/Select"; // Import SelectChangeEvent

interface CustomInputFieldProps {
  name: string;
  label: string;
  type: string;
  value: string | File | null | undefined | string[] | number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | SelectChangeEvent
  ) => void; // Updated type to include SelectChangeEvent
  endPoint?: string; // For selector type
  previewUpadte?: string | File | null | undefined | string[] | number ; // For file type
}
interface Option {
  id: number | string;
  name: string;
}

export default function FormGenerator({
  name,
  label,
  type,
  value,
  onChange,
  endPoint,
  previewUpadte
}: CustomInputFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [preview, setPreview] = useState<string | null>(null); // State for image preview

  

  useEffect(() => {
    if (type === "selector" && endPoint) {
      const fetchData = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/${endPoint}`);
          const data = await response.json();
          console.log("Fetched data:", data.data); // Debugging line

          setOptions(data.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [type, endPoint]);

  useEffect(() => {
    if (type === "file" && value === null) {
      setPreview(null); // Clear the preview when the value is reset
    }
  }, [type, value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // Generate preview URL
    }
    onChange(e); // Call the parent onChange handler
  };
  

  if (type === "file") {
    return (
      <FormControl fullWidth>
        <InputLabel shrink style={{ marginTop: "-12px" }}>
          {label}
        </InputLabel>
        <label
          htmlFor={`file-input-${name}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 20px",
            border: "1px dashed #ccc",
            color: "#010101",
            borderRadius: "4px",
            cursor: "pointer",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          <span style={{ marginRight: "8px" }}>Choose File</span>
          <UploadFile style={{ marginRight: "8px" }} />
        </label>
        <input
          id={`file-input-${name}`}
          type="file"
          name={name}
          onChange={handleFileChange}
          style={{
            display: "none",
          }}
        />
          {previewUpadte && (
              <img
              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE}/${previewUpadte}`}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginBottom: "10px",
                marginTop: "10px",
              }}
              />
            )}

        {preview && (
            <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
            >
          
            {preview && (
              <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
              />
            )}

            <span style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
              Preview
            </span>
            </div>
        )}
      </FormControl>
    );
  }

  if (type === "switch") {
    return (
      <FormControl fullWidth>
        <InputLabel id={`label-for-${name}`}>{label}</InputLabel>
        <Select
          labelId={`label-for-${name}`}
          id={`select-for-${name}`}
          value={value === "true" ? "true" : value === "false" ? "false" : ""}
          name={name}
          label={label}
          onChange={onChange}
          sx={{ minWidth: 120, height: 50, fontSize: 14 }}
        >
          <MenuItem value="">
            <em>Select {label}</em>
          </MenuItem>
          <MenuItem value="true">True</MenuItem>
          <MenuItem value="false">False</MenuItem>
        </Select>
        {/* {error && <FormHelperText>{helperText}</FormHelperText>} */}
      </FormControl>
    );
  }

  if (type === "selector") {
    return (
      <Autocomplete
        disablePortal
        options={options.map((option) => ({
          label: option.name,
          id: option.id,
        }))}
        value={
          options.find((option) => option.id === value)
            ? { label: options.find((option) => option.id === value)?.name, id: value }
            : null
        }
        onChange={(event, newValue) => {
          const customEvent = {
            target: {
              name: name,
              value: newValue?.id || "",
            },
          };
          onChange(customEvent as React.ChangeEvent<HTMLInputElement>);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant="outlined"
            sx={{ minWidth: 120, height: 50, fontSize: 14 }}
          />
        )}
      />
    );
  }

  return (
    <TextField
      fullWidth
      name={name}
      label={label}
      variant="outlined"
      type={type}
      onChange={onChange}
      value={value}
      //   error={error}
      //   helperText={helperText}
      sx={{ marginBottom: 2 }}
      InputProps={{ style: { height: "50px", fontSize: "14px" } }}
      InputLabelProps={{ style: { fontSize: "14px" } }}
            {...(type === "number" ? { min: 0 } : {})}

    />
  );
}