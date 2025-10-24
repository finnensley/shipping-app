import { configureStore } from "@reduxjs/toolkit";
import inventoryReducer from "../features/inventory/inventorySlice";
import orderReducer from "../features/orders/orderSlice";
import pickingReducer from "../features/picking/pickingSlice";
import packingReducer from "../features/packing/packingSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import authReducer from "../features/auth/authSlice";

export default configureStore({
  reducer: {
    inventory: inventoryReducer,
    order: orderReducer,
    picking: pickingReducer,
    packing: packingReducer,
    dashboard: dashboardReducer,
    auth: authReducer,
  },
});
