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
    selectedPackage: "",
    packageDimensions: {
      length: "",
      width: "",
      height: "",
      weight: "",
    },
    selectedCarrier: null, // null indicates no selection
    loading: false,
    error: null,
  },
  reducers: {
    // using set is for direct replacement
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

    // uses more complicated business logic, like checks or multiple state updates
    packItem: (state, action) => {
      const { id, sku, description } = action.payload;

      // Decrement remaining quantity
      if (state.remainingQuantities[id] > 0) {
        state.remainingQuantities[id] -= 1;

        // Find existing packed item or create new one
        const existingPackedItem = state.packedItems.find(
          (item) => item.id === id
        );
        if (existingPackedItem) {
          existingPackedItem.quantity += 1;
        } else {
          state.packedItems.push({
            id,
            sku,
            description,
            quantity: 1,
          });
        }
      }
    },

    unpackItem: (state, action) => {
      const itemId = action.payload;

      // Find packed item
      const packedItemIndex = state.packedItems.findIndex(
        (item) => item.id === itemId
      );
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

    setSelectedPackage: (state, action) => {
      const packageValue = action.payload;
      state.selectedPackage = packageValue;

      // Auto-fill dimensions when package is selected
      if (packageValue && packageValue !== "") {
        const dimensions = packageValue.split("x");
        if (dimensions.length === 3) {
          state.packageDimensions = {
            length: dimensions[0],
            width: dimensions[1],
            height: dimensions[2],
            weight: state.packageDimensions.weight, // Keep existing weight
          };
        }
      } else {
        // Clear dimensions when no package selected
        state.packageDimensions = {
          length: "",
          width: "",
          height: "",
          weight: "",
        };
      }
    },

    setPackageDimensions: (state, action) => {
      state.packageDimensions = {
        ...state.packageDimensions,
        ...action.payload,
      };
    },

    resetPackingState: (state) => {
      state.selectedPickList = null;
      state.selectedOrder = null;
      state.showPickListSelector = false;
      state.packedItems = [];
      state.remainingQuantities = {};
      state.selectedPackage = ""; // Add this
      state.packageDimensions = {
        // Add this
        length: "",
        width: "",
        height: "",
        weight: "",
      };
    },
    setSelectedCarrier: (state, action) => {
      state.selectedCarrier = action.payload;
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
  setSelectedPackage,
  setPackageDimensions,
  resetPackingState,
  setSelectedCarrier,
  setLoading,
  setError,
} = packingSlice.actions;

export default packingSlice.reducer;
