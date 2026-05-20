import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "../services/CustomerServices.js";

export const validateCustomerRequest = (req, res, next) => {
  if (!req.validationErrors || req.validationErrors.length === 0) {
    return next();
  }

  return res.status(400).json({ errors: req.validationErrors });
};

export const getCustomersHandler = async (req, res) => {
  try {
    const customers = await getCustomers(req.app.locals.pool);
    return res.json({ customers });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const createCustomerHandler = async (req, res) => {
  try {
    const customer = await createCustomer(req.app.locals.pool, req.body);
    return res.status(201).json({ customers: customer });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const updateCustomerHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await updateCustomer(req.app.locals.pool, id, req.body);
    return res.json({ customers: customer });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const deleteCustomerHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCustomer(req.app.locals.pool, id);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};
