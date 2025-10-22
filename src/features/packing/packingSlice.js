import { createSlice } from "@reduxjs/toolkit";

export const packingSlice = createSlice({
  name: "packing",
  initialState: {
    pickLists: [],
    selectedPickList: null,
    selectedOrder: null,
    showPickListSelector: false,
    remainingQuantities: {},
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
    setRemainingQuantities: (state, action) => {
      state.remainingQuantities = action.payload;
    },
    
    packItem: (state, action) => {
      const { id, sku, description } = action.payload;
    

          // Decrement remaining quantity
      if (state.remainingQuantities[id] > 0) {
        state.remainingQuantities[id] -= 1;
        
        // Find existing packed item or create new one
        const existingPackedItem = state.packedItems.find(item => item.id === id);
        if (existingPackedItem) {
          existingPackedItem.quantity += 1;
        } else {
          state.packedItems.push({
            id,
            sku,
            description,
            quantity: 1
          });
        }
      }
    },
    
    unpackItem: (state, action) => {
      const itemId = action.payload;
      
      // Find packed item
      const packedItemIndex = state.packedItems.findIndex(item => item.id === itemId);
      if (packedItemIndex !== -1) {
        const packedItem = state.packedItems[packedItemIndex];
        
        // Increment remaining quantity
        state.remainingQuantities[itemId] += 1;
        
        // Decrement packed quantity
        if (packedItem.quantity > 1) {
          packedItem.quantity -= 1;
        } else {
          // Remove from packed items if quantity becomes 0
          state.packedItems.splice(packedItemIndex, 1);
        }
      }
    },
    resetPackingState: (state) => {
      state.selectedPickList = null;
      state.selectedOrder = null;
      state.showPickListSelector = false;
      state.packedItems = [];
      state.remainingQuantities = {};
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
  setRemainingQuantities,
  packItem,
  unpackItem,
  resetPackingState,
  setLoading,
  setError,
} = packingSlice.actions;

export default packingSlice.reducer;
