 import React from 'react';
 import { Link } from "react-router-dom";

 const NavBar = () => {
   

    return (
        <>
        
        <nav>
          <Link to="/">Dashboard</Link> | {" "}
          <Link to="/inventory">Inventory</Link> | {" "}
          <Link to="/orders">Orders</Link> | {" "}
          <Link to="/picking">Picking</Link> | {" "}
          <Link to="/packing">Packing</Link> | {" "}
          <Link to="/storeFront">Store</Link> | {" "}
          <Link to="users">Users</Link> 
        </nav>
    
        </>
    );
 };

 export default NavBar;
       
       
