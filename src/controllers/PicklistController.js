import {
  getPicklistsWithOrderInfo,
  getPickedOrdersStagedForPacking,
  stagePickedOrdersForPacking,
  transferInventoryForPicklist,
} from "../services/PicklistServices.js";

export const getPicklistsWithOrderInfoHandler = async (req, res) => {
  try {
    const picklists = await getPicklistsWithOrderInfo(req.app.locals.pool);
    return res.json({ picklists });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const getPickedOrdersStagedForPackingHandler = async (req, res) => {
  try {
    const picklists = await getPickedOrdersStagedForPacking(
      req.app.locals.pool,
    );
    return res.json({ picklists });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const stagePickedOrdersForPackingHandler = async (req, res) => {
  try {
    await stagePickedOrdersForPacking(req.app.locals.pool, req.body);
    return res.status(201).send("Pick list staged for packing");
  } catch (err) {
    if (err.message.includes("Insufficient inventory")) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

export const transferInventoryForPicklistHandler = async (req, res) => {
  try {
    const rowCount = await transferInventoryForPicklist(
      req.app.locals.pool,
      req.body,
    );
    console.log("Transfer result:", rowCount, req.body);
    return res.status(200).send("Inventory updated");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};
