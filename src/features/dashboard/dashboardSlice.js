import { createSlice } from "@reduxjs/toolkit";
import { authenticateToken } from "../../middleware/authMiddleware";

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    isAuthenticated: false,
  },
  reducers: {
    isAuthenticated: (state, action) => {
      const { userName, passwordHash, token } = action.payload;
      const user = user.find(
        (user) => user.username === userName.toLowerCase()
      );
      if (!user) {
        isAuthenticated = false;
      } else {
        if (user.password === passwordHash) {
          isAuthenticated = true;
        }
      }
    },
  },
});

export const { isAuthenticated } = dashboardSlice.actions;

export default dashboardSlice.reducer;
