import { createSlice } from "@reduxjs/toolkit";

export const packingSlice = createSlice({
    name: "packing",
    initialState: [],
    reducers: {
        setPickLists: (state, action) => {
            state.pickLists = action.payload;
        },
        setOrders: (state, action) => {
            state.orders = action.payload;
        },
        // setItems: (state, action) => {
        //     state.items = action.payload;
        // },
        // setPacked: (state, action) => {
        //     state.packed = action.payload;
        // }

    }
});

export const { setPickLists, setOrders, setItems, setPacked } = packingSlice.actions;
export default packingSlice.reducer;

// may not need setPacked, could do with local state