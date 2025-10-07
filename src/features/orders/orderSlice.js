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
        const item = order.item.find((item) => item.id === itemId);
        if (item) {
          item.quantity += delta;

          console.log(state, action.payload);
        }
      }
    },
    addItem: (state, action) => {
      state.push(action.payload); // adds a new item
    },
    removeItem: (state, action) => {
      return state.filter((item) => item.id !== action.payload); //creates a new array without the removed item
    },
  },
});

export const { setOrder, updateItemQuantity, addItem, removeItem } =
  orderSlice.actions;

export default orderSlice.reducer;
