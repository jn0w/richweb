"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check login state on page load
    const loggedIn = sessionStorage.getItem("isLoggedIn");
    setIsLoggedIn(!!loggedIn);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn"); // Clear session storage
    setIsLoggedIn(false); // Update state
    router.push("/"); // Redirect to the main page
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component="button" // Make the title clickable
          onClick={() => router.push("/")} // Redirect to homepage
          sx={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "1.25rem",
            fontWeight: "bold",
          }}
        >
          MyApp
        </Typography>
        <div>
          {!isLoggedIn ? (
            <>
              <Button color="inherit" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button color="inherit" onClick={() => router.push("/register")}>
                Register
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
