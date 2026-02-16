import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Determine API_URL at runtime
function getApiUrl() {
  if (typeof window === "undefined") return "";
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:3000";
  }
  return "/api";
}

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    orderTotal: 0,
    openOrderCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setOrderTotal: (state, action) => {
      state.orderTotal = action.payload;
    },
    setOpenOrderCount: (state, action) => {
      state.openOrderCount = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const fetchOrderTotal = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const API_URL = getApiUrl();
    const token = localStorage.getItem("token");

    if (!token) {
      dispatch(setError("No authentication token found"));
      dispatch(setLoading(false));
      return;
    }

    console.log("Fetching orders from:", `${API_URL}/api/orders`);
    console.log("Token present:", !!token);

    const response = await axios.get(`${API_URL}/api/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Dashboard fetchOrderTotal response:", response.data);
    const orders = Array.isArray(response.data)
      ? response.data
      : (response.data.orders ?? []);
    console.log("Orders after processing:", orders);

    if (!Array.isArray(orders)) {
      throw new Error(`Expected orders to be an array, got ${typeof orders}`);
    }

    const openOrders = orders.filter((order) => order.status === "open");
    const total = openOrders.reduce(
      (acc, order) => acc + Number(order.total),
      0,
    );

    dispatch(setOrderTotal(total));
    dispatch(setOpenOrderCount(openOrders.length));
    dispatch(setError(null));
  } catch (err) {
    console.error("Error fetching order total - Full error:", err);
    console.error("Response data:", err.response?.data);
    console.error("Status:", err.response?.status);
    dispatch(setError(err.message || "Failed to fetch orders"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const { setOrderTotal, setOpenOrderCount, setLoading, setError } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
