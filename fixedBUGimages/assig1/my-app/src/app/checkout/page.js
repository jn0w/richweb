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
        // Fetch session data to get the user's email
        const sessionRes = await fetch("/api/getData");
        if (!sessionRes.ok) throw new Error("Failed to fetch session data");

        const sessionData = await sessionRes.json();
        if (sessionData.session?.email) {
          setCustomerEmail(sessionData.session.email); // Set the customer's email

          // Fetch cart items based on the email
          const cartRes = await fetch(
            `/api/cart?email=${sessionData.session.email}`
          );
          if (!cartRes.ok) throw new Error("Failed to fetch cart items");

          const cartData = await cartRes.json();
          setCartItems(cartData || []); // Populate the cart items
        } else {
          setErrorMessage("No email found. Please log in."); // Show error if no email is found
        }
      } catch (error) {
        console.error("Error:", error.message);
        setErrorMessage(
          "An error occurred while fetching data. Please try again."
        );
      }
    };

    fetchSessionAndCart();
  }, []);

  // Handle order placement when the user clicks "Place Order"
  const handleCheckout = async () => {
    // Ensure all required fields are filled
    if (!customerName || !customerAddress || !customerPhone) {
      setConfirmationMessage("Please fill in all the required fields.");
      return;
    }

    // Create the order payload
    const orderData = {
      name: customerName,
      email: customerEmail,
      address: customerAddress,
      phone: customerPhone,
      items: cartItems,
    };

    try {
      // Send the order data to the backend
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        // Clear the form and display success message
        setConfirmationMessage("Order placed successfully!");
        setErrorMessage("");
        setCartItems([]); // Clear the cart
        setCustomerName("");
        setCustomerAddress("");
        setCustomerPhone("");
      } else {
        // Show error if order placement fails
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
      <Navbar /> {/* Navbar at the top of the page */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        {/* Display any error messages */}
        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}

        {/* Display cart items or a message if the cart is empty */}
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

            {/* Input fields for customer details */}
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
              disabled // Email is fetched and cannot be edited
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
              onClick={handleCheckout} // Trigger order placement
              sx={{ mt: 2 }}
            >
              Place Order
            </Button>
          </>
        )}

        {/* Display confirmation message if the order is placed */}
        {confirmationMessage && (
          <Typography color="success" sx={{ mt: 2 }}>
            {confirmationMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
