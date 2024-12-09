import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import validator from "email-validator"; // Import email-validator for server-side validation

const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

// API route handler for user registration (POST request)
export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();
    const { name, email, password, address, phone } = body;

    // Validate fields
    if (!name || !email || !password || !address || !phone) {
      return new Response(
        JSON.stringify({ message: "All fields are required." }),
        { status: 400 }
      );
    }

    // Validate email format
    if (!validator.validate(email)) {
      return new Response(
        JSON.stringify({ message: "Invalid email format." }),
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 3 || password.length > 50) {
      return new Response(
        JSON.stringify({
          message: "Password must be between 6 and 50 characters.",
        }),
        { status: 400 }
      );
    }

    // Validate input lengths for other fields
    if (
      name.length > 50 ||
      email.length > 100 ||
      address.length > 100 ||
      phone.length > 15
    ) {
      return new Response(
        JSON.stringify({
          message: "Input values exceed allowed length.",
        }),
        { status: 400 }
      );
    }

    // Validate phone number (only digits allowed)
    if (!/^\d+$/.test(phone)) {
      return new Response(
        JSON.stringify({ message: "Phone number must contain only digits." }),
        { status: 400 }
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
        JSON.stringify({ message: "Email is already registered." }),
        { status: 409 }
      );
    }

    // Hash the user's password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create a new user object
    const newUser = {
      name,
      email,
      password: hashedPassword,
      address,
      phone,
      role: "customer", // Default role
    };

    // Insert the new user into the database
    const result = await usersCollection.insertOne(newUser);
    await client.close(); // Close the database connection

    // Respond with success message and new user's ID
    return new Response(
      JSON.stringify({
        message: "Registration successful.",
        userId: result.insertedId,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return new Response(JSON.stringify({ message: "Internal server error." }), {
      status: 500,
    });
  }
}
