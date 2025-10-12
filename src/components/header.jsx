import React from "react";
import { useLocation } from "react-router-dom";

const Header = () => {
  // the name of the page should display = Dashboard, Picking, Inventory, Orders, Packing etc.
  //use the last of the route with a .toUpperCase()
  const location = useLocation(); // gives access to the location object that contains the url
  const pathNames = location.pathname
    .split("/")
    .filter((segment) => segment != ""); // location.pathname gives the current path, split breaks path into segments, filter removes any space or empty strings

  const pageName =
    pathNames.length > 0
      ? pathNames[pathNames.length - 1][0].toUpperCase() +
        pathNames[pathNames.length - 1].slice(1) // slice(1), takes rest of slice starting at 1
      : "Dashboard"; // gives the pageNames from the end of the path
  console.log(pathNames, pageName);

  return (
    <>
      <div>{pageName}</div>
    </>
  );
};

export default Header;
