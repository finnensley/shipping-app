export const getItems = async (pool) => {
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

  const itemsMap = {};
  result.rows.forEach((row) => {
    if (!itemsMap[row.item_id]) {
      itemsMap[row.item_id] = {
        id: row.item_id,
        image_path: row.image_path,
        sku: row.sku,
        description: row.description,
        total_quantity: row.total_quantity,
        available_quantity: row.available_quantity,
        locations: [],
      };
    }
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

  return Object.values(itemsMap);
};

export const getItemBySku = async (pool, sku) => {
  const result = await pool.query(
    "SELECT id, sku, description FROM items WHERE sku = $1 LIMIT 1",
    [sku],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

export const createItem = async (pool, payload) => {
  const { image_path, sku, description, total_quantity } = payload;
  const result = await pool.query(
    "INSERT INTO items (image_path, sku, description, total_quantity) VALUES ($1, $2, $3, $4) RETURNING *",
    [image_path, sku, description, total_quantity],
  );

  return result.rows[0];
};

export const updateItem = async (pool, id, payload) => {
  const { image_path, sku, description, total_quantity } = payload;
  const result = await pool.query(
    "UPDATE items SET image_path=$1, sku=$2, description=$3, total_quantity=$4 WHERE id=$5 RETURNING *",
    [image_path, sku, description, total_quantity, id],
  );

  return result.rows[0];
};

export const deleteItem = async (pool, id) => {
  await pool.query("DELETE FROM items WHERE id=$1", [id]);
};

export const getItemLocations = async (pool) => {
  const itemLocations = await pool.query("SELECT * FROM item_locations");
  return itemLocations.rows;
};

export const createItemLocation = async (pool, payload) => {
  const { item_id, location_id, quantity } = payload;
  const result = await pool.query(
    "INSERT INTO item_locations (item_id, location_id, quantity) VALUES ($1, $2, $3) RETURNING *",
    [item_id, location_id, quantity],
  );

  return result.rows[0];
};

export const undoItemLocation = async (pool, id) => {
  const history = await pool.query(
    "SELECT * FROM item_location_history WHERE item_location_id=$1 ORDER BY changed_at DESC LIMIT 1",
    [id],
  );

  const lastChange = history.rows[0];
  if (!lastChange) {
    return { notFound: true };
  }

  const result = await pool.query(
    "UPDATE item_locations SET quantity=$1 WHERE id=$2 RETURNING id, item_id, location_id, quantity",
    [lastChange.old_quantity, id],
  );

  if (!result.rows[0] || !result.rows[0].item_id) {
    return { error: "Could not determine item_id for total_quantity update" };
  }

  await pool.query(
    "UPDATE items SET total_quantity = (SELECT COALESCE(SUM(quantity),0) FROM item_locations WHERE item_id = $1) WHERE id = $1",
    [result.rows[0].item_id],
  );

  return { notFound: false, row: result.rows[0] };
};

export const updateItemLocation = async (pool, id, payload) => {
  const { item_id, location_id, quantity } = payload;

  const current = await pool.query(
    "SELECT quantity FROM item_locations WHERE id=$1",
    [id],
  );
  const oldQuantity = current.rows[0]?.quantity;

  const result = await pool.query(
    "UPDATE item_locations SET item_id=$1, location_id=$2, quantity=$3 WHERE id=$4 RETURNING *",
    [item_id, location_id, quantity, id],
  );

  await pool.query(
    "INSERT INTO item_location_history (item_location_id, old_quantity, new_quantity) VALUES ($1, $2, $3)",
    [id, oldQuantity, quantity],
  );

  await pool.query(
    "UPDATE items SET total_quantity = (SELECT COALESCE(SUM(quantity),0) FROM item_locations WHERE item_id = $1) WHERE id= $1",
    [item_id],
  );

  return result.rows[0];
};

export const deleteItemLocation = async (pool, id) => {
  await pool.query("DELETE FROM item_locations WHERE id=$1", [id]);
};
