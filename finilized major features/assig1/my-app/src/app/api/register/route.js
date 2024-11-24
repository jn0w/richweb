import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, address, phone } = body;

    if (!name || !email || !password || !address || !phone) {
      return new Response(
        JSON.stringify({ message: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      address,
      phone,
      role: "customer",
    };

    const result = await usersCollection.insertOne(newUser);
    await client.close();

    return new Response(
      JSON.stringify({
        message: "Registration successful",
        userId: result.insertedId,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
