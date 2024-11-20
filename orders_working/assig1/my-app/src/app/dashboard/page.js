"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Navbar from "../components/Navbar"; // Import the Navbar component

// Alert component for Snackbar
const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar visibility state
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Snackbar severity
  const email = sessionStorage.getItem("email"); // Dynamically retrieve email

  // Fetch the products on component mount
  useEffect(() => {
    fetch("/api/getProducts")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data); // Store the fetched products in state
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // Function to handle Snackbar close
  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  // Function to add the product to the shopping cart
  function addToCart(product) {
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, product }), // Use email instead of userId
    })
      .then((res) => {
        if (res.ok) {
          setSnackbarMessage(`Added ${product.pname} to your cart!`);
          setSnackbarSeverity("success");
        } else {
          setSnackbarMessage("Failed to add item to cart. Please try again.");
          setSnackbarSeverity("error");
        }
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        setSnackbarMessage("Failed to add item to cart. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Navbar />

      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        {products.length === 0 ? (
          <Typography>No products available</Typography>
        ) : (
          products.map((item, i) => (
            <Box
              key={i}
              sx={{
                border: "1px solid grey",
                borderRadius: "5px",
                padding: 2,
                marginBottom: 2,
              }}
            >
              <Typography>Unique ID: {item._id}</Typography>
              <Typography>
                {item.pname} - ${item.price}
              </Typography>
              <Button
                onClick={() => addToCart(item)} // Add product to cart
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add to cart
              </Button>
            </Box>
          ))
        )}
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
