import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

// API route handler for user registration (POST request)
export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();
    const { name, email, password, address, phone } = body;

    // Validate that all required fields are provided
    if (!name || !email || !password || !address || !phone) {
      return new Response(
        JSON.stringify({ message: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Connect to MongoDB
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("sampleDatabase");
    const usersCollection = db.collection("users");

    // Check if the email is already registered
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      await client.close();
      return new Response(
        JSON.stringify({ message: "Email is already registered" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Hash the user's password for secure storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    const newUser = {
      name, // User's name
      email, // User's email
      password: hashedPassword, // Hashed password
      address, // User's address
      phone, // User's phone number
      role: "customer", // Default role for new users
    };

    // Insert the new user into the database
    const result = await usersCollection.insertOne(newUser);
    await client.close(); // Close the database connection

    // Respond with success message and the new user's ID
    return new Response(
      JSON.stringify({
        message: "Registration successful",
        userId: result.insertedId,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Log and return a generic error response in case of failure
    console.error("Error during registration:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
