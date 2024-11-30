import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import { getCustomSession } from "../sessionCode/route.js";

const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

// API route handler for user login (POST request)
export async function POST(req) {
  try {
    // Parse the request body to extract email and password
    const body = await req.json();
    const { email, password } = body;

    // Validate that both email and password are provided
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to MongoDB
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("sampleDatabase");
    const usersCollection = db.collection("users");

    // Check if the user exists in the database
    const user = await usersCollection.findOne({ email });
    if (!user) {
      await client.close();
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate the provided password against the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await client.close();
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create and save a session for the logged-in user
    const session = await getCustomSession();
    session.email = email; // Save the user's email in the session
    session.role = user.role; // Save the user's role in the session
    await session.save(); // Persist the session

    await client.close(); // Close the database connection

    // Return a success response with user role
    return new Response(
      JSON.stringify({
        message: "Login successful",
        role: user.role, // Role sent for frontend purposes
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Log and return a generic error response in case of failure
    console.error("Error during login:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
