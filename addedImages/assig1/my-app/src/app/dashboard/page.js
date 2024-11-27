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
  const [weather, setWeather] = useState(null); // Weather state
  const [email, setEmail] = useState(""); // Email fetched from session

  // Fetch user session and products on component mount
  useEffect(() => {
    const fetchSessionAndProducts = async () => {
      try {
        const sessionRes = await fetch("/api/getData");
        if (!sessionRes.ok) throw new Error("Failed to fetch session data");
        const sessionData = await sessionRes.json();

        if (sessionData.session && sessionData.session.email) {
          setEmail(sessionData.session.email); // Fetch and set email from session
        } else {
          console.error("No session email found");
        }

        const productsRes = await fetch("/api/getProducts");
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        const productsData = await productsRes.json();
        setProducts(productsData || []);
      } catch (error) {
        console.error("Error fetching session or products:", error);
      }
    };

    fetchSessionAndProducts();
  }, []);

  // Fetch weather data
  useEffect(() => {
    fetch("/api/getWeather")
      .then((res) => res.json())
      .then((data) => {
        setWeather(data.temp); // Store the weather data
      })
      .catch((error) => console.error("Error fetching weather data:", error));
  }, []);

  // Function to handle Snackbar close
  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  // Function to add the product to the shopping cart
  const addToCart = async (product) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product }), // Use email fetched from session
      });

      if (res.ok) {
        setSnackbarMessage(`Added ${product.pname} to your cart!`);
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Failed to add item to cart. Please try again.");
        setSnackbarSeverity("error");
      }
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setSnackbarMessage("Failed to add item to cart. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Navbar />

      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {/* Display weather information */}
        <Typography variant="h6" gutterBottom>
          Today's Temperature:{" "}
          {weather !== null ? `${weather}°C` : "Loading..."}
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
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Render product image */}
              <img
                src={item.image}
                alt={item.pname}
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
              <Box>
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
