// __tests__/setup/database.js
import { existsSync } from "fs";
import { Pool } from "pg";

const isDockerRuntime = existsSync("/.dockerenv");
const testDbHost = isDockerRuntime
  ? "host.docker.internal"
  : process.env.TEST_DB_HOST || process.env.LOCAL_HOST || "localhost";
const testDbConfig = {
  user: process.env.TEST_DB_USER || process.env.LOCAL_USER || "finnensley",
  host: testDbHost,
  database:
    process.env.TEST_DB_NAME ||
    process.env.LOCAL_TEST_DATABASE ||
    "shipping_app_test",
  password:
    process.env.TEST_DB_PASSWORD ||
    process.env.LOCAL_PASSWORD ||
    "Finnigan2025",
  port: Number(process.env.TEST_DB_PORT || process.env.LOCAL_PORT || 5432),
};

export const testPool = new Pool(testDbConfig);
const schemaLockId = 424242;

const ensureTestDatabaseExists = async () => {
  const adminPool = new Pool({
    ...testDbConfig,
    database: isDockerRuntime
      ? "postgres"
      : process.env.TEST_DB_ADMIN_NAME ||
        process.env.LOCAL_DATABASE ||
        "postgres",
  });

  try {
    const result = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [testDbConfig.database],
    );

    if (result.rowCount === 0) {
      await adminPool.query(`CREATE DATABASE ${testDbConfig.database}`);
    }
  } finally {
    await adminPool.end();
  }
};

const withSchemaLock = async (callback) => {
  await testPool.query("SELECT pg_advisory_lock($1)", [schemaLockId]);

  try {
    return await callback();
  } finally {
    await testPool.query("SELECT pg_advisory_unlock($1)", [schemaLockId]);
  }
};

// Database setup and teardown helpers
export const setupTestDB = async () => {
  await ensureTestDatabaseExists();

  await withSchemaLock(async () => {
    await testPool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        sku INTEGER UNIQUE NOT NULL,
        description VARCHAR(255) NOT NULL,
        total_quantity INTEGER DEFAULT 0,
        image_path VARCHAR(255)
      );
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        location_number INTEGER UNIQUE NOT NULL,
        location_name VARCHAR(100),
        description TEXT
      );
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS item_locations (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES items(id),
        location_id INTEGER REFERENCES locations(id),
        quantity INTEGER NOT NULL DEFAULT 0
      );
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS item_location_history (
        id SERIAL PRIMARY KEY,
        item_location_id INTEGER REFERENCES item_locations(id),
        old_quantity INTEGER NOT NULL,
        new_quantity INTEGER NOT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50)
      );
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number INTEGER UNIQUE NOT NULL,
        subtotal NUMERIC(10, 2),
        taxes NUMERIC(10, 2),
        total NUMERIC(10, 2),
        shipping_paid NUMERIC(10, 2),
        address_line1 VARCHAR(255),
        address_line2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        zip VARCHAR(20),
        country VARCHAR(100),
        carrier VARCHAR(100),
        carrier_speed VARCHAR(100),
        customer_id INTEGER REFERENCES customers(id),
        status VARCHAR(50),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES items(id),
        sku INTEGER NOT NULL,
        description VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        active BOOLEAN DEFAULT TRUE
      );
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS picked_orders_staged_for_packing (
        id SERIAL PRIMARY KEY,
        pick_list_id VARCHAR(255) UNIQUE NOT NULL,
        order_numbers INTEGER[] NOT NULL,
        items JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50)
      );
    `);
  });
};

export const cleanupTestDB = async () => {
  await withSchemaLock(async () => {
    await testPool.query(
      "TRUNCATE TABLE picked_orders_staged_for_packing, order_items, orders, customers, item_location_history, item_locations, locations, items RESTART IDENTITY CASCADE",
    );
  });
};
