import { MongoClient } from "mongodb";

const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

// Cache variables for MongoDB client and database to avoid reconnecting repeatedly
let cachedClient = null;
let cachedDb = null;

// Function to establish a connection to the MongoDB database
async function connectToDatabase() {
  // Use cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Create a new connection to MongoDB
    const client = await MongoClient.connect(mongoURI);
    const db = client.db();

    // Cache the client and database for future use
    cachedClient = client;
    cachedDb = db;

    console.log("Database connected successfully");
    return { client, db }; // Return the connected client and database
  } catch (error) {
    console.log("Error connecting to the database", error);
    throw new Error("Database connection failed"); // Throw an error if connection fails
  }
}

// Handle GET requests to check database connectivity
export async function GET(req) {
  try {
    // Attempt to connect to the database
    await connectToDatabase();

    // Respond with a success message if connection is successful
    return new Response(
      JSON.stringify({ message: "Database connected successfully" }),
      { status: 200 }
    );
  } catch (error) {
    // Respond with an error message if connection fails
    return new Response(
      JSON.stringify({ message: "Database connection failed" }),
      { status: 500 }
    );
  }
}
