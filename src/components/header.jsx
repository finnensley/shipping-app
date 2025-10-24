import React from "react";
import { useLocation } from "react-router-dom";
import NavBar from "../components/navBar";

const Header = () => {
  // the name of the page should display = Dashboard, Picking, Inventory, Orders, Packing etc.
  //use the last of the route with a .toUpperCase()
  const location = useLocation(); // gives access to the location object that contains the url
  const pathNames = location.pathname
    .split("/")
    .filter((segment) => segment != ""); // location.pathname gives the current path, split breaks path into segments, filter removes any space or empty strings

  let pageName = "";
  if (pathNames.length > 0) {
    if (pathNames[0].toLowerCase() === "orders") {
      pageName = "Orders";
    } else {
      pageName =
        pathNames[pathNames.length - 1][0].toUpperCase() +
        pathNames[pathNames.length - 1].slice(1); // slice(1), takes rest of slice starting at 1
    }
  }

  // gives the pageNames from the end of the path
  // console.log(pathNames, pageName);

  const handleSignOut = () => {}; // or could use state for setSignOut

  return (
    <>
      <div >
        <div className="flex justify-end text-sm">
          <button
            type="button"
            onClick={() => dispatch(setSignOut(true))}
            className="m-2 text-white"
          >
            Sign Out
          </button>
        </div>
        <div>{pageName}</div>
        {/* <NavBar /> */}
      </div>
    </>
  );
};

export default Header;
