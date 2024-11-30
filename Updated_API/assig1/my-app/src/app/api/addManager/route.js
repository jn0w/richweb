// app/api/addManager/route.js
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

export async function GET(req) {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();

    const db = client.db("sampleDatabase");
    const usersCollection = db.collection("users");

    const email = "manager@test.com";
    const password = "manager";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const managerUser = {
      name: "Manager",
      email: email,
      password: hashedPassword,
      role: "manager",
    };

    // Insert into the users collection
    const result = await usersCollection.insertOne(managerUser);

    // Close the connection
    await client.close();

    return new Response(
      JSON.stringify({ message: `Manager user created: ${result.insertedId}` }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating manager user:", error);
    return new Response(JSON.stringify({ message: "Error creating user" }), {
      status: 500,
    });
  }
}
