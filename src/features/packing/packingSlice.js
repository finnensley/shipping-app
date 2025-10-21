import { createSlice } from "@reduxjs/toolkit";

export const packingSlice = createSlice({
  name: "packing",
  initialState: {
    pickLists: [],
    quantities: {},
    packedItems: [],
    currentOrder: null,
  },
  reducers: {
    setPickLists: (state, action) => {
      state.pickLists = action.payload;
    },
    addItem: (state, action) => {
      state.packedItems.push(action.payload);
    },
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      state.quantities[itemId] = quantity;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
  },
});

export const { setPickLists, addItem, updateQuantity, setCurrentOrder } =
  packingSlice.actions;
export default packingSlice.reducer;


