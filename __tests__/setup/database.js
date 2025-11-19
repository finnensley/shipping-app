// __tests__/setup/database.js
import { Pool } from 'pg';

export const testPool = new Pool({
  user: "finnensley",
  host: "localhost", 
  database: "shipping_app_test",
  password: "Finnigan2025",
  port: 5432,
});

// Database setup and teardown helpers
export const setupTestDB = async () => {
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
};

export const cleanupTestDB = async () => {
  await testPool.query('DROP TABLE IF EXISTS item_location_history CASCADE');
  await testPool.query('DROP TABLE IF EXISTS item_locations CASCADE');
  await testPool.query('DROP TABLE IF EXISTS locations CASCADE');
  await testPool.query('DROP TABLE IF EXISTS items CASCADE');
};

