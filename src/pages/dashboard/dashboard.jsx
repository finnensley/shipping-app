import React from "react";

const DashboardPage = () => {
  return (
    <>
      {/* <div className="m-4 font-medium">
        <h1>Dashboard</h1>
        </div> */}
      
      <div className="flex flex-col ml-2 mr-2 mt-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold items-center">
        <div>Daily Output, with week/month/year toggle: </div>
      </div>
        <div className="flex flex-col ml-2 mr-2 mt-4 mb-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold items-center">
          <div>
            Dashboard Charts
            <p>Items appear here at render</p>
            <p>View options</p>
          </div>
        </div>
    </>
  );
};

export default DashboardPage;
