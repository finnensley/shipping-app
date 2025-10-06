import { createSlice } from "@reduxjs/toolkit";

export const ordersSlice = createSlice({
  name: "orders",
  initialState: [],
  reducers: {
    setOrders: (state, action) => action.payload,
    updateItemQuantities: (state, action) => {
      const { orderId, itemId, delta } = action.payload;
      const order = state.find((order) => order.id === orderId);
      if (order && item.id) {
        const itemUpdate = order.item.find((quantity) => item.quantity === orderItemQuantity);
        if (itemUpdate) {
          item.quantity += delta;
         
      console.log(state, item.sku, action.payload)
      }
    }
  },
    addItem: (state, action) => {
        state.push(action.payload); // adds a new item 
    },
    removeItem: (state, action) => {
        return state.filter(item => item.id !== action.payload); //creates a new array without the removed item
    }
  },
});

export const { setInventory, updateItemQuantity, addItem, removeItem } = inventorySlice.actions;

export default inventorySlice.reducer;