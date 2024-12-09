"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import validator from "email-validator"; // Import email-validator for client-side validation
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Error messages
  const [successMessage, setSuccessMessage] = useState(""); // Success messages
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [dialogOpen, setDialogOpen] = useState(false); // Dialog visibility
  const router = useRouter();

  // Validation function to check all inputs
  const validateForm = () => {
    let error = "";

    // Validate email
    if (!validator.validate(email)) {
      error += "Invalid email address.\n";
    }

    // Validate password length
    if (password.length < 3 || password.length > 50) {
      error += "Password must be between 3 and 50 characters.\n";
    }

    // Validate required fields
    if (!name.trim() || !address.trim() || !phone.trim()) {
      error += "All fields must be filled out.\n";
    }

    // Validate phone format (digits only)
    if (!/^\d{8,15}$/.test(phone)) {
      error += "Phone number must contain 8-15 digits.\n";
    }

    return error;
  };

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Perform validation
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setSuccessMessage("");
      setDialogOpen(true);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, address, phone }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrorMessage(errorData.message || "Something went wrong.");
        setSuccessMessage("");
        setDialogOpen(true);
        setIsLoading(false);
        return;
      }

      // Success: Inform the user and redirect to the home page
      setSuccessMessage("Registration successful! Redirecting to home...");
      setErrorMessage("");
      setName("");
      setEmail("");
      setPassword("");
      setAddress("");
      setPhone("");
      setDialogOpen(true);

      setTimeout(() => {
        router.push("/"); // Redirect to the home page after registration
      }, 2000); // Redirect to home after 2 seconds
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("An error occurred. Please try again.");
      setSuccessMessage("");
      setDialogOpen(true);
    } finally {
      setIsLoading(false);
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
        Register
      </Typography>
      <form onSubmit={handleRegister} style={{ width: "100%", maxWidth: 400 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={isLoading}
        >
          {isLoading ? "Registering..." : "Register"}
        </Button>
      </form>

      {/* Dialog for Errors/Success */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{successMessage ? "Success" : "Error"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {successMessage || errorMessage}
          </DialogContentText>
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
