"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Navbar from "../components/Navbar";

export default function ManagerDashboard() {
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch orders on component mount
  useEffect(() => {
    fetch("/api/checkout")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }
        return res.json();
      })
      .then((data) => {
        // Format orders and ensure fields are valid
        const formattedOrders = data.map((order) => ({
          ...order,
          createdAt: order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "Unknown Date",
        }));
        setOrders(formattedOrders);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setErrorMessage("Failed to fetch orders. Please try again.");
      });
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Render Navbar */}
      <Navbar />

      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Manager Dashboard
        </Typography>

        {errorMessage ? (
          <Typography color="error">{errorMessage}</Typography>
        ) : orders.length === 0 ? (
          <Typography>No orders available</Typography>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              All Orders
            </Typography>
            {orders.map((order, index) => (
              <Box
                key={index}
                sx={{
                  border: "1px solid grey",
                  borderRadius: "5px",
                  padding: 2,
                  marginBottom: 2,
                }}
              >
                <Typography>
                  <strong>Order ID:</strong> {order._id}
                </Typography>
                <Typography>
                  <strong>Customer Name:</strong> {order.name || "N/A"}
                </Typography>
                <Typography>
                  <strong>Customer Email:</strong> {order.email || "N/A"}
                </Typography>
                <Typography>
                  <strong>Address:</strong> {order.address || "N/A"}
                </Typography>
                <Typography>
                  <strong>Phone:</strong> {order.phone || "N/A"}
                </Typography>
                <Typography>
                  <strong>Order Date:</strong> {order.createdAt}
                </Typography>
                <Typography>
                  <strong>Items:</strong>
                </Typography>
                {order.items.map((item, i) => (
                  <Typography key={i} sx={{ ml: 2 }}>
                    {item.quantity} x {item.pname} - ${item.price}
                  </Typography>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
