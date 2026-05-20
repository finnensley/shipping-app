import {
  createOrder,
  createOrderItem,
  deleteOrder,
  deleteOrderItem,
  getOpenOrdersWithItems,
  getOrderItems,
  getOrders,
  undoOrderItem,
  updateOrderCarrier,
  updateOrderItem,
  updateOrderWithItems,
} from "../services/OrderServices.js";

export const validateRequest = (req, res, next) => {
  if (!req.validationErrors || req.validationErrors.length === 0) {
    return next();
  }

  return res.status(400).json({ errors: req.validationErrors });
};

export const createOrderHandler = async (req, res) => {
  try {
    const order = await createOrder(req.app.locals.pool, req.body);
    return res.status(201).json({ orders: order });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const createOrderItemHandler = async (req, res) => {
  try {
    const orderItem = await createOrderItem(req.app.locals.pool, req.body);
    return res.status(201).json({ order_items: orderItem });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const getOrdersHandler = async (req, res) => {
  try {
    const orders = await getOrders(req.app.locals.pool);
    return res.json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const getOrdersWithItemsHandler = async (req, res) => {
  try {
    const orders = await getOpenOrdersWithItems(req.app.locals.pool);
    return res.json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const updateOrderHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateOrderWithItems(
      req.app.locals.pool,
      id,
      req.body,
    );

    if (result.status === 400) {
      return res.status(400).json(result.body);
    }

    return res.json(result.body);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
  }
};

export const deleteOrderHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteOrder(req.app.locals.pool, id);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const updateOrderCarrierHandler = async (req, res) => {
  try {
    const { order_number } = req.params;
    const { carrier, carrier_speed } = req.body;
    const order = await updateOrderCarrier(
      req.app.locals.pool,
      order_number,
      carrier,
      carrier_speed,
    );
    return res.json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const getOrderItemsHandler = async (req, res) => {
  try {
    const orderItems = await getOrderItems(req.app.locals.pool);
    return res.json({ orderItems });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const undoOrderItemHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await undoOrderItem(req.app.locals.pool, id);

    if (result.notFound) {
      return res.status(404).send("No history found");
    }

    return res.json({ order_item: result.row });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

export const updateOrderItemHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const orderItem = await updateOrderItem(req.app.locals.pool, id, quantity);
    return res.json({ order_items: orderItem });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const deleteOrderItemHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteOrderItem(req.app.locals.pool, id);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};
