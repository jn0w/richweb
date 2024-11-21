"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Navbar from "../components/Navbar"; // Import the Navbar component

export default function MyApp() {
  const [showLogin, setShowLogin] = useState(false);
  const [showDash, setShowDash] = useState(false);
  const [showFirstPage, setShowFirstPage] = useState(true);

  // State to hold the products data
  const [products, setProducts] = useState([]);

  // Fetch the products when the Dashboard is shown
  useEffect(() => {
    if (showDash) {
      fetch("http://localhost:3000/api/getProducts")
        .then((res) => res.json())
        .then((data) => {
          setProducts(data); // Store the fetched products in state
        })
        .catch((error) => console.error("Error fetching products:", error));
    }
  }, [showDash]); // Run this useEffect when showDash changes

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

  function runShowLogin() {
    setShowFirstPage(false);
    setShowLogin(true);
    setShowDash(false);
  }

  function runShowDash() {
    setShowFirstPage(false);
    setShowLogin(false);
    setShowDash(true);
  }

  function runShowFirst() {
    setShowFirstPage(true);
    setShowLogin(false);
    setShowDash(false);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Render Navbar */}
      <Navbar />

      {showFirstPage && (
        <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
          This is a very basic application. This has a bar across the top and
          this box! How this apps work is by creating two boxes. They are hidden
          in the background of the page. It is only when a user clicks one of
          the buttons, we change the "state" from hidden (false) to show (true)
        </Box>
      )}

      {showLogin && (
        <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
          This box is hidden until you click the button!. Imagine this is one
          page in your app!
        </Box>
      )}

      {showDash && (
        <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
          <h2>Dashboard</h2>
          {products.length === 0 ? (
            <p>No products available</p>
          ) : (
            products.map((item, i) => (
              <div style={{ padding: "20px" }} key={i}>
                <p>Unique ID: {item._id}</p>
                <p>
                  {item.pname} - ${item.price}
                </p>
                <Button
                  onClick={() => putInCart(item.pname)} // Add product to cart
                  variant="outlined"
                >
                  Add to cart
                </Button>
              </div>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
