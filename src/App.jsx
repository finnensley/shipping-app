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
      <div>
        <div>
        <h1>Shipping App</h1>
        </div>
        <NavBar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/inventory" element={<InventoryPage />} /> 
        <Route path="/orders" element={<OrdersPage />}  />
        <Route path="/picking" element={<PickingPage />} />
        <Route path="/packing" element={<PackingPage />} />
        <Route path="/storeFront" element={<StoreFrontPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
      </div>
      </BrowserRouter>
  );
}

export default App;
