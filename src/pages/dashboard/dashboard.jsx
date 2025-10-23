import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { isAuthenticated } from "../../features/dashboard/dashboardSlice";
import UserSignIn from "../../components/userSignIn";

const DashboardPage = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <div>
     {!isAuthenticated ? (
      <div>
        <UserSignIn />
      </div>
     ) : (
      <>
      <div className="flex flex-col ml-2 mr-2 mt-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold items-center justify-center">
        <div>Daily Output, with week/month/year toggle: </div>
      </div>
      <div className="flex items-center justify-center ml-2 mr-2 mt-4 mb-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold items-center">
        <div>
          Dashboard Charts
          <p>Items appear here at render</p>
          <p>View options</p>
        </div>
      </div>
      </>
     )}
    </div>
  );
};

export default DashboardPage;
