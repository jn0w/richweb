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

  // Fetch session data
  useEffect(() => {
    fetch("/api/getData")
      .then((res) => res.json())
      .then((data) => {
        if (data.session && data.session.email) {
          setIsLoggedIn(true);
          setRole(data.session.role || "");
          setEmail(data.session.email || "");
        } else {
          setIsLoggedIn(false);
          setRole("");
          setEmail("");
        }
      })
      .catch((error) => console.error("Error fetching session data:", error));
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              {role === "manager" && (
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
