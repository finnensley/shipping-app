import { createSlice } from "@reduxjs/toolkit";
import API_URL from "../../utils/api";

export const orderSlice = createSlice({
  name: "order",
  initialState: [],
  reducers: {
    setOrder: (state, action) => action.payload,
    updateItemQuantity: (state, action) => {
      const { orderId, itemId, delta } = action.payload;
      const order = state.find(
        (order) => order.id === orderId || order.order_id === orderId,
      );
      if (order && order.items) {
        const item = order.items.find((item) => item.id === itemId);
        if (item) {
          console.log("Before:", item.quantity, "Delta:", delta);
          item.quantity += delta;
          console.log("After:", item.quantity);

          console.log(state, action.payload);
        }
      }
    },
    addOrder: (state, action) => {
      state.push(action.payload); // adds a new order to array
    },
    removeOrder: (state, action) => {
      return state.filter((item) => item.id !== action.payload); //creates a new array without the removed order
    },
    updateOrder: (state, action) => {
      const updatedOrder = action.payload;
      console.log("Redux state before update:", state);
      console.log("Payload sent to updateOrder:", updatedOrder);
      const idx = state.findIndex(
        (order) =>
          order.id === updatedOrder.id ||
          order.order_id === updatedOrder.order_id,
      );
      if (idx !== -1) {
        // findIndex() returns an index of the matching order or -1 if not found
        state[idx] = updatedOrder; // replace existing order
      }
    },
  },
});

// Fetch orders from backend and update Redux state
export const fetchOrders = () => async (dispatch) => {
  try {
    const url = `${API_URL}/api/orders_with_items`;
    console.log("Fetching orders from URL:", url);
    const response = await fetch(url);
    console.log("Response status:", response.status, "ok:", response.ok);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Order fetchOrders response:", data);
    const orders = Array.isArray(data) ? data : (data.orders ?? []);
    if (!Array.isArray(orders)) {
      console.warn(
        "Expected orders to be an array, got:",
        typeof orders,
        orders,
      );
    }
    dispatch(setOrder(orders));
  } catch (err) {
    console.error("Error fetching orders:", err.message, err.stack);
  }
};

export const {
  setOrder,
  updateItemQuantity,
  addOrder,
  removeOrder,
  updateOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
