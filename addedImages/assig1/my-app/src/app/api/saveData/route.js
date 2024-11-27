import { getCustomSession } from "../sessionCode/route.js";

export async function POST(req) {
  try {
    const body = await req.json(); // Parse the incoming JSON request body
    const { email, role } = body;

    if (!email || !role) {
      return new Response(
        JSON.stringify({ message: "Email and role are required" }),
        { status: 400 }
      );
    }

    let session = await getCustomSession();

    // Setting dynamic data into the session
    session.email = email; // Use the provided email
    session.role = role; // Use the provided role
    await session.save(); // Save the session data

    console.log(`Data saved for email: ${email}, role: ${role}`); // Log for debugging

    return new Response(
      JSON.stringify({ message: "Data saved successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error saving data to session:", error);
    return new Response(
      JSON.stringify({ message: "Failed to save data to session" }),
      { status: 500 }
    );
  }
}
