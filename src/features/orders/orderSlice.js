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
  },
});

export const { setOrder, updateItemQuantity, addOrder, removeOrder } =
  orderSlice.actions;

export default orderSlice.reducer;
