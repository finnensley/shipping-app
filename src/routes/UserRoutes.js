import express from "express";
import { body, validationResult } from "express-validator";
import {
  createUserHandler,
  deleteUserHandler,
  getUsersHandler,
  updateUserHandler,
  validateUserRequest,
} from "../controllers/UserController.js";

const routes = express.Router();

const captureValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  req.validationErrors = errors.isEmpty() ? [] : errors.array();
  next();
};

routes.get("/users", getUsersHandler);

routes.post(
  "/users",
  [
    body("username").isString().trim().notEmpty(),
    body("email").isString().trim().notEmpty(),
    body("password_hash").isString().trim().notEmpty(),
    body("permissions").isString().trim().notEmpty(),
  ],
  captureValidationErrors,
  validateUserRequest,
  createUserHandler,
);

routes.put("/users/:id", updateUserHandler);
routes.delete("/users/:id", deleteUserHandler);

export default routes;
