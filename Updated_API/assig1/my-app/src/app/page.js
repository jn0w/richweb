"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Navbar from "./components/Navbar";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch session data to check if the user is logged in
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/getData");
        if (res.ok) {
          const data = await res.json();
          if (data.session && data.session.email) {
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    };

    fetchSession();
  }, []);

  const handleLogin = () => {
    router.push("/login"); // Navigate to login page
  };

  const handleDashboard = () => {
    router.push("/dashboard"); // Navigate to dashboard
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Render Navbar */}
      <Navbar />

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
          p: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome to MyApp!
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          {isLoggedIn
            ? "Go to your dashboard to browse our delicious doughnuts!"
            : "Please log in to browse products and make purchases. Enjoy a seamless shopping experience!"}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={isLoggedIn ? handleDashboard : handleLogin}
          sx={{ px: 4, py: 1.5, fontSize: "1rem" }}
        >
          {isLoggedIn ? "Go to Dashboard" : "Log In"}
        </Button>
      </Box>
    </Box>
  );
}
