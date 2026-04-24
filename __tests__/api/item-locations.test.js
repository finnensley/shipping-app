// __tests__/api/item-locations.test.js
import request from "supertest";
import jwt from "jsonwebtoken";
import app, { pool as appPool } from "../../api/index.js";
import { testPool, setupTestDB, cleanupTestDB } from "../setup/database.js";

describe("PUT /item_locations/:id", () => {
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
    // Clean up and seed test data
    await testPool.query(
      "TRUNCATE TABLE item_location_history, item_locations, locations, items RESTART IDENTITY CASCADE",
    );

    // Insert test data
    await testPool.query(`
      INSERT INTO items (id, sku, description, total_quantity) 
      VALUES (1, 12345, 'Test Item', 100);
    `);

    await testPool.query(`
      INSERT INTO locations (id, location_number, location_name) 
      VALUES (1, 101, 'A1-01');
    `);

    await testPool.query(`
      INSERT INTO item_locations (id, item_id, location_id, quantity) 
      VALUES (1, 1, 1, 50);
    `);
  });

  test("should update item location quantity and recalculate total", async () => {
    const itemLocationId = 1;
    const newQuantity = 25;

    const response = await request(app)
      .put(`/api/item_locations/${itemLocationId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        item_id: 1,
        location_id: 1,
        quantity: newQuantity,
      });

    expect(response.status).toBe(200);
    expect(response.body.item_locations.quantity).toBe(newQuantity);

    const itemResult = await testPool.query(
      "SELECT total_quantity FROM items WHERE id = 1",
    );
    expect(itemResult.rows[0].total_quantity).toBe(newQuantity);
  });

  test("should create history entry for quantity change", async () => {
    await request(app)
      .put("/api/item_locations/1")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ item_id: 1, location_id: 1, quantity: 30 });

    const historyResult = await testPool.query(
      "SELECT * FROM item_location_history WHERE item_location_id = 1",
    );
    expect(historyResult.rows).toHaveLength(1);
    expect(historyResult.rows[0].old_quantity).toBe(50);
    expect(historyResult.rows[0].new_quantity).toBe(30);
  });

  test("should handle undo functionality", async () => {
    await request(app)
      .put("/api/item_locations/1")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ item_id: 1, location_id: 1, quantity: 30 });

    const response = await request(app)
      .post("/api/item_locations/1/undo")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.item_location.quantity).toBe(50);
  });
});
