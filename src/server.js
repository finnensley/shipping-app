import express from "express";
import pkg from "pg";
import cors from "cors";
import { body, validationResult } from "express-validator";

const { Pool } = pkg;
const app = express();
const port = 3000; //choose a port for backend

app.use(cors());
app.use(express.json()); // to parse JSON request bodies

//Database connection pool
const pool = new Pool({
  user: "finnensley",
  host: "localhost",
  database: "shipping_app",
  password: "Finnigan2020!",
  port: 5432, //Default PostgreSQL port
});

// API endpoint for CRUD (Create, Read, Update, Delete).
//items
// Get all items joined with locations
app.get("/items", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id AS item_id,
        i.sku,
        i.description,
        i.total_quantity,
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
      "UPDATE item_locations SET quantity=$1 WHERE id=$2 RETURNING *",
      [lastChange.old_quantity, id]
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
      "INSERT INTO item_locations_history (item_location_id, old_quantity, new_quantity) VALUE ($1, $2, $3)",
      [id, oldQuantity, quantity]
    );

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
        oi.id AS order_item_id,
        oi.item_id,
        oi.sku,
        oi.description,
        oi.quantity
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ORDER BY o.id, oi.id
    `);

    // Group items by order
    const ordersMap = {};
    result.rows.forEach((row) => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_number: row.order_number,
          subtotal: row.subtotal,
          taxes: row.taxes,
          total: row.total,
          shipping_paid: row.shipping_paid,
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
    body("address_line2").optional,
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
  try {
    const { id } = req.params;
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
      "UPDATE orders SET order_number=$1, subtotal=$2, taxes=$3, total=$4, shipping_paid=$5, address_line1=$6, address_line2=$7, city=$8, state=$9, zip=$10, country=$11, carrier=$12, carrier_speed=$13, customer_id=$14 WHERE id=$15 RETURNING *",
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
        id,
      ]
    );
    res.json({ orders: result.rows[0] });
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

    // Get the current quantity before updating
    const current = await pool.query(
      "SELECT quantity FROM order_items WHERE id=$1",
      [id]
    );
    const oldQuantity = current.rows[0]?.quantity;

    // Update the quantity
    const result = await pool.query(
      "UPDATE order_items SET quantity=$1 WHERE id=$2 RETURNING *",
      [quantity, id]
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
    await pool.query("DELETE FROM order_items WHERE id=$1", [id]);
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

// In terminal to run server:
// node src/server.js
