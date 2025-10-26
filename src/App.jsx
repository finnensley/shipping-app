import React from "react";
import { useSelector, useDispatch } from "react-redux";
import "./App.css";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      {/* bg-[url('assets/pexels-david-bartus-43782-2290438.jpg')], bg-black, bg-[rgba(0,0,0,0.38)] */}
      {/* <div className="font-bold border-x rounded-lg bg-green-500/20 bg-cover w-full bg-gradient-to-r from-black/90 via-black/60 to-transparent"> */}
      <div
        className="font-bold w-full min-h-screen bg-cover bg-gradient-to-r from-black/80 via-black/60 to-transparent shadow-2xl rounded-xl border border-white/30 bg-white/10">
        <div className="flex flex-col justify-center font-medium rounded-lg  ">
          <h1 className="text-white ">
            <Header />
          </h1>
        </div>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/orders" element={<OrdersPage />}>
            <Route path=":orderNumber" element={<OrderDetailsPage />} />
          </Route>
          <Route path="/picking" element={<PickingPage />} />
          <Route path="/packing" element={<PackingPage />} />
          <Route path="/store" element={<StoreFrontPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
        <div className="flex text-sm items-center justify-center font-semibold text-white bottom-0 p-2 bg-[rgba(13, 110, 8, 0.38)] rounded-lg ">
          <p>&copy; 2025 soloSoftwareDev</p>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
