import { createSlice } from "@reduxjs/toolkit";

export const inventorySlice = createSlice({
  name: "inventory",
  initialState: [],
  reducers: {
    setInventory: (state, action) => action.payload,
    updateItemQuantity: (state, action) => {
      const { id, location, quantity } = action.payload;
      const item = state.find((item) => item.id === id);
      if (item) {
        const loc = item.location.find((loc) => loc.location === location);
        if (loc) {
          loc.quantity = quantity;
        }
      }
    },
    addItem: (state, action) => {
        state.push(action.payload);
    },
    removeItem: (state, action) => {
        return state.filter(item => item.id !== action.payload); //creates a new array without the item
    }
  },
});

export const { setInventory, updateItemQuantity, addItem, removeItem } = inventorySlice.actions;

export default inventorySlice.reducer;
