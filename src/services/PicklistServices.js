import { validateInventoryAvailability } from "../utils/inventory-validator.js";

export const getPicklistsWithOrderInfo = async (pool) => {
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

  return result.rows;
};

export const getPickedOrdersStagedForPacking = async (pool) => {
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

  const picklistsMap = {};

  result.rows.forEach((row) => {
    const pickListId = row.pick_list_id;

    if (!picklistsMap[pickListId]) {
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
        orders: [],
      };
    }

    if (row.order_id && row.order_numbers.includes(row.order_number)) {
      const existingOrder = picklistsMap[pickListId].orders.find(
        (order) => order.order_number === row.order_number,
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

  return Object.values(picklistsMap);
};

export const stagePickedOrdersForPacking = async (pool, payload) => {
  const { pickListId, order_numbers, items, createdAt, status } = payload;

  await validateInventoryAvailability(pool, items);

  await pool.query(
    "INSERT INTO picked_orders_staged_for_packing (pick_list_id, order_numbers, items, created_at, status) VALUES ($1, $2, $3, $4, $5)",
    [pickListId, order_numbers, JSON.stringify(items), createdAt, status],
  );

  await pool.query(
    "UPDATE orders SET status = 'staged' WHERE order_number = ANY($1)",
    [order_numbers],
  );
};

export const transferInventoryForPicklist = async (pool, payload) => {
  const { itemId, quantity, location } = payload;
  const result = await pool.query(
    "UPDATE item_locations SET quantity = quantity - $1 WHERE item_id = $2 AND location_id = $3",
    [quantity, itemId, location],
  );

  await pool.query(
    "UPDATE items SET total_quantity = (SELECT COALESCE(SUM(quantity), 0) FROM item_locations WHERE item_id = $1) WHERE id = $1",
    [itemId],
  );

  return result.rowCount;
};
