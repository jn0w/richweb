"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function LoginPage() {
  // State variables to manage user input and error messages
  const [email, setEmail] = useState(""); // Email input
  const [password, setPassword] = useState(""); // Password input
  const [errorMessage, setErrorMessage] = useState(""); // Error message for login issues
  const router = useRouter(); // For navigating to other pages after login

  // Function to handle the login process
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      // Send login request to the API with the entered email and password
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // If login fails, display the error message from the server
        const errorData = await res.json();
        setErrorMessage(errorData.message);
        return;
      }

      // Fetch session data to determine user role for redirection
      const sessionRes = await fetch("/api/getData");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();

        // Redirect user to the appropriate page based on their role
        if (sessionData.session?.role === "manager") {
          router.push("/manager"); // Redirect to manager dashboard
        } else {
          router.push("/dashboard"); // Redirect to user dashboard
        }
      } else {
        // Handle errors in fetching session data
        setErrorMessage("Failed to fetch session data. Please try again.");
      }
    } catch (error) {
      // Handle any unexpected errors during the login process
      console.error("Login error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh", // Full-screen height
        padding: 2, // Add some padding around the box
      }}
    >
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>

      {/* Login form */}
      <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: 400 }}>
        {/* Email input field */}
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update email state
          required // Make this field mandatory
        />

        {/* Password input field */}
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update password state
          required // Make this field mandatory
        />

        {/* Display error message if there is an issue */}
        {errorMessage && (
          <Typography color="error" variant="body2" gutterBottom>
            {errorMessage}
          </Typography>
        )}

        {/* Login button */}
        <Button
          type="submit" // Submit form when clicked
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }} // Add some margin on top
        >
          Login
        </Button>
      </form>
    </Box>
  );
}
