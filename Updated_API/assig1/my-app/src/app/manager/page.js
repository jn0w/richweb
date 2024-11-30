"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Navbar from "../components/Navbar";

export default function ManagerDashboard() {
  // State variables to manage orders, loading state, and error messages
  const [orders, setOrders] = useState([]); // List of fetched orders
  const [loading, setLoading] = useState(true); // Loading state
  const [errorMessage, setErrorMessage] = useState(""); // Error message for unauthorized access or API errors
  const router = useRouter(); // For navigating to other pages

  // Fetch orders and verify session on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch session data to check if the user is authorized
        const sessionRes = await fetch("/api/getData");
        if (!sessionRes.ok) throw new Error("Failed to fetch session data");

        const sessionData = await sessionRes.json();
        if (sessionData.session?.role !== "manager") {
          // Redirect if the user is not a manager
          setErrorMessage("Unauthorized access.");
          router.push("/login");
          return;
        }

        // Fetch orders data from the API
        const ordersRes = await fetch("/api/checkout");
        if (!ordersRes.ok) throw new Error("Failed to fetch orders");

        const ordersData = await ordersRes.json();

        // Format the orders with readable dates
        const formattedOrders = ordersData.map((order) => ({
          ...order,
          createdAt: order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "Unknown Date",
        }));

        // Update orders state
        setOrders(formattedOrders);
      } catch (error) {
        // Handle errors during data fetching
        console.error("Error fetching orders or session:", error);
        setErrorMessage("Failed to fetch orders or session data.");
      } finally {
        // Ensure loading state is set to false after data fetching
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]); // Dependency array to ensure `router` updates trigger the effect

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Render Navbar */}
      <Navbar />

      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Manager Dashboard
        </Typography>

        {/* Display loading message, error message, or orders */}
        {loading ? (
          <Typography>Loading...</Typography> // Show a loading message while fetching data
        ) : errorMessage ? (
          <Typography color="error">{errorMessage}</Typography> // Show error message if there's an issue
        ) : orders.length === 0 ? (
          <Typography>No orders available</Typography> // Handle case where no orders are present
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              All Orders
            </Typography>
            {/* Render the list of orders */}
            {orders.map((order, index) => (
              <Box
                key={index} // Use index as a key for unique order rendering
                sx={{
                  border: "1px solid grey",
                  borderRadius: "5px",
                  padding: 2,
                  marginBottom: 2,
                }}
              >
                {/* Display order details */}
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
                {/* Render order items */}
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
