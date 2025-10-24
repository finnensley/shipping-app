import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <>
      <div className="flex items-center justify-center">
        <nav className="mt-2 text-xl font-bold">
          <Link to="/dashboard">Dashboard</Link> |{" "}
          <Link to="/inventory">Inventory</Link> |{" "}
          <Link to="/orders">Orders</Link> | <Link to="/picking">Picking</Link>{" "}
          | <Link to="/packing">Packing</Link> | <Link to="/store">Store</Link>{" "}
          | <Link to="/users">Users</Link>
        </nav>
      </div>
    </>
  );
};

export default NavBar;
