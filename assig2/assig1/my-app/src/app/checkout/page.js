"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import validator from "email-validator";
import Navbar from "../components/Navbar";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSessionAndCart = async () => {
      try {
        const sessionRes = await fetch("/api/getData");
        if (!sessionRes.ok) throw new Error("Failed to fetch session data");

        const sessionData = await sessionRes.json();
        if (sessionData.session?.email) {
          setCustomerEmail(sessionData.session.email);

          const cartRes = await fetch(
            `/api/cart?email=${sessionData.session.email}`
          );
          if (!cartRes.ok) throw new Error("Failed to fetch cart items");

          const cartData = await cartRes.json();
          setCartItems(cartData || []);
        } else {
          setDialogTitle("Error");
          setDialogMessage("No email found. Please log in.");
          setDialogOpen(true);
        }
      } catch (error) {
        console.error("Error:", error.message);
        setDialogTitle("Error");
        setDialogMessage(
          "An error occurred while fetching data. Please try again."
        );
        setDialogOpen(true);
      }
    };

    fetchSessionAndCart();
  }, []);

  const validateForm = () => {
    let error = "";

    if (!customerName.trim() || customerName.length > 50) {
      error += "Name is required and must be less than 50 characters.\n";
    }

    if (!validator.validate(customerEmail)) {
      error += "Invalid email address.\n";
    }

    if (!customerAddress.trim() || customerAddress.length > 100) {
      error += "Address is required and must be less than 100 characters.\n";
    }

    if (!/^\d{8,15}$/.test(customerPhone)) {
      error += "Phone number must contain 8-15 digits.\n";
    }

    return error;
  };

  const handleCheckout = async () => {
    const validationError = validateForm();
    if (validationError) {
      setDialogTitle("Error");
      setDialogMessage(validationError);
      setDialogOpen(true);
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
        setDialogTitle("Success");
        setDialogMessage("Order placed successfully!");
        setDialogOpen(true);
        setCartItems([]);
        setCustomerName("");
        setCustomerAddress("");
        setCustomerPhone("");
      } else {
        const errorData = await response.json();
        setDialogTitle("Error");
        setDialogMessage(errorData.message || "Failed to place the order.");
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setDialogTitle("Error");
      setDialogMessage("An error occurred while placing the order.");
      setDialogOpen(true);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Navbar />
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

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

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText>{dialogMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
