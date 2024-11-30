import { MongoClient } from "mongodb";

const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

// Cache variables for MongoDB client and database to optimize performance
let cachedClient = null;
let cachedDb = null;

// Function to connect to the MongoDB database
async function connectToDatabase() {
  // Use cached connection if available to avoid redundant connections
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Establish a new connection to MongoDB
    const client = await MongoClient.connect(mongoURI);
    const db = client.db();

    // Cache the client and database for reuse
    cachedClient = client;
    cachedDb = db;

    console.log("Database connected successfully");
    return { client, db }; // Return the connected client and database
  } catch (error) {
    console.log("Error connecting to the database", error);
    throw new Error("Database connection failed"); // Throw an error if connection fails
  }
}

// API route handler for GET requests to fetch products
export async function GET(req) {
  try {
    // Connect to the database
    const { db } = await connectToDatabase();
    const productsCollection = db.collection("products"); // Reference the "products" collection

    // Fetch products with pname, price, image, and description
    const products = await productsCollection
      .find({}, { projection: { pname: 1, price: 1, image: 1, des: 1 } })
      .toArray();

    // Return the products as a JSON response
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    // Return an error response if something goes wrong
    return new Response(
      JSON.stringify({ message: "Database connection failed" }),
      { status: 500 }
    );
  }
}
