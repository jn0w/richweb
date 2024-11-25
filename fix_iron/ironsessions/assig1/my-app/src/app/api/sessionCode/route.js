import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export async function getCustomSession() {
  console.log("loading session stuff");

  // Use the SESSION_SECRET from your .env.local file
  const password =
    process.env.SESSION_SECRET ||
    "default_fallback_password_that_is_secure_enough";

  const cookieStore = await cookies(); // Await the cookies() function
  const session = await getIronSession(cookieStore, {
    password,
    cookieName: "app",
  });

  return session;
}
