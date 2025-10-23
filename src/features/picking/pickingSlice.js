import { createSlice } from "@reduxjs/toolkit";

export const pickingSlice = createSlice({
  name: "picking",
  initialState: {
    pickLists: [],
    orders: [],
    items: [],
    lastGeneratedPickList: null,
    lastPickListOrders: [],
    lastPickListId: null,
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
    setOrders: (state, action) => {
      console.log("setOrders called with:", action.payload);
      state.orders = action.payload;
    },
    setItems: (state, action) => {
      state.items = action.payload;
    },
    saveLastPickList: (state, action) => {
      const { pickList, selectedOrders, pickListId } = action.payload;
      state.lastGeneratedPickList = pickList;
      state.lastPickListOrders = selectedOrders;
      state.lastPickListId = pickListId;
    },
    clearLastPickList: (state, action) => {
      state.lastGeneratedPickList = null;
      state.lastPickListOrders = [];
      state.lastPickListId = null;
    },
  },
});

export const {
  addPickList,
  updatePickList,
  setOrders,
  setItems,
  saveLastPickList,
  clearLastPickList,
} = pickingSlice.actions;
export default pickingSlice.reducer;
