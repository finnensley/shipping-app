export const createOrder = async (pool, payload) => {
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
  } = payload;

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
    ],
  );

  return result.rows[0];
};

export const createOrderItem = async (pool, payload) => {
  const { order_id, item_id, sku, description, quantity } = payload;

  const result = await pool.query(
    "INSERT INTO order_items (order_id, item_id, sku, description, quantity ) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [order_id, item_id, sku, description, quantity],
  );

  await pool.query(
    "UPDATE items SET available_quantity = available_quantity - $1 WHERE id = $2",
    [quantity, item_id],
  );

  return result.rows[0];
};

export const getOrders = async (pool) => {
  const result = await pool.query("SELECT * FROM orders ORDER BY id DESC");
  return result.rows;
};

export const getOpenOrdersWithItems = async (pool) => {
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

  return Object.values(ordersMap);
};

export const updateOrderWithItems = async (pool, id, payload) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
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
    } = payload;

    order_number = Number(order_number);
    subtotal = Number(subtotal);
    taxes = Number(taxes);
    total = Number(total);
    shipping_paid = Number(shipping_paid);
    customer_id = Number(customer_id);

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
      return { status: 400, body: { error: "Missing or invalid fields" } };
    }

    await client.query("BEGIN");
    transactionStarted = true;

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
      ],
    );

    const { rows: currentItems } = await client.query(
      "SELECT id FROM order_items WHERE order_id=$1 AND active=TRUE",
      [id],
    );

    const safeItems = Array.isArray(items) ? items : [];
    const payloadIds = safeItems
      .filter((item) => item.id)
      .map((item) => item.id);

    for (const item of currentItems) {
      if (!payloadIds.includes(item.id)) {
        await client.query("UPDATE order_items SET active=FALSE WHERE id=$1", [
          item.id,
        ]);
      }
    }

    for (const item of safeItems) {
      if (item.id) {
        await client.query(
          "UPDATE order_items SET quantity=$1, description=$2 WHERE id=$3",
          [Number(item.quantity), item.description, item.id],
        );
      } else {
        await client.query(
          "INSERT INTO order_items (order_id, item_id, sku, description, quantity, active) VALUES ($1, $2, $3, $4, $5, TRUE)",
          [
            id,
            Number(item.item_id),
            item.sku,
            item.description,
            Number(item.quantity),
          ],
        );
      }
    }

    await client.query("COMMIT");

    const itemsResult = await pool.query(
      "SELECT * FROM order_items WHERE order_id=$1 AND active=TRUE",
      [id],
    );

    return {
      status: 200,
      body: { order: result.rows[0], items: itemsResult.rows },
    };
  } catch (err) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }
    throw err;
  } finally {
    client.release();
  }
};

export const deleteOrder = async (pool, id) => {
  await pool.query("DELETE FROM orders WHERE id=$1", [id]);
};

export const updateOrderCarrier = async (
  pool,
  orderNumber,
  carrier,
  carrierSpeed,
) => {
  const result = await pool.query(
    "UPDATE orders SET carrier=$1, carrier_speed=$2 WHERE order_number=$3 RETURNING *",
    [carrier, carrierSpeed, orderNumber],
  );

  return result.rows[0];
};

export const getOrderItems = async (pool) => {
  const orderItems = await pool.query("SELECT * FROM order_items");
  return orderItems.rows;
};

export const undoOrderItem = async (pool, id) => {
  const history = await pool.query(
    "SELECT * FROM order_item_history WHERE order_item_id=$1 ORDER BY changed_at DESC LIMIT 1",
    [id],
  );

  const lastChange = history.rows[0];
  if (!lastChange) {
    return { notFound: true };
  }

  const result = await pool.query(
    "UPDATE order_items SET quantity=$1 WHERE id=$2 RETURNING *",
    [lastChange.old_quantity, id],
  );

  return { notFound: false, row: result.rows[0] };
};

export const updateOrderItem = async (pool, id, quantity) => {
  const current = await pool.query(
    "SELECT quantity, item_id FROM order_items WHERE id=$1",
    [id],
  );
  const oldQuantity = current.rows[0]?.quantity;
  const itemId = current.rows[0]?.item_id;

  const result = await pool.query(
    "UPDATE order_items SET quantity=$1 WHERE id=$2 RETURNING *",
    [quantity, id],
  );

  const diff = quantity - oldQuantity;
  await pool.query(
    "UPDATE items SET available_quantity = available_quantity - $1 WHERE id = $2",
    [diff, itemId],
  );

  await pool.query(
    "INSERT INTO order_item_history (order_item_id, old_quantity, new_quantity) VALUES ($1, $2, $3)",
    [id, oldQuantity, quantity],
  );

  return result.rows[0];
};

export const deleteOrderItem = async (pool, id) => {
  const current = await pool.query(
    "SELECT quantity, item_id FROM order_items WHERE id=$1",
    [id],
  );
  const quantity = current.rows[0]?.quantity;
  const itemId = current.rows[0]?.item_id;

  await pool.query("DELETE FROM order_items WHERE id=$1", [id]);

  await pool.query(
    "UPDATE items SET available_quantity = available_quantity + $1 WHERE id = $2",
    [quantity, itemId],
  );
};
