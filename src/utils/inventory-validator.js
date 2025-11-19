// utils/inventory-validator.js
export const validateInventoryAvailability = async (pool, items) => {
  for (const item of items) {
    const inventoryResult = await pool.query(
      "SELECT SUM(quantity) as total FROM item_locations WHERE item_id = (SELECT id FROM items WHERE sku = $1)",
      [item.sku]
    );
    
    const availableQuantity = inventoryResult.rows[0]?.total || 0;
    
    if (availableQuantity < item.quantity) {
      throw new Error(`Insufficient inventory for item ${item.sku}. Available: ${availableQuantity}, Requested: ${item.quantity}`);
    }
  }
  
  return true;
};



