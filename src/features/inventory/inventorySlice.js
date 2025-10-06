import { createSlice } from "@reduxjs/toolkit";

export const inventorySlice = createSlice({
  name: "inventory",
  initialState: [],
  reducers: {
    setInventory: (state, action) => action.payload,
    updateItemQuantity: (state, action) => {
      const { itemId, locationId, delta } = action.payload;
      const item = state.find((item) => item.id === itemId);
      if (item && item.locations) {
        const loc = item.locations.find((loc) => loc.id === locationId);
        if (loc) {
          loc.quantity += delta;
          item.total_quantity = item.locations.reduce((sum, l) => sum + (Number(l.quantity) || 0),
      0);
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
