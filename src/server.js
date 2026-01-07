import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
import cors from "cors";
import { body, validationResult } from "express-validator";
//Auth
import AuthRoutes from "./routes/AuthRoutes.js";
import { authenticateToken } from "./middleware/authMiddleware.js";
import { validateInventoryAvailability } from "./utils/inventory-validator.js";
import Stripe from "stripe";

dotenv.config();

const { Pool } = pkg; // to use database
const app = express();
const port = 3000; //port for backend
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // secret key sk_test

app.use(cors()); // use as security to allow access or not to requests from other websites
app.use(express.json()); // to parse JSON request bodies

//Public routes (no auth needed)
app.use("/auth", AuthRoutes); // changed from /protected to /auth

// Protected routes (auth required); add app.get("/api/items"..to all protected routes
app.use("/api", authenticateToken); // This protects all /api routes

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

//Database connection pool - local use
// const pool = new Pool({
//   user: process.env.LOCAL_USER,
//   host: process.env.LOCAL_HOST,
//   database: process.env.LOCAL_DATABASE,
//   password: process.env.LOCAL_PASSWORD,
//   port: process.env.LOCAL_PORT, //Default PostgreSQL port
// });

const pool = new Pool({
  user: process.env.SUPABASE_USER,
  host: process.env.SUPABASE_HOST,
  database: process.env.SUPABASE_DATABASE,
  password: process.env.SUPABASE_PASSWORD,
  port: process.env.SUPABASE_PORT,
});
// API endpoint for CRUD (Create, Read, Update, Delete).
//items

// Stripe .post
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
    success_url: "http://localhost:5173/success",
    cancel_url: "http://localhost:5173/checkout",
  });
  res.json({ url: session.url });
});

// Get all items joined with locations
app.get("/items", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id AS item_id,
        i.sku,
        i.description,
        i.total_quantity,
        i.available_quantity,
        i.image_path,
        il.id AS item_location_id,
        il.location_id,
        il.quantity,
        l.location_number,
        l.location_name,
        l.description AS location_description
      FROM items i
      LEFT JOIN item_locations il ON i.id = il.item_id
      LEFT JOIN locations l ON il.location_id = l.id
      ORDER BY i.id, il.location_id
    `);

    //Group locations by item
    const itemsMap = {};
    result.rows.forEach((row) => {
      if (!itemsMap[row.item_id]) {
        itemsMap[row.item_id] = {
          id: row.item_id,
          image_path: row.image_path,
          sku: row.sku,
          description: row.description,
          total_quantity: row.total_quantity,
          available_quantity: row.available_quantity, // may not need this
          locations: [],
        };
      }
      // Only push location if it exists
      if (row.item_location_id) {
        itemsMap[row.item_id].locations.push({
          id: row.item_location_id,
          location_id: row.location_id,
          location_number: row.location_number,
          location_name: row.location_name,
          location_description: row.location_description,
          quantity: row.quantity,
        });
      }
    });

    const items = Object.values(itemsMap);
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Get items by sku
app.get("/items/by_sku/:sku", async (req, res) => {
  try {
    const { sku } = req.params;
    const result = await pool.query(
      "SELECT id, sku, description FROM items WHERE sku = $1 LIMIT 1",
      [sku]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).send("Server Error");
  }
});

//Create a new item
app.post(
  "/items",
  [
    body("sku").isNumeric(),
    body("description").isString().trim().notEmpty(),
    body("total_quantity").isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { image_path, sku, description, total_quantity } = req.body;
      const result = await pool.query(
        "INSERT INTO items (image_path, sku, description, total_quantity) VALUES ($1, $2, $3, $4) RETURNING *",
        [image_path, sku, description, total_quantity]
      );
      res.status(201).json({ items: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

//Update an item
app.put("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { image_path, sku, description, total_quantity } = req.body;
    const result = await pool.query(
      "UPDATE items SET image_path=$1, sku=$2, description=$3, total_quantity=$4 WHERE id=$5 RETURNING *",
      [image_path, sku, description, total_quantity, id]
    );
    res.json({ item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//Delete an item
app.delete("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM items WHERE id=$1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//item_locations
app.get("/item_locations", async (req, res) => {
  try {
    const itemLocations = await pool.query("SELECT * FROM item_locations");
    res.json({ itemLocations: itemLocations.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post(
  "/item_locations",
  [
    body("item_id").isNumeric(),
    body("location_id").isInt({ min: 0 }),
    body("quantity").isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { item_id, location_id, quantity } = req.body;
      const result = await pool.query(
        "INSERT INTO item_locations (item_id, location_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [item_id, location_id, quantity]
      );
      res.status(201).json({ item_location: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

app.post("/item_locations/:id/undo", async (req, res) => {
  try {
    const { id } = req.params;

    // Get the last history entry for this item location
    const history = await pool.query(
      "SELECT * FROM item_location_history WHERE item_location_id=$1 ORDER BY changed_at DESC LIMIT 1",
      [id]
    );
    const lastChange = history.rows[0];
    if (!lastChange) return res.status(404).send("No history found");

    // Revert the quantity
    const result = await pool.query(
      "UPDATE item_locations SET quantity=$1 WHERE id=$2 RETURNING id, item_id, location_id, quantity",
      [lastChange.old_quantity, id]
    );

    console.log("Undo results:", result.rows[0]);

    // Make sure result.rows[0].item_id exists
    if (!result.rows[0] || !result.rows[0].item_id) {
      return res
        .status(500)
        .send("Could not determine item_id for total_quantity update");
    }

    // Recalculate and update total_quantity for the item
    await pool.query(
      "UPDATE items SET total_quantity = (SELECT COALESCE(SUM(quantity),0) FROM item_locations WHERE item_id = $1) WHERE id = $1",
      [result.rows[0].item_id]
    );

    res.json({ item_location: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.put("/item_locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { item_id, location_id, quantity } = req.body;

    // Get the current quantity before updating
    const current = await pool.query(
      "SELECT quantity FROM item_locations WHERE id=$1",
      [id]
    );
    const oldQuantity = current.rows[0]?.quantity;

    // Update the quantity
    const result = await pool.query(
      "UPDATE item_locations SET item_id=$1, location_id=$2, quantity=$3 WHERE id=$4 RETURNING *",
      [item_id, location_id, quantity, id]
    );

    // Log the change in history
    await pool.query(
      "INSERT INTO item_location_history (item_location_id, old_quantity, new_quantity) VALUES ($1, $2, $3)",
      [id, oldQuantity, quantity]
    );

    // Recalculates the total for the item based on all its locations
    await pool.query(
      "UPDATE items SET total_quantity = (SELECT COALESCE(SUM(quantity),0) FROM item_locations WHERE item_id = $1) WHERE id= $1",
      [item_id]
    );

    res.json({ item_locations: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.delete("/item_locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM item_locations WHERE id=$1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//Orders
app.get("/orders", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    res.json({ orders: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/orders_with_items", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id AS order_id,
        o.order_number,
        o.subtotal,
        o.taxes,
        o.total,
        o.shipping_paid,
        o.address_line1,
        o.address_line2,
        o.city,
        o.state,
        o.zip,
        o.country,
        o.carrier,
        o.customer_id,
        o.carrier_speed,
        o.status,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        oi.id AS order_item_id,
        oi.item_id,
        oi.sku,
        oi.description,
        oi.quantity,
        i.image_path,
        i.total_quantity,
        i.available_quantity
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
       LEFT JOIN order_items oi ON o.id = oi.order_id AND oi.active = TRUE
      LEFT JOIN items i ON oi.item_id = i.id
      WHERE o.status = 'open'
      ORDER BY o.id, oi.id
    `);

    // Group items by order
    const ordersMap = {};
    result.rows.forEach((row) => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          id: row.order_id,
          order_number: row.order_number,
          subtotal: row.subtotal,
          taxes: row.taxes,
          total: row.total,
          shipping_paid: row.shipping_paid,
          address_line1: row.address_line1,
          address_line2: row.address_line2,
          city: row.city,
          state: row.state,
          zip: row.zip,
          country: row.country,
          carrier: row.carrier,
          carrier_speed: row.carrier_speed,
          customer_id: row.customer_id,
          customer_name: row.customer_name,
          customer_email: row.customer_email,
          customer_phone: row.customer_phone,
          items: [],
        };
      }
      if (row.order_item_id) {
        ordersMap[row.order_id].items.push({
          id: row.order_item_id,
          item_id: row.item_id,
          sku: row.sku,
          description: row.description,
          quantity: row.quantity,
          image_path: row.image_path,
        });
      }
    });

    const orders = Object.values(ordersMap);
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post(
  "/orders",
  [
    body("order_number").isNumeric(),
    body("subtotal").isNumeric(),
    body("taxes").isNumeric(),
    body("total").isNumeric(),
    body("shipping_paid").isNumeric(),
    body("address_line1").isString().notEmpty(),
    body("address_line2").optional(),
    body("city").isString().trim().notEmpty(),
    body("state").isString().trim().notEmpty(),
    body("zip").isString().trim().notEmpty(),
    body("country").isString().trim().notEmpty(),
    body("carrier").isString().trim().notEmpty(),
    body("carrier_speed").isString().trim().notEmpty(),
    body("customer_id").isInt().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {
        order_number,
        subtotal,
        taxes,
        total,
        shipping_paid,
        address_line1,
        address_line2,
        city,
        state,
        zip,
        country,
        carrier,
        carrier_speed,
        customer_id,
      } = req.body;
      const result = await pool.query(
        "INSERT INTO orders (order_number, subtotal, taxes, total, shipping_paid, address_line1, address_line2, city, state, zip, country, carrier, carrier_speed, customer_id ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *",
        [
          order_number,
          subtotal,
          taxes,
          total,
          shipping_paid,
          address_line1,
          address_line2,
          city,
          state,
          zip,
          country,
          carrier,
          carrier_speed,
          customer_id,
        ]
      );
      res.status(201).json({ orders: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

app.put("/orders/:id", async (req, res) => {
  console.log("PUT /orders/:id called");
  console.log("Request body:", req.body);
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const { id } = req.params;
    let {
      order_number,
      subtotal,
      taxes,
      total,
      shipping_paid,
      address_line1,
      address_line2,
      city,
      state,
      zip,
      country,
      carrier,
      carrier_speed,
      customer_id,
      updated_at,
      items,
    } = req.body;

    // Convert string numbers to actual numbers
    order_number = Number(order_number);
    subtotal = Number(subtotal);
    taxes = Number(taxes);
    total = Number(total);
    shipping_paid = Number(shipping_paid);
    customer_id = Number(customer_id);

    // Validate required fields
    if (
      !order_number ||
      isNaN(subtotal) ||
      isNaN(taxes) ||
      isNaN(total) ||
      isNaN(shipping_paid) ||
      !address_line1 ||
      !city ||
      !state ||
      !zip ||
      !country ||
      !carrier ||
      !carrier_speed ||
      isNaN(customer_id)
    ) {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }

    await client.query("BEGIN");
    transactionStarted = true;

    // Update order fields
    const result = await client.query(
      "UPDATE orders SET order_number=$1, subtotal=$2, taxes=$3, total=$4, shipping_paid=$5, address_line1=$6, address_line2=$7, city=$8, state=$9, zip=$10, country=$11, carrier=$12, carrier_speed=$13, customer_id=$14, updated_at=$15 WHERE id=$16 RETURNING *",
      [
        order_number,
        subtotal,
        taxes,
        total,
        shipping_paid,
        address_line1,
        address_line2,
        city,
        state,
        zip,
        country,
        carrier,
        carrier_speed,
        customer_id,
        updated_at,
        id,
      ]
    );

    // Get current active items for this order
    const { rows: currentItems } = await client.query(
      "SELECT id FROM order_items WHERE order_id=$1 AND active=TRUE",
      [id]
    );

    // Get IDs of items sent from frontend
    const payloadIds = items.filter((item) => item.id).map((item) => item.id);

    // Mark items as inactive if they are not in the payload
    for (const item of currentItems) {
      if (!payloadIds.includes(item.id)) {
        await client.query("UPDATE order_items SET active=FALSE WHERE id=$1", [
          item.id,
        ]);
      }
    }

    // Update or insert items
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.id) {
          // Existing item: update quantity and description if needed
          await client.query(
            "UPDATE order_items SET quantity=$1, description=$2 WHERE id=$3",
            [Number(item.quantity), item.description, item.id]
          );
        } else {
          // New item: insert
          await client.query(
            "INSERT INTO order_items (order_id, item_id, sku, description, quantity, active) VALUES ($1, $2, $3, $4, $5, TRUE)",
            [
              id,
              Number(item.item_id),
              item.sku,
              item.description,
              Number(item.quantity),
            ]
          );
        }
      }
    }
    await client.query("COMMIT");

    const itemsResult = await pool.query(
      "SELECT * FROM order_items WHERE order_id=$1 AND active=TRUE",
      [id]
    );

    res.json({ order: result.rows[0], items: itemsResult.rows });
  } catch (err) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  } finally {
    client.release();
  }
});

// Change carrier and _speed if packer selects from dropdown
app.put("/api/orders/:order_number/carrier", async (req, res) => {
  try {
    const { order_number } = req.params;
    const { carrier, carrier_speed } = req.body;
    const result = await pool.query(
      "UPDATE orders SET carrier=$1, carrier_speed=$2 WHERE order_number=$3 RETURNING *",
      [carrier, carrier_speed, order_number]
    );
    res.json({ order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.delete("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM orders WHERE id=$1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//order-items
app.get("/order_items", async (req, res) => {
  try {
    const orderItems = await pool.query("SELECT * FROM order_items");
    res.json({ orderItems: orderItems.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post(
  "/order_items",
  [
    body("order_id").isInt({ min: 0 }),
    body("item_id").isInt({ min: 0 }),
    body("sku").isNumeric(),
    body("description").isString().trim().notEmpty(),
    body("quantity").isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { order_id, item_id, sku, description, quantity } = req.body;
      const result = await pool.query(
        "INSERT INTO order_items (order_id, item_id, sku, description, quantity ) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [order_id, item_id, sku, description, quantity]
      );
      // Deduct from available_quantity
      await pool.query(
        "UPDATE items SET available_quantity = available_quantity - $1 WHERE id = $2",
        [quantity, item_id]
      );
      res.status(201).json({ order_items: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

// Revert last change, order item change undo button
app.post("/order_items/:id/undo", async (req, res) => {
  try {
    const { id } = req.params;

    // Get the last history entry for this order item
    const history = await pool.query(
      "SELECT * FROM order_item_history WHERE order_item_id=$1 ORDER BY changed_at DESC LIMIT 1",
      [id]
    );
    const lastChange = history.rows[0];
    if (!lastChange) return res.status(404).send("No history found");

    // Revert the quantity
    const result = await pool.query(
      "UPDATE order_items SET quantity=$1 WHERE id=$2 RETURNING *",
      [lastChange.old_quantity, id]
    );

    res.json({ order_item: result.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

app.put("/order_items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Get the current quantity and item_id before updating
    const current = await pool.query(
      "SELECT quantity, item_id FROM order_items WHERE id=$1",
      [id]
    );
    const oldQuantity = current.rows[0]?.quantity;
    const itemId = current.rows[0]?.item_id;

    // Update the quantity
    const result = await pool.query(
      "UPDATE order_items SET quantity=$1 WHERE id=$2 RETURNING *",
      [quantity, id]
    );

    // Adjust available_quantity
    const diff = quantity - oldQuantity;
    await pool.query(
      "UPDATE items SET available_quantity = available_quantity - $1 WHERE id = $2",
      [diff, itemId]
    );

    // Log the change in history
    await pool.query(
      "INSERT INTO order_item_history (order_item_id, old_quantity, new_quantity) VALUES ($1, $2, $3)",
      [id, oldQuantity, quantity]
    );

    res.json({ order_items: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.delete("/order_items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get the quantity and item_id before deleting
    const current = await pool.query(
      "SELECT quantity, item_id FROM order_items WHERE id=$1",
      [id]
    );
    const quantity = current.rows[0]?.quantity;
    const itemId = current.rows[0]?.item_id;

    // Delete the order item
    await pool.query("DELETE FROM order_items WHERE id=$1", [id]);

    // Restore available_quantity
    await pool.query(
      "UPDATE items SET available_quantity = available_quantity + $1 WHERE id = $2",
      [quantity, itemId]
    );

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//locations
app.get("/locations", async (req, res) => {
  try {
    const locations = await pool.query("SELECT * FROM locations");
    res.json({ locations: locations.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post(
  "/locations",
  [
    body("location_number").isNumeric(),
    body("location_name").isString().trim(),
    body("description").isString().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { location_number, location_name, description } = req.body;
      const result = await pool.query(
        "INSERT INTO locations (location_number, location_name, description) VALUES ($1, $2, $3) RETURNING *",
        [location_number, location_name, description]
      );
      res.status(201).json({ locations: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

app.put("/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { location_number, location_name, description } = req.body;
    const result = await pool.query(
      "UPDATE locations SET location_number=$1, location_name=$2, description=$3 WHERE id=$4 RETURNING *",
      [location_number, location_name, description, id]
    );
    res.json({ locations: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.delete("/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM locations WHERE id=$1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// pickLists
app.get("/picklists_with_order_info", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id AS picklist_db_id,
        p.pick_list_id,
        p.order_numbers,
        p.items,
        p.created_at,
        p.status,
        o.*
      FROM picked_orders_staged_for_packing p
      JOIN orders o ON o.order_number = ANY(p.order_numbers)
      ORDER BY p.created_at DESC, o.order_number
    `);

    res.json({ picklists: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/picked_orders_staged_for_packing", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.pick_list_id,
        p.order_numbers,
        p.created_at,
        p.status,
        p.items,
        o.id AS order_id,
        o.order_number,
        o.subtotal,
        o.taxes,
        o.total,
        o.shipping_paid,
        o.address_line1,
        o.address_line2,
        o.city,
        o.state,
        o.zip,
        o.country,
        o.carrier,
        o.carrier_speed,
        o.status AS order_status,
        c.id AS customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone
      FROM picked_orders_staged_for_packing p
      LEFT JOIN orders o ON o.order_number = ANY(p.order_numbers)
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY p.created_at DESC, o.order_number
    `);

    // Group the results by pick list and include full order info
    const picklistsMap = {};

    result.rows.forEach((row) => {
      const pickListId = row.pick_list_id;

      if (!picklistsMap[pickListId]) {
        // Parse items and add order_numbers to each item
        const items = Array.isArray(row.items)
          ? row.items
          : JSON.parse(row.items || "[]");
        const itemsWithOrderNumbers = items.map((item) => ({
          ...item,
          order_numbers: row.order_numbers,
        }));

        picklistsMap[pickListId] = {
          id: row.id,
          pick_list_id: row.pick_list_id,
          order_numbers: row.order_numbers,
          created_at: row.created_at,
          status: row.status,
          items: itemsWithOrderNumbers,
          orders: [], // Array to hold full order details
        };
      }

      // FIXED: Only add order info if it belongs to this picklist AND doesn't already exist
      if (row.order_id && row.order_numbers.includes(row.order_number)) {
        const existingOrder = picklistsMap[pickListId].orders.find(
          (order) => order.order_number === row.order_number
        );

        if (!existingOrder) {
          picklistsMap[pickListId].orders.push({
            order_id: row.order_id,
            order_number: row.order_number,
            subtotal: row.subtotal,
            taxes: row.taxes,
            total: row.total,
            shipping_paid: row.shipping_paid,
            address_line1: row.address_line1,
            address_line2: row.address_line2,
            city: row.city,
            state: row.state,
            zip: row.zip,
            country: row.country,
            carrier: row.carrier,
            carrier_speed: row.carrier_speed,
            order_status: row.order_status,
            customer_id: row.customer_id,
            customer_name: row.customer_name,
            customer_email: row.customer_email,
            customer_phone: row.customer_phone,
          });
        }
      }
    });

    const picklists = Object.values(picklistsMap);
    res.json({ picklists });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/picked_orders_staged_for_packing", async (req, res) => {
  try {
    const { pickListId, order_numbers, items, createdAt, status } = req.body;

    // Validate inventory using extracted function
    await validateInventoryAvailability(pool, items);

    // Insert into your new table
    await pool.query(
      "INSERT INTO picked_orders_staged_for_packing (pick_list_id, order_numbers, items, created_at, status) VALUES ($1, $2, $3, $4, $5)",
      [
        pickListId,
        order_numbers,
        JSON.stringify(items), // items is an array of objects with chosenLocation (set as a jsonb column)
        createdAt,
        status,
      ]
    );

    // Update order status to 'staged'
    await pool.query(
      "UPDATE orders SET status = 'staged' WHERE order_number = ANY($1)",
      [order_numbers]
    );

    res.status(201).send("Pick list staged for packing");
  } catch (err) {
    if (err.message.includes("Insufficient inventory")) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// PickList items transferred out of chosen location, this is an action endpoint
app.post("/inventory/transfer", async (req, res) => {
  try {
    const { itemId, quantity, location } = req.body;
    const result = await pool.query(
      "UPDATE item_locations SET quantity = quantity - $1 WHERE item_id = $2 AND location_id = $3",
      [quantity, itemId, location]
    );
    console.log("Transfer result:", result.rowCount, req.body);

    //Update total_quantity for the item (sum of all locations)
    await pool.query(
      "UPDATE items SET total_quantity = (SELECT COALESCE(SUM(quantity), 0) FROM item_locations WHERE item_id = $1) WHERE id = $1",
      [itemId]
    );

    res.status(200).send("Inventory updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//customers
app.get("/customers", async (req, res) => {
  try {
    const customers = await pool.query("SELECT * FROM customers");
    res.json({ customers: customers.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post(
  "/customers",
  [
    body("name").isString().trim().notEmpty(),
    body("email").isString().trim(),
    body("phone").isString().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email, phone } = req.body;
      const result = await pool.query(
        "INSERT INTO customers (name, email, phone ) VALUES ($1, $2, $3) RETURNING *",
        [name, email, phone]
      );
      res.status(201).json({ customers: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

app.put("/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    const result = await pool.query(
      "UPDATE customers SET name=$1, email=$2, phone=$3 WHERE id=$4 RETURNING *",
      [name, email, phone, id]
    );
    res.json({ customers: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.delete("/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM customers WHERE id=$1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//users
app.get("/users", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.json({ users: users.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post(
  "/users",
  [
    body("username").isString().trim().notEmpty(),
    body("email").isString().trim().notEmpty(),
    body("password_hash").isString().trim().notEmpty(),
    body("permissions").isString().trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { username, email, password_hash, permissions } = req.body;
      const result = await pool.query(
        "INSERT INTO users (username, email, password_hash, permissions ) VALUES ($1, $2, $3, $4) RETURNING *",
        [username, email, password_hash, permissions]
      );
      res.status(201).json({ users: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password_hash, permissions } = req.body;
    const result = await pool.query(
      "UPDATE users SET username=$1, email=$2, password_hash=$3, permissions=$4 WHERE id=$5 RETURNING *",
      [username, email, password_hash, permissions, id]
    );
    res.json({ users: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//Start the server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

export default app;
export { pool };
// In terminal to run server:
// node src/server.js
