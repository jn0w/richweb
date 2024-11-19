"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Navbar from "../components/Navbar";

export default function ManagerDashboard() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Render Navbar */}
      <Navbar />

      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Manager Dashboard
        </Typography>
        <Typography>This is the manager dashboard placeholder.</Typography>
      </Box>
    </Box>
  );
}
