import { withSessionRoute } from "next-session";

export default withSessionRoute(async function authMiddleware(req, res, next) {
  if (!req.session.user) {
    res.status(401).json({ message: "Unauthorized access" });
    return;
  }

  // If the user is logged in, proceed to the next handler
  next();
});
