"use client";
import * as React from "react";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { Box } from "@mui/material";
import { CheckCircle, Warning, Error, Info } from "@mui/icons-material";

interface ToastMessageProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: AlertColor; // "success" | "warning" | "error" | "info"
  autoHideDuration?: number;
  showProgress?: boolean;
  icon?: React.ReactNode;
}

export default function ToastMessage({
  open,
  onClose,
  message,
  severity = "success",
  autoHideDuration = 6000,
  showProgress = true,
  icon,
}: ToastMessageProps) {
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    if (open) {
      setProgress(100);
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        setProgress(100 - (elapsedTime / autoHideDuration) * 100);
        if (elapsedTime >= autoHideDuration) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [open, autoHideDuration]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;
    onClose();
    setProgress(100);
  };

  // Default icons based on severity
  const defaultIcons: Record<string, React.ReactNode> = {
    success: <CheckCircle />,
    warning: <Warning />,
    error: <Error />,
    info: <Info />,
  };

  return (
    <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={handleClose}>
      <Box sx={{ width: "100%" }}>
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: "100%", display: "flex", alignItems: "center" }}
          icon={icon ?? defaultIcons[severity]}
        >
          {message}
        </Alert>
        {showProgress && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 5, borderRadius: 2 }}
          />
        )}
      </Box>
    </Snackbar>
  );
}
