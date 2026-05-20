import express from "express";
import { body, validationResult } from "express-validator";
import {
  createOrderHandler,
  createOrderItemHandler,
  deleteOrderHandler,
  deleteOrderItemHandler,
  getOrderItemsHandler,
  getOrdersHandler,
  getOrdersWithItemsHandler,
  undoOrderItemHandler,
  updateOrderCarrierHandler,
  updateOrderItemHandler,
  updateOrderHandler,
  validateRequest,
} from "../controllers/OrderController.js";

const routes = express.Router();

const captureValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  req.validationErrors = errors.isEmpty() ? [] : errors.array();
  next();
};

routes.get("/orders", getOrdersHandler);
routes.get("/orders_with_items", getOrdersWithItemsHandler);
routes.put("/orders/:order_number/carrier", updateOrderCarrierHandler);
routes.put("/orders/:id", updateOrderHandler);
routes.delete("/orders/:id", deleteOrderHandler);
routes.get("/order_items", getOrderItemsHandler);
routes.post("/order_items/:id/undo", undoOrderItemHandler);
routes.put("/order_items/:id", updateOrderItemHandler);
routes.delete("/order_items/:id", deleteOrderItemHandler);

routes.post(
  "/orders",
  [
    body("order_number").isNumeric(),
    body("subtotal").isNumeric(),
    body("taxes").isNumeric(),
    body("total").isNumeric(),
    body("shipping_paid").isNumeric(),
    body("address_line1").isString().notEmpty(),
    body("address_line2").optional(),
    body("city").isString().trim().notEmpty(),
    body("state").isString().trim().notEmpty(),
    body("zip").isString().trim().notEmpty(),
    body("country").isString().trim().notEmpty(),
    body("carrier").isString().trim().notEmpty(),
    body("carrier_speed").isString().trim().notEmpty(),
    body("customer_id").isInt().notEmpty(),
  ],
  captureValidationErrors,
  validateRequest,
  createOrderHandler,
);

routes.post(
  "/order_items",
  [
    body("order_id").isInt({ min: 0 }),
    body("item_id").isInt({ min: 0 }),
    body("sku").isNumeric(),
    body("description").isString().trim().notEmpty(),
    body("quantity").isInt({ min: 0 }),
  ],
  captureValidationErrors,
  validateRequest,
  createOrderItemHandler,
);

export default routes;
