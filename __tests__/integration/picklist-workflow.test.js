// __tests__/integration/picklist-workflow.test.js
import request from 'supertest';
import app from '../../src/server.js';
import { testPool, setupTestDB, cleanupTestDB } from '../setup/database.js';

describe('Pick List Creation Workflow', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
    await testPool.end();
  });

  beforeEach(async () => {
    // Clean and seed data
    await testPool.query('TRUNCATE TABLE picked_orders_staged_for_packing, orders, order_items, items, customers RESTART IDENTITY CASCADE');
    
    // Insert test customer
    await testPool.query(`
      INSERT INTO customers (id, name, email, phone) 
      VALUES (1, 'Test Customer', 'test@example.com', '123-456-7890');
    `);
    
    // Insert test items
    await testPool.query(`
      INSERT INTO items (id, sku, description, total_quantity) 
      VALUES (1, 12345, 'Test Item 1', 100), (2, 67890, 'Test Item 2', 50);
    `);
    
    // Insert test orders
    await testPool.query(`
      INSERT INTO orders (id, order_number, subtotal, taxes, total, shipping_paid, 
        address_line1, city, state, zip, country, carrier, carrier_speed, customer_id, status) 
      VALUES 
      (1, 1001, 100.00, 8.50, 108.50, 10.00, '123 Test St', 'Test City', 'TS', '12345', 'USA', 'UPS', 'Ground', 1, 'open'),
      (2, 1002, 50.00, 4.25, 54.25, 10.00, '456 Test Ave', 'Test City', 'TS', '12345', 'USA', 'FedEx', 'Ground', 1, 'open');
    `);
    
    // Insert order items
    await testPool.query(`
      INSERT INTO order_items (order_id, item_id, sku, description, quantity, active) 
      VALUES 
      (1, 1, 12345, 'Test Item 1', 2, true),
      (2, 2, 67890, 'Test Item 2', 1, true);
    `);
  });

  test('should create pick list and update order status to staged', async () => {
    // Arrange
    const pickListData = {
      pickListId: 'PL001',
      order_numbers: [1001, 1002],
      items: [
        { sku: 12345, description: 'Test Item 1', quantity: 2, order_numbers: [1001] },
        { sku: 67890, description: 'Test Item 2', quantity: 1, order_numbers: [1002] }
      ],
      createdAt: new Date().toISOString(),
      status: 'staged'
    };

    // Act
    const response = await request(app)
      .post('/picked_orders_staged_for_packing')
      .send(pickListData);

    // Assert
    expect(response.status).toBe(201);
    
    // Verify pick list was created
    const pickListResult = await testPool.query(
      'SELECT * FROM picked_orders_staged_for_packing WHERE pick_list_id = $1',
      ['PL001']
    );
    expect(pickListResult.rows).toHaveLength(1);
    
    // Verify orders are marked as 'staged'
    const ordersResult = await testPool.query(
      'SELECT status FROM orders WHERE order_number = ANY($1)',
      [[1001, 1002]]
    );
    ordersResult.rows.forEach(order => {
      expect(order.status).toBe('staged');
    });
  });

  test('should handle inventory transfer during pick list creation', async () => {
    // Arrange - Add inventory locations
    await testPool.query(`
      INSERT INTO locations (id, location_number, location_name) 
      VALUES (1, 101, 'A1-01'), (2, 102, 'A1-02');
    `);
    
    await testPool.query(`
      INSERT INTO item_locations (item_id, location_id, quantity) 
      VALUES (1, 1, 50), (2, 2, 25);
    `);

    // Act - Transfer inventory
    const transferResponse = await request(app)
      .post('/inventory/transfer')
      .send({
        itemId: 1,
        quantity: 2,
        location: 1
      });

    // Assert
    expect(transferResponse.status).toBe(200);
    
    // Verify inventory was reduced
    const inventoryResult = await testPool.query(
      'SELECT quantity FROM item_locations WHERE item_id = 1 AND location_id = 1'
    );
    expect(inventoryResult.rows[0].quantity).toBe(48);
    
    // Verify total_quantity was updated
    const itemResult = await testPool.query(
      'SELECT total_quantity FROM items WHERE id = 1'
    );
    expect(itemResult.rows[0].total_quantity).toBe(98);
  });
});