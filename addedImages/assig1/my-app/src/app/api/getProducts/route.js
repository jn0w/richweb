// app/api/getProducts/route.js

import { MongoClient } from "mongodb";

const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await MongoClient.connect(mongoURI);
    const db = client.db();

    cachedClient = client;
    cachedDb = db;

    console.log("Database connected successfully");
    return { client, db };
  } catch (error) {
    console.log("Error connecting to the database", error);
    throw new Error("Database connection failed");
  }
}

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const productsCollection = db.collection("products"); // Reference to products collection

    // Fetch only relevant fields (e.g., pname, price, and image)
    const products = await productsCollection
      .find({}, { projection: { pname: 1, price: 1, image: 1 } })
      .toArray();

    // Return products as JSON
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Database connection failed" }),
      { status: 500 }
    );
  }
}
