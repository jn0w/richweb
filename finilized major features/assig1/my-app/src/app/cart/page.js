"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Navbar from "../components/Navbar";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [email, setEmail] = useState(null); // Use state for `email`
  const router = useRouter();

  // Fetch email on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmail(sessionStorage.getItem("email"));
    }
  }, []);

  // Fetch cart items on email change
  useEffect(() => {
    if (!email) return;

    fetch(`/api/cart?email=${email}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cart");
        return res.json();
      })
      .then((data) => setCartItems(data || []))
      .catch((error) => console.error("Error fetching cart:", error));
  }, [email]);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const updateCart = (product, action) => {
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, product, action }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSnackbarMessage(
          action === "increment"
            ? `Added another ${product.pname} to your cart!`
            : `Removed one ${product.pname} from your cart!`
        );
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        fetch(`/api/cart?email=${email}`)
          .then((res) => res.json())
          .then((data) => setCartItems(data || []));
      })
      .catch((error) => {
        console.error("Error updating cart:", error);
        setSnackbarMessage("Failed to update cart. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const proceedToCheckout = () => router.push("/checkout");

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
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={proceedToCheckout}
          >
            Proceed to Checkout
          </Button>
        )}
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
