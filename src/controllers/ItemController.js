import {
  createItem,
  createItemLocation,
  deleteItem,
  deleteItemLocation,
  getItemBySku,
  getItemLocations,
  getItems,
  undoItemLocation,
  updateItem,
  updateItemLocation,
} from "../services/ItemServices.js";

export const validateItemRequest = (req, res, next) => {
  if (!req.validationErrors || req.validationErrors.length === 0) {
    return next();
  }

  return res.status(400).json({ errors: req.validationErrors });
};

export const getItemsHandler = async (req, res) => {
  try {
    console.log("GET /items - DATABASE_URL set:", !!process.env.DATABASE_URL);
    const items = await getItems(req.app.locals.pool);
    return res.json({ items });
  } catch (err) {
    console.error("ERROR in GET /items:", err.message, err.code);
    return res.status(500).json({ error: err.message, code: err.code });
  }
};

export const getItemBySkuHandler = async (req, res) => {
  try {
    const { sku } = req.params;
    const item = await getItemBySku(req.app.locals.pool, sku);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json(item);
  } catch (err) {
    console.error("Backend error:", err);
    return res.status(500).send("Server Error");
  }
};

export const createItemHandler = async (req, res) => {
  try {
    const item = await createItem(req.app.locals.pool, req.body);
    return res.status(201).json({ items: item });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const updateItemHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await updateItem(req.app.locals.pool, id, req.body);
    return res.json({ item });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const deleteItemHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteItem(req.app.locals.pool, id);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const getItemLocationsHandler = async (req, res) => {
  try {
    const itemLocations = await getItemLocations(req.app.locals.pool);
    return res.json({ itemLocations });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const createItemLocationHandler = async (req, res) => {
  try {
    const itemLocation = await createItemLocation(
      req.app.locals.pool,
      req.body,
    );
    return res.status(201).json({ item_location: itemLocation });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const undoItemLocationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await undoItemLocation(req.app.locals.pool, id);

    if (result.notFound) {
      return res.status(404).send("No history found");
    }

    if (result.error) {
      return res.status(500).send(result.error);
    }

    return res.json({ item_location: result.row });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const updateItemLocationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const itemLocation = await updateItemLocation(
      req.app.locals.pool,
      id,
      req.body,
    );
    return res.json({ item_locations: itemLocation });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const deleteItemLocationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteItemLocation(req.app.locals.pool, id);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};
