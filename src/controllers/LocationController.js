import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
} from "../services/LocationServices.js";

export const validateLocationRequest = (req, res, next) => {
  if (!req.validationErrors || req.validationErrors.length === 0) {
    return next();
  }

  return res.status(400).json({ errors: req.validationErrors });
};

export const getLocationsHandler = async (req, res) => {
  try {
    const locations = await getLocations(req.app.locals.pool);
    return res.json({ locations });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const createLocationHandler = async (req, res) => {
  try {
    const location = await createLocation(req.app.locals.pool, req.body);
    return res.status(201).json({ locations: location });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const updateLocationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await updateLocation(req.app.locals.pool, id, req.body);
    return res.json({ locations: location });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const deleteLocationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteLocation(req.app.locals.pool, id);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};
