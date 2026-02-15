import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  // Check if JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    console.error("CRITICAL: JWT_SECRET environment variable is not set!");
    return res.status(500).json({
      error: "Server configuration error: JWT_SECRET not set",
      environment: process.env.NODE_ENV,
    });
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err.message, err.name);
      return res.status(403).json({
        error: "Invalid or expired token",
        details: err.message,
      });
    }
    req.user = user;
    next();
  });
};
