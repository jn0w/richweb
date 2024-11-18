"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Navbar from "../components/Navbar"; // Import the Navbar component

export default function DashboardPage() {
  const [products, setProducts] = useState([]);

  // Fetch the products on component mount
  useEffect(() => {
    fetch("http://localhost:3000/api/getProducts")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data); // Store the fetched products in state
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // Function to add the product to the shopping cart
  function putInCart(pname) {
    console.log("Adding to cart:", pname);
    fetch(`http://localhost:3000/api/putInCart?pname=${pname}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Item added to cart:", data);
      })
      .catch((error) => console.error("Error adding to cart:", error));
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Render Navbar */}
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
                onClick={() => putInCart(item.pname)} // Add product to cart
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add to cart
              </Button>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}