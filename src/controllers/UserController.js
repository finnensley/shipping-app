import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../services/UserServices.js";

export const validateUserRequest = (req, res, next) => {
  if (!req.validationErrors || req.validationErrors.length === 0) {
    return next();
  }

  return res.status(400).json({ errors: req.validationErrors });
};

export const getUsersHandler = async (req, res) => {
  try {
    const users = await getUsers(req.app.locals.pool);
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const createUserHandler = async (req, res) => {
  try {
    const user = await createUser(req.app.locals.pool, req.body);
    return res.status(201).json({ users: user });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const updateUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await updateUser(req.app.locals.pool, id, req.body);
    return res.json({ users: user });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const deleteUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUser(req.app.locals.pool, id);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};
