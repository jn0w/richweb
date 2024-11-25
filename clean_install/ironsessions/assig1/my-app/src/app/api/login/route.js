import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import { getCustomSession } from "../sessionCode/route.js";

const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("sampleDatabase");
    const usersCollection = db.collection("users");

    // Check if user exists
    const user = await usersCollection.findOne({ email });
    if (!user) {
      await client.close();
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await client.close();
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create and save session
    const session = await getCustomSession();
    session.email = email;
    session.role = user.role;
    await session.save();

    await client.close();

    return new Response(
      JSON.stringify({
        message: "Login successful",
        role: user.role, // Provide role for frontend
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error during login:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
