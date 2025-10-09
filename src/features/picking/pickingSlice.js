import { createSlice } from "@reduxjs/toolkit";

export const pickingSlice = createSlice({
  name: "picking",
  initialState: {
    pickLists: [],
    staged: [],
    orders: [],
    items: [],
  },
  reducers: {
    addPickList: (state, action) => {
      state.pickLists.push(action.payload);
    },
    updatePickList: (state, action) => {
      const idx = state.pickLists.findIndex(
        (pl) => pl.id === action.payload.id
      );
      if (idx !== -1) state.pickLists[idx] = action.payload;
    },
    setStaged: (state, action) => {
      state.staged = action.payload;
    },
    setOrders: (state, action) => {
      console.log("setOrders called with:", action.payload);
      state.orders = action.payload;
    },
    setItems: (state, action) => {
      state.items = action.payload;
    },
  },
});

export const { addPickList, updatePickList, setStaged, setOrders, setItems } =
  pickingSlice.actions;
export default pickingSlice.reducer;
