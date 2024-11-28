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
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar visibility state
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Snackbar severity
  const [email, setEmail] = useState(null); // Email from session
  const router = useRouter(); // Initialize the router

  // Fetch email from Iron Session on component mount
  useEffect(() => {
    fetch("/api/getData")
      .then((res) => res.json())
      .then((data) => {
        if (data.session && data.session.email) {
          setEmail(data.session.email);
        } else {
          console.error("No email found in session");
          setEmail(null);
        }
      })
      .catch((error) => console.error("Error fetching session data:", error));
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

  // Handle Snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Update cart item quantity
  const updateCart = (product, action) => {
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, product, action }),
    })
      .then((res) => res.json())
      .then(() => {
        // Show Snackbar Feedback
        setSnackbarMessage(
          action === "increment"
            ? `Added another ${product.pname} to your cart!`
            : `Removed one ${product.pname} from your cart!`
        );
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        // Refresh the cart items
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

  // Navigate to checkout page
  const proceedToCheckout = () => {
    router.push("/checkout"); // Redirect to the checkout page
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
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={proceedToCheckout} // Call the navigate function
          >
            Proceed to Checkout
          </Button>
        )}
      </Box>

      {/* Snackbar for feedback */}
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
