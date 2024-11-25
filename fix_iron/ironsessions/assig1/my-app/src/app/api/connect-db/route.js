// app/api/connect-db/route.js

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
    const client = await MongoClient.connect(mongoURI); // Removed deprecated options
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

// Define the API route handler for the GET request
export async function GET(req) {
  try {
    await connectToDatabase();
    return new Response(
      JSON.stringify({ message: "Database connected successfully" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Database connection failed" }),
      { status: 500 }
    );
  }
}
