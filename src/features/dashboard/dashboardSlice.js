import { createSlice } from "@reduxjs/toolkit";
import axios from 'axios';
import API_URL from '../../utils/api';

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
}
});

export const fetchOrderTotal = () => async (dispatch) => {
  dispatch(setLoading(true));
    try {
    const response = await axios.get(`${API_URL}/orders`);
    const orders = response.data.orders ?? response.data;
    const openOrders = orders.filter(order => order.status === "open");
    // Only sum orders with status 'open'
    const total = openOrders.reduce((acc, order) => acc + Number(order.total), 0);
    dispatch(setOrderTotal(total));
    dispatch(setOpenOrderCount(openOrders.length));
    dispatch(setLoading(false));
  } catch (err) {
    dispatch(setError(err.message));
    dispatch(setLoading(false));
  }
};


export const { setOrderTotal, setOpenOrderCount, setLoading, setError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
