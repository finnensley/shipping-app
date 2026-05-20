import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
import cors from "cors";
import { existsSync } from "fs";
import { body, validationResult } from "express-validator";
//Auth
import AuthRoutes from "../src/routes/AuthRoutes.js";
import CustomerRoutes from "../src/routes/CustomerRoutes.js";
import ItemRoutes from "../src/routes/ItemRoutes.js";
import LocationRoutes from "../src/routes/LocationRoutes.js";
import OrderRoutes from "../src/routes/OrderRoutes.js";
import PicklistRoutes from "../src/routes/PicklistRoutes.js";
import UserRoutes from "../src/routes/UserRoutes.js";
import { authenticateToken } from "../src/middleware/authMiddleware.js";
import Stripe from "stripe";

dotenv.config();

const { Pool } = pkg; // to use database
const app = express();
const port = 3000; //port for backend
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // secret key sk_test

// CORS configuration for security
const corsOptions = {
  origin: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json()); // to parse JSON request bodies

//Public routes (no auth needed)
app.use("/auth", AuthRoutes); // changed from /protected to /auth

// Serve static files from dist folder BEFORE auth middleware
import { join } from "path";

const appRoot = process.cwd();

app.use(express.static(join(appRoot, "dist")));

//Database connection detecting the environment
// For remote connections (Supabase, etc), we need SSL with proper settings

// Disable certificate validation for self-signed certs on Vercel
if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const getPoolConfig = () => {
  const isDockerRuntime = existsSync("/.dockerenv");
  const testDbHost = isDockerRuntime
    ? "host.docker.internal"
    : process.env.TEST_DB_HOST || process.env.LOCAL_HOST || "localhost";

  if (process.env.NODE_ENV === "test") {
    return {
      user: process.env.TEST_DB_USER || process.env.LOCAL_USER || "finnensley",
      host: testDbHost,
      database:
        process.env.TEST_DB_NAME ||
        process.env.LOCAL_TEST_DATABASE ||
        "shipping_app_test",
      password:
        process.env.TEST_DB_PASSWORD || process.env.LOCAL_PASSWORD || "",
      port: Number(process.env.TEST_DB_PORT || process.env.LOCAL_PORT || 5432),
    };
  }

  if (process.env.DATABASE_URL) {
    // Remote database connection - use object format for ssl
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  } else {
    // Local database connection
    return {
      user: process.env.LOCAL_USER,
      host: process.env.LOCAL_HOST,
      database: process.env.LOCAL_DATABASE,
      password: process.env.LOCAL_PASSWORD,
      port: process.env.LOCAL_PORT,
    };
  }
};

const pool = new Pool(getPoolConfig());
app.locals.pool = pool;

// Log connection configuration on startup
console.log("=== DB Connection Config ===");
console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);
if (process.env.DATABASE_URL) {
  // Mask password for security
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^@]+)@/, ":****@");
  console.log("Using DATABASE_URL:", maskedUrl);
} else {
  console.log("Using LOCAL connection:");
  console.log("- HOST:", process.env.LOCAL_HOST);
  console.log("- USER:", process.env.LOCAL_USER);
  console.log("- DATABASE:", process.env.LOCAL_DATABASE);
  console.log("- PORT:", process.env.LOCAL_PORT);
}
console.log("=============================");

// Handle pool errors
pool.on("error", (err) => {
  console.error("=== POOL ERROR ===");
  console.error("Error message:", err.message);
  console.error("Error code:", err.code);
  console.error("Full error:", err);
});

pool.on("connect", () => {
  console.log("✓ Database pool connected successfully");
});

//Database connection pool - local use
// const pool = new Pool({
//   user: process.env.LOCAL_USER,
//   host: process.env.LOCAL_HOST,
//   database: process.env.LOCAL_DATABASE,
//   password: process.env.LOCAL_PASSWORD,
//   port: process.env.LOCAL_PORT, //Default PostgreSQL port
// });

// const pool = new Pool({
//   user: process.env.SUPABASE_USER,
//   host: process.env.SUPABASE_HOST,
//   database: process.env.SUPABASE_DATABASE,
//   password: process.env.SUPABASE_PASSWORD,
//   port: process.env.SUPABASE_PORT,
// });
// API endpoint for CRUD (Create, Read, Update, Delete).
//items

// Stripe baseUrl detecting the environment
const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.BASE_URL || "http://localhost:5173";

// PUBLIC ENDPOINTS - MUST BE BEFORE AUTH MIDDLEWARE

// Health check endpoint (no DB required, no auth required)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL,
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL,
  });
});

// Public diagnostic endpoint (no auth required)
app.get("/test-supabase-connection", async (req, res) => {
  try {
    console.log("=== TEST ENDPOINT CALLED ===");
    console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);
    console.log("Attempting query...");

    const result = await pool.query("SELECT NOW()");
    console.log("Query successful!");

    res.json({
      connected: true,
      time: result.rows[0].now,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("=== DB CONNECTION ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error details:", err);

    res.status(500).json({
      connected: false,
      error: err.message,
      code: err.code,
      hint: "Check DATABASE_URL in Vercel environment variables",
    });
  }
});

app.get("/api/test-supabase-connection", async (req, res) => {
  try {
    console.log("=== TEST ENDPOINT CALLED (/api version) ===");
    console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);
    console.log("Attempting query...");

    const result = await pool.query("SELECT NOW()");
    console.log("Query successful!");

    res.json({
      connected: true,
      time: result.rows[0].now,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("=== DB CONNECTION ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error details:", err);

    res.status(500).json({
      connected: false,
      error: err.message,
      code: err.code,
      hint: "Check DATABASE_URL in Vercel environment variables",
    });
  }
});

// Stripe checkout (public route)
app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    // Enable automatic tax calculations
    automatic_tax: {
      enabled: true,
    },
    //Add shipping options
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 500, currency: "usd" }, //$5.00
          display_name: "Standard Shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 1500, currency: "usd" }, //$15.00
          display_name: "Express shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 1 },
            maximum: { unit: "business_day", value: 2 },
          },
        },
      },
    ],
    success_url: `${baseUrl}/success`,
    cancel_url: `${baseUrl}/checkout`,
  });
  res.json({ url: session.url });
});

// PROTECTED ROUTES - AUTH MIDDLEWARE APPLIES BELOW

// Protected routes (auth required); add app.get("/items"..to all protected routes
app.use("/api", authenticateToken); // This protects all /api routes
app.use("/api", CustomerRoutes);
app.use("/api", ItemRoutes);
app.use("/api", LocationRoutes);
app.use("/api", OrderRoutes);
app.use("/api", PicklistRoutes);
app.use("/api", UserRoutes);

// Log every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Log errors
app.use((err, req, res, next) => {
  console.error("Error:", err);
  next(err);
});

// React Router fallback - serve index.html for non-API routes only
app.get(/.*/, (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api") || req.path.startsWith("/auth")) {
    return res.status(404).json({ error: "Not Found" });
  }
  res.sendFile(join(appRoot, "dist", "index.html"));
});

// Start server locally (Vercel ignores this and uses export instead)
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel
export default app;
export { pool };
