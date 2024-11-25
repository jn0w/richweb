"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Navbar from "../components/Navbar";

export default function ManagerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // Fetch orders and verify session on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const sessionRes = await fetch("/api/getData");
        if (!sessionRes.ok) throw new Error("Failed to fetch session data");

        const sessionData = await sessionRes.json();
        if (sessionData.session?.role !== "manager") {
          setErrorMessage("Unauthorized access.");
          router.push("/login"); // Redirect to login if not authorized
          return;
        }

        const ordersRes = await fetch("/api/checkout");
        if (!ordersRes.ok) throw new Error("Failed to fetch orders");

        const ordersData = await ordersRes.json();
        const formattedOrders = ordersData.map((order) => ({
          ...order,
          createdAt: order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "Unknown Date",
        }));
        setOrders(formattedOrders);
      } catch (error) {
        console.error("Error fetching orders or session:", error);
        setErrorMessage("Failed to fetch orders or session data.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Render Navbar */}
      <Navbar />

      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Manager Dashboard
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : errorMessage ? (
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
