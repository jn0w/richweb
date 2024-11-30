"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Navbar from "../components/Navbar";

export default function CheckoutPage() {
  // State variables for cart items and customer details
  const [cartItems, setCartItems] = useState([]); // List of items in the cart
  const [customerName, setCustomerName] = useState(""); // Customer's name
  const [customerEmail, setCustomerEmail] = useState(""); // Customer's email
  const [customerAddress, setCustomerAddress] = useState(""); // Customer's address
  const [customerPhone, setCustomerPhone] = useState(""); // Customer's phone
  const [confirmationMessage, setConfirmationMessage] = useState(""); // Success message after order placement
  const [errorMessage, setErrorMessage] = useState(""); // Error message for any issues

  // Fetch session data and cart items when the component loads
  useEffect(() => {
    const fetchSessionAndCart = async () => {
      try {
        const sessionRes = await fetch("/api/getData");
        if (!sessionRes.ok) throw new Error("Failed to fetch session data");

        const sessionData = await sessionRes.json();
        if (sessionData.session?.email) {
          setCustomerEmail(sessionData.session.email); // Set the customer's email

          const cartRes = await fetch("/api/cart");
          if (!cartRes.ok) throw new Error("Failed to fetch cart items");

          const cartData = await cartRes.json();
          // Ensure cartItems is an array
          setCartItems(cartData.items || []);
        } else {
          setErrorMessage("No email found. Please log in.");
        }
      } catch (error) {
        console.error("Error fetching session or cart items:", error.message);
        setErrorMessage(
          "An error occurred while fetching data. Please try again."
        );
        setCartItems([]); // Default to empty array on error
      }
    };

    fetchSessionAndCart();
  }, []);

  const handleCheckout = async () => {
    if (!customerName || !customerAddress || !customerPhone) {
      setConfirmationMessage("Please fill in all the required fields.");
      return;
    }

    const orderData = {
      name: customerName,
      email: customerEmail,
      address: customerAddress,
      phone: customerPhone,
      items: cartItems,
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setConfirmationMessage("Order placed successfully!");
        setErrorMessage("");
        setCartItems([]);
        setCustomerName("");
        setCustomerAddress("");
        setCustomerPhone("");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to place the order.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setErrorMessage("An error occurred while placing the order.");
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Navbar />
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}

        {cartItems.length === 0 ? (
          <Typography>Your cart is empty</Typography>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Your Items
            </Typography>
            {cartItems.map((item, index) => (
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
                  {item.quantity} x {item.pname} - ${item.price}
                </Typography>
              </Box>
            ))}

            <Typography variant="h6" gutterBottom>
              Customer Details
            </Typography>

            <TextField
              label="Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              value={customerEmail}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="Address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckout}
              sx={{ mt: 2 }}
            >
              Place Order
            </Button>
          </>
        )}

        {confirmationMessage && (
          <Typography color="success" sx={{ mt: 2 }}>
            {confirmationMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
