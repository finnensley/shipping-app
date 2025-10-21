import { createSlice } from "@reduxjs/toolkit";

export const packingSlice = createSlice({
  name: "packing",
  initialState: {
    pickLists: [],
    selectedPickList: null,
    selectedOrder: null,
    showPickListSelector: false,
    quantities: {},
    packedItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    setPickLists: (state, action) => {
      state.pickLists = action.payload;
    },
    setSelectedPickList: (state, action) => {
      state.selectedPickList = action.payload;
      // reset selected order when changing pick list
      if (action.payload === null) {
        state.selectedOrder = null;
      }
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    setShowPickListSelector: (state, action) => {
      state.showPickListSelector = action.payload;
    },
    setQuantities: (state, action) => {
      state.quantities = action.payload;
    },
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      state.quantities[itemId] = quantity;
    },
    addItem: (state, action) => {
      state.packedItems.push(action.payload);
    },
    removeItem: (state, action) => {
      state.packedItems = state.packedItems.filter(
        (item) => item.id !== action.payload
      );
    },
    resetPackingState: (state) => {
      state.selectedPickList = null;
      state.selectedOrder = null;
      state.showPickListSelector = false;
      state.packedItems = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPickLists,
  setSelectedPickList,
  setSelectedOrder,
  setShowPickListSelector,
  setQuantities,
  updateQuantity,
  addItem,
  removeItem,
  resetPackingState,
  setLoading,
  setError,
} = packingSlice.actions;

export default packingSlice.reducer;
