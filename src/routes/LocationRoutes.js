import express from "express";
import { body, validationResult } from "express-validator";
import {
  createLocationHandler,
  deleteLocationHandler,
  getLocationsHandler,
  updateLocationHandler,
  validateLocationRequest,
} from "../controllers/LocationController.js";

const routes = express.Router();

const captureValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  req.validationErrors = errors.isEmpty() ? [] : errors.array();
  next();
};

routes.get("/locations", getLocationsHandler);

routes.post(
  "/locations",
  [
    body("location_number").isNumeric(),
    body("location_name").isString().trim(),
    body("description").isString().trim(),
  ],
  captureValidationErrors,
  validateLocationRequest,
  createLocationHandler,
);

routes.put("/locations/:id", updateLocationHandler);
routes.delete("/locations/:id", deleteLocationHandler);

export default routes;
