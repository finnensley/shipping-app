import express from "express";
import { body, validationResult } from "express-validator";
import {
  createCustomerHandler,
  deleteCustomerHandler,
  getCustomersHandler,
  updateCustomerHandler,
  validateCustomerRequest,
} from "../controllers/CustomerController.js";

const routes = express.Router();

const captureValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  req.validationErrors = errors.isEmpty() ? [] : errors.array();
  next();
};

routes.get("/customers", getCustomersHandler);

routes.post(
  "/customers",
  [
    body("name").isString().trim().notEmpty(),
    body("email").isString().trim(),
    body("phone").isString().trim(),
  ],
  captureValidationErrors,
  validateCustomerRequest,
  createCustomerHandler,
);

routes.put("/customers/:id", updateCustomerHandler);
routes.delete("/customers/:id", deleteCustomerHandler);

export default routes;
