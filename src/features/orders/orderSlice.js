import { createSlice } from "@reduxjs/toolkit";

export const orderSlice = createSlice({
  name: "order",
  initialState: [],
  reducers: {
    setOrder: (state, action) => action.payload,
    updateItemQuantity: (state, action) => {
      const { orderId, itemId, delta } = action.payload;
      const order = state.find(
        (order) => order.id === orderId || order.order_id === orderId
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
          order.order_id === updatedOrder.order_id
      );
      if (idx !== -1) {
        // findIndex() returns an index of the matching order or -1 if not found
        state[idx] = updatedOrder; // replace existing order
      }
    },
  },
});

export const {
  setOrder,
  updateItemQuantity,
  addOrder,
  removeOrder,
  updateOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
