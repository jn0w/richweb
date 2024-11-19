"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Navbar from "../components/Navbar";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const email = sessionStorage.getItem("email");

  // Fetch cart items on component mount
  useEffect(() => {
    if (!email) {
      console.error("No email found in session storage");
      return;
    }

    fetch(`/api/cart?email=${email}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cart");
        return res.json();
      })
      .then((data) => setCartItems(data || []))
      .catch((error) => console.error("Error fetching cart:", error));
  }, [email]);

  // Update cart item quantity
  const updateCart = (product, action) => {
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, product, action }),
    })
      .then((res) => res.json())
      .then(() => {
        fetch(`/api/cart?email=${email}`)
          .then((res) => res.json())
          .then((data) => setCartItems(data || []));
      })
      .catch((error) => console.error("Error updating cart:", error));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Navbar />

      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Your Cart
        </Typography>
        {cartItems.length === 0 ? (
          <Typography>Your cart is empty</Typography>
        ) : (
          cartItems.map((item, i) => (
            <Box
              key={i}
              sx={{
                border: "1px solid grey",
                borderRadius: "5px",
                padding: 2,
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography>
                {item.quantity} x {item.pname} - ${item.price}
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => updateCart(item, "increment")}
                  sx={{ marginRight: 1 }}
                >
                  +
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => updateCart(item, "decrement")}
                >
                  -
                </Button>
              </Box>
            </Box>
          ))
        )}
        {cartItems.length > 0 && (
          <Button variant="contained" color="primary" sx={{ mt: 2 }}>
            Proceed to Checkout
          </Button>
        )}
      </Box>
    </Box>
  );
}
