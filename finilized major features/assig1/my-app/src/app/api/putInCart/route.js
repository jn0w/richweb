// app/api/putInCart/route.js

import { MongoClient } from "mongodb";

// MongoDB connection URI
const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

export async function GET(req) {
  console.log("In the putInCart API page");

  // Get the product name from query parameters
  const { searchParams } = new URL(req.url);
  const pname = searchParams.get("pname");

  // Log the pname to the console
  console.log("Product to add to cart:", pname);

  if (!pname) {
    return new Response(
      JSON.stringify({ message: "Product name is required" }),
      { status: 400 }
    );
  }

  try {
    // Connect to MongoDB
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db();
    const collection = db.collection("shopping_cart");

    // Insert the product into the shopping_cart collection
    const myobj = { pname: pname, username: "sample@test.com" }; // Example username, you can replace it with actual user info
    const insertResult = await collection.insertOne(myobj);

    // Close the connection
    await client.close();

    // Respond back with a success message
    return new Response(
      JSON.stringify({ message: `Added ${pname} to the cart` }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error inserting into cart:", error);
    return new Response(JSON.stringify({ message: "Error adding to cart" }), {
      status: 500,
    });
  }
}
