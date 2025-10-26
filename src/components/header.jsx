import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAuthenticated } from "../features/auth/authSlice";

const Header = () => {
  // initializes dispatch
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  // the name of the page should display = Dashboard, Picking, Inventory, Orders, Packing etc.
  //use the last of the route with a .toUpperCase()
  const location = useLocation(); // gives access to the location object that contains the url
  const pathNames = location.pathname
    .split("/")
    .filter((segment) => segment != ""); // location.pathname gives the current path, split breaks path into segments, filter removes any space or empty strings

  //  gives the pageNames from the end of the path
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
  // console.log(pathNames, pageName);

  const handleSignOut = () => {
    dispatch(setAuthenticated(false));
    navigate("/");
  };

  // Hide sign out button on login page
  const showSignOut = isAuthenticated && location.pathname !== "/";

  return (
    <>
      <div>
        <div className="flex justify-end text-sm">
          {showSignOut && (
            <button
              type="button"
              onClick={handleSignOut}
              className="m-2 text-white"
            >
              Sign Out
            </button>
          )}
        </div>
        <div>{pageName}</div>
      </div>
    </>
  );
};

export default Header;
