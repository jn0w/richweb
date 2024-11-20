"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Navbar from "../components/Navbar";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState(
    sessionStorage.getItem("email") || ""
  );
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch cart items on page load
  useEffect(() => {
    if (!customerEmail) {
      setErrorMessage("No email found. Please log in.");
      return;
    }

    fetch(`/api/cart?email=${customerEmail}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cart items");
        return res.json();
      })
      .then((data) => setCartItems(data || []))
      .catch((error) => {
        console.error("Error fetching cart items:", error);
        setErrorMessage("Error fetching cart items.");
      });
  }, [customerEmail]);

  // Handle form submission
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
        setCartItems([]); // Clear the cart
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
