"use client";

import React, { useState, useRef } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ToastMessage from "@/components/dashboard/ToastMessage"; // Import ToastMessage component
import { fetchDataJson } from "./fetch";
import { AlertColor } from "@mui/material";

type ToastState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
};

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
   const [toast, setToast] = useState<{
      open: boolean;
      message: string;
      severity: AlertColor;
    }>({
      open: false,
      message: "",
      severity: "success",
    });

  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleEmailSubmit = async () => {
    try {
      setToast({
        open: true,
        message: "Your Request is being processed...",
        severity: "info",
      });
      const response = (await fetchDataJson("forgot-password", {
        method: "POST",
        body: JSON.stringify({ email, device_name: "web" }),
      })) as {
        status: string;
        message?: string;
        data?: { token: string; user: object };
      };

      if (response.status === "success") {
        setToast({
          open: true,
          message: "OTP sent successfully!",
          severity: "success",
        });
        setStep("otp");
        if (response.data) {
          localStorage.setItem("user-token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      } else {
        throw new Error(response.message || "Failed to send OTP.");
      }
    } catch (error) {
      setToast({
        open: true,
        message: String(error),
        severity: "error",
      });
    }
  };

  const handleOtpSubmit = async () => {
    try {
      setToast({
        open: true,
        message: "Your Request is being processed...",
        severity: "info",
      });
      const otpCode = otp.join("");
      const response = (await fetchDataJson("verify-otp", {
        method: "POST",
        body: JSON.stringify({ otp: otpCode }),
      })) as { status: string; message?: string };

      if (response.status === "success") {
        setToast({
          open: true,
          message: "OTP verified successfully!",
          severity: "success",
        });
        setStep("reset");
      } else {
        throw new Error(response.message || "Failed to verify OTP.");
      }
    } catch (error) {
      setToast({
        open: true,
        message: String(error),
        severity: "error",
      });
    }
  };

  const handleResetPasswordSubmit = async () => {
    try {
      setToast({
        open: true,
        message: "Your Request is being processed...",
        severity: "info",
      });
      const response = (await fetchDataJson("reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })) as { status: string; message?: string };

      if (response.status === "success") {
        setToast({
          open: true,
          message: "Password reset successfully!",
          severity: "success",
        });
        // Optionally redirect to login page
      } else {
        throw new Error(response.message || "Failed to reset password.");
      }
    } catch (error) {
      setToast({
        open: true,
        message: String(error),
        severity: "error",
      });
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Allow only digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Automatically move to the next input if a digit is entered
    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      // Focus the previous input
      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow">
        {step === "email" && (
          <>
            <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
            <TextField
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleEmailSubmit}
            >
              Send OTP
            </Button>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-2xl font-bold mb-4">Verify OTP</h1>
            <div className="flex justify-center gap-2">
              {otp.map((value, index) => (
                <TextField
                  key={index}
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) =>
                    handleKeyDown(
                      e as React.KeyboardEvent<HTMLInputElement>,
                      index
                    )
                  }
                  inputProps={{ maxLength: 1 }}
                  className="w-12 text-center"
                  inputRef={(el) => {
                    inputsRef.current[index] = el!;
                  }}
                />
              ))}
            </div>
            <Button
              sx={{ marginTop: "16px" }}
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleOtpSubmit}
              className="mt-4"
            >
              Verify OTP
            </Button>
          </>
        )}

        {step === "reset" && (
          <>
            <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
            <TextField
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleResetPasswordSubmit}
              className="mt-4"
            >
              Reset Password
            </Button>
          </>
        )}
      </div>

      {/* <ToastMessage
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      /> */}
      <ToastMessage
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </div>
  );
}
