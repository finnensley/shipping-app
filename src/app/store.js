import { configureStore } from "@reduxjs/toolkit";
import inventoryReducer from "../features/inventory/inventorySlice";
import orderReducer from "../features/orders/orderSlice";

export default configureStore({
  reducer: {
    inventory: inventoryReducer,
    order: orderReducer,
  },
});
