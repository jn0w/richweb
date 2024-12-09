"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import validator from "email-validator";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false); // For Dialog visibility
  const router = useRouter();

  const validateInput = () => {
    let error = "";

    // Validate email
    if (!validator.validate(email)) {
      error += "Invalid email address.\n";
    }

    // Validate password length
    if (password.length < 3 || password.length > 50) {
      error += "Password must be between 3 and 50 characters.\n";
    }

    return error;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationError = validateInput();

    if (validationError) {
      setErrorMessage(validationError);
      setDialogOpen(true); // Open the error dialog
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrorMessage(errorData.message || "Something went wrong.");
        setDialogOpen(true); // Open the error dialog
        return;
      }

      const sessionRes = await fetch("/api/getData");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.session?.role === "manager") {
          router.push("/manager");
        } else {
          router.push("/dashboard");
        }
      } else {
        setErrorMessage("Failed to fetch session data. Please try again.");
        setDialogOpen(true); // Open the error dialog
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setDialogOpen(true); // Open the error dialog
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        padding: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: 400 }}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login
        </Button>
      </form>

      {/* Dialog for Errors */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
