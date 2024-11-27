import { getCustomSession } from "../sessionCode/route.js";

export async function GET(req) {
  try {
    const session = await getCustomSession();
    console.log("Session loaded:", session);

    return new Response(JSON.stringify({ success: true, session }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error loading session:", error);
    return new Response(JSON.stringify({ error: "Failed to load session" }), {
      status: 500,
    });
  }
}
