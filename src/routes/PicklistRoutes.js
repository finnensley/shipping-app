import express from "express";
import {
  getPicklistsWithOrderInfoHandler,
  getPickedOrdersStagedForPackingHandler,
  stagePickedOrdersForPackingHandler,
  transferInventoryForPicklistHandler,
} from "../controllers/PicklistController.js";

const routes = express.Router();

routes.get("/picklists_with_order_info", getPicklistsWithOrderInfoHandler);
routes.get(
  "/picked_orders_staged_for_packing",
  getPickedOrdersStagedForPackingHandler,
);
routes.post(
  "/picked_orders_staged_for_packing",
  stagePickedOrdersForPackingHandler,
);
routes.post("/inventory/transfer", transferInventoryForPicklistHandler);

export default routes;
