import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./App.css";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/header";
import AuthPage from "./pages/auth/auth";
import DashboardPage from "./pages/dashboard/dashboard";
import InventoryPage from "./pages/inventory/inventory";
import OrdersPage from "./pages/orders/orders";
import PickingPage from "./pages/picking/picking";
import PackingPage from "./pages/packing/packing";
import StoreFrontPage from "./pages/storeFront/storeFront";
import UsersPage from "./pages/users/users";
import OrderDetailsPage from "./pages/orders/orderDetails";
import { setAuthenticated } from "./features/auth/authSlice";


function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Runs once when app loads, checks if for token and updates Redux state
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(setAuthenticated(true));
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      {/* bg-[url('assets/pexels-david-bartus-43782-2290438.jpg')], bg-black, bg-[rgba(0,0,0,0.38)] */}
      {/* <div className="font-bold border-x rounded-lg bg-green-500/20 bg-cover w-full bg-gradient-to-r from-black/90 via-black/60 to-transparent"> */}
      <div className="flex flex-col min-h-screen font-bold w-full bg-cover bg-gradient-to-r from-black/80 via-black/60 to-transparent shadow-2xl rounded-xl border border-white/30 bg-white/10">
        <div className="flex flex-col justify-center font-medium rounded-lg">
          <h1 className="text-white ">
            <Header />
          </h1>
        </div>
        <div className="flex-1 flex-col items-center justify-center">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" />}
          />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/orders" element={<OrdersPage />}>
            <Route path=":orderNumber" element={<OrderDetailsPage />} />
          </Route>
          <Route path="/picking" element={<PickingPage />} />
          <Route path="/packing" element={<PackingPage />} />
          <Route path="/store" element={<StoreFrontPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
        </div>
        <div className="flex text-sm items-center justify-center font-semibold text-white bottom-0 p-2 bg-[rgba(13, 110, 8, 0.38)] rounded-lg ">
          <p>&copy; 2025 soloSoftwareDev</p>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
