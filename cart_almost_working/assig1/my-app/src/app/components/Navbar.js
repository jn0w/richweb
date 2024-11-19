"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isManager, setIsManager] = useState(false); // State to check manager role
  const router = useRouter();

  useEffect(() => {
    // Check login state and role on page load
    const loggedIn = sessionStorage.getItem("isLoggedIn");
    const role = sessionStorage.getItem("role"); // Store the user's role during login
    setIsLoggedIn(!!loggedIn);
    setIsManager(role === "manager"); // Check if the user is a manager
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("email"); // Clear the stored email
    sessionStorage.removeItem("role"); // Clear the stored role
    setIsLoggedIn(false);
    setIsManager(false);
    router.push("/"); // Redirect to the main page
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component="button"
          onClick={() => router.push("/")}
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
              {isManager && (
                <Button color="inherit" onClick={() => router.push("/manager")}>
                  Manager Dashboard
                </Button>
              )}
              <Button color="inherit" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={() => router.push("/cart")}>
                View Cart
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
