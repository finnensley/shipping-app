// __tests__/api/inventory-validation.test.js
import request from "supertest";
import jwt from "jsonwebtoken";
import app, { pool as appPool } from "../../api/index.js";
import { testPool, setupTestDB, cleanupTestDB } from "../setup/database.js";

describe("Inventory Validation", () => {
  const authToken = jwt.sign(
    { id: 1, email: "test@example.com" },
    process.env.JWT_SECRET,
  );

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
    await testPool.end();
    await appPool.end();
  });

  beforeEach(async () => {
    await testPool.query(
      "TRUNCATE TABLE item_location_history, item_locations, items RESTART IDENTITY CASCADE",
    );
  });

  test("should handle insufficient inventory during pick list creation", async () => {
    await testPool.query(`
      INSERT INTO items (id, sku, description, total_quantity) 
      VALUES (1, 12345, 'Limited Item', 5);
    `);

    await testPool.query(`
      INSERT INTO locations (id, location_number, location_name) 
      VALUES (1, 101, 'A1-01');
    `);

    await testPool.query(`
      INSERT INTO item_locations (item_id, location_id, quantity) 
      VALUES (1, 1, 5);
    `);

    const response = await request(app)
      .post("/api/picked_orders_staged_for_packing")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        pickListId: "PL001",
        order_numbers: [1001],
        items: [{ sku: 12345, quantity: 10 }],
        status: "staged",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain(
      "Insufficient inventory for item 12345",
    );
  });
});
