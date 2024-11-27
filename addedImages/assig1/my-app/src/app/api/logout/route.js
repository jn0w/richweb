import { getCustomSession } from "../sessionCode/route.js";

export async function POST(req) {
  try {
    const session = await getCustomSession();

    // Destroy the session
    session.destroy();

    console.log("User logged out");
    return new Response(JSON.stringify({ message: "Logout successful" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(JSON.stringify({ message: "Logout failed" }), {
      status: 500,
    });
  }
}
