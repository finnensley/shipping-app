// __tests__/api/inventory-validation.test.js
import request from 'supertest';
import app from '../../src/server.js';
import { testPool, setupTestDB, cleanupTestDB } from '../setup/database.js';

describe('Inventory Validation', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
    await testPool.end();
  });

  beforeEach(async () => {
    await testPool.query('TRUNCATE TABLE item_location_history, item_locations, items RESTART IDENTITY CASCADE');
  });

  test('should handle insufficient inventory during pick list creation', async () => {
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
      .post('/picked_orders_staged_for_packing')
      .send({ 
        pickListId: 'PL001',
        order_numbers: [1001], 
        items: [{ sku: 12345, quantity: 10 }],
        status: 'staged'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Insufficient inventory for item 12345');
  });
});