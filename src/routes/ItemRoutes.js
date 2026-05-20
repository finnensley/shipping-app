import express from "express";
import { body, validationResult } from "express-validator";
import {
  createItemHandler,
  createItemLocationHandler,
  deleteItemHandler,
  deleteItemLocationHandler,
  getItemBySkuHandler,
  getItemLocationsHandler,
  getItemsHandler,
  undoItemLocationHandler,
  updateItemHandler,
  updateItemLocationHandler,
  validateItemRequest,
} from "../controllers/ItemController.js";

const routes = express.Router();

const captureValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  req.validationErrors = errors.isEmpty() ? [] : errors.array();
  next();
};

routes.get("/items", getItemsHandler);
routes.get("/items/by_sku/:sku", getItemBySkuHandler);

routes.post(
  "/items",
  [
    body("sku").isNumeric(),
    body("description").isString().trim().notEmpty(),
    body("total_quantity").isInt({ min: 0 }),
  ],
  captureValidationErrors,
  validateItemRequest,
  createItemHandler,
);

routes.put("/items/:id", updateItemHandler);
routes.delete("/items/:id", deleteItemHandler);

routes.get("/item_locations", getItemLocationsHandler);

routes.post(
  "/item_locations",
  [
    body("item_id").isNumeric(),
    body("location_id").isInt({ min: 0 }),
    body("quantity").isInt({ min: 0 }),
  ],
  captureValidationErrors,
  validateItemRequest,
  createItemLocationHandler,
);

routes.post("/item_locations/:id/undo", undoItemLocationHandler);
routes.put("/item_locations/:id", updateItemLocationHandler);
routes.delete("/item_locations/:id", deleteItemLocationHandler);

export default routes;
