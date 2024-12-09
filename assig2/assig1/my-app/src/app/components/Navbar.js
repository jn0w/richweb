"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(""); // Role from session
  const [email, setEmail] = useState(""); // Email from session
  const router = useRouter();

  // Fetch session data on component mount
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const res = await fetch("/api/getData");
        if (!res.ok) throw new Error("Failed to fetch session data");
        const data = await res.json();

        if (data.session && data.session.email) {
          setIsLoggedIn(true);
          setRole(data.session.role || "");
          setEmail(data.session.email || "");
        } else {
          setIsLoggedIn(false);
          setRole("");
          setEmail("");
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
        setIsLoggedIn(false);
        setRole("");
        setEmail("");
      }
    };

    fetchSessionData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        // Clear session data on logout
        setIsLoggedIn(false);
        setRole("");
        setEmail("");
        router.push("/"); // Redirect to home after logout
      } else {
        console.error("Logout failed:", await res.text());
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Application title redirects to the home page */}
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

        {/* Right-hand side of the Navbar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Show different buttons based on login state */}
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
              {/* Show manager-specific options if the role is 'manager' */}
              {role === "manager" && (
                <Button color="inherit" onClick={() => router.push("/manager")}>
                  Manager Dashboard
                </Button>
              )}
              {/* Common options for logged-in users */}
              <Button color="inherit" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={() => router.push("/cart")}>
                View Cart
              </Button>
              <Typography variant="body2">{email}</Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
