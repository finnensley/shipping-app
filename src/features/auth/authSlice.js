import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
  },
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload; //payload should be true/false
    },
  },
});

export const { setAuthenticated } = authSlice.actions;

export default authSlice.reducer;