import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import NavBar from "./components/navBar";
import DashboardPage from "./pages/dashboard/dashboard";
import InventoryPage from "./pages/inventory/inventory";
import OrdersPage from "./pages/orders/orders";
import PickingPage from "./pages/picking/picking";
import PackingPage from "./pages/packing/packing";
import StoreFrontPage from "./pages/storeFront/storeFront";
import UsersPage from "./pages/users/users";

function App() {
  return (
    <BrowserRouter>
      <div className="font-bold border-x rounded-lg bg-[url('assets/pexels-david-bartus-43782-2290438.jpg')] bg-cover inline-block bg-gradient-to-r from-black/90 via-black/60 to-transparent">
        <div className="flex flex-col p-2 bg-[rgba(0,0,0,0.38)] font-medium rounded-lg border-x ">
          <h1 className="text-white pb-2">Shipping App</h1>
        </div>
        <NavBar />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/picking" element={<PickingPage />} />
          <Route path="/packing" element={<PackingPage />} />
          <Route path="/storeFront" element={<StoreFrontPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
        <div className="flex flex-col font-semibold text-white bottom-0 p-2 bg-[rgba(0,0,0,0.38)] rounded-lg border-x">
          <p>&copy; 2025 soloSoftwareDev</p>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
