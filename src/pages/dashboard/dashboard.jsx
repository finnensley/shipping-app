import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setOrderTotal,
  setOpenOrderCount,
  setLoading,
  setError,
} from "../../features/dashboard/dashboardSlice";
import { fetchOrderTotal } from "../../features/dashboard/dashboardSlice";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const orderTotal = useSelector((state) => state.dashboard.orderTotal);
  const openOrderCount = useSelector((state) => state.dashboard.openOrderCount);
  const error = useSelector((state) => state.dashboard.error);
  console.log("orderTotal:", orderTotal, "error:", error);

  useEffect(() => {
    dispatch(fetchOrderTotal());
  }, [dispatch]);

  return (
    <div>
      <div>
        <div className="flex flex-col ml-2 mr-2 mt-4 p-4 border rounded-lg border-y  text-white text-lg text-shadow-lg font-semibold items-center justify-center">
          <div>Daily Output, with week/month/year toggle: </div>
        </div>
        {/* Ready to Ship & Picked side by side */}
        <div className="flex flex-row justify-evenly ml-2 mr-2 mt-4 p-4 border rounded-lg border-y  text-white text-lg text-shadow-lg font-semibold items-center">
          <div className="flex flex-row gap-4">
            <div className="flex flex-col bg-gray-800/30 shadow-md shadow-white p-4 rounded-lg">
              <h1 className="text-2xl">READY TO SHIP:</h1>
              <p className="ml-2 text-xl"> Orders: {openOrderCount} </p>
              <p className="ml-2 text-xl">Total Revenue: ${orderTotal} </p>
              <p>Number of Orders by Type/Revenue: </p>
            </div>
            <div className="flex flex-col bg-gray-800/30 shadow-md shadow-white p-4 rounded-lg">
              <h1 className="text-2xl">PICKED:</h1>
              <p className="ml-2 text-xl"> Orders: {/*{pickedOrderCount}*/} </p>
              <p className="ml-2 text-xl">
                Total Revenue: {/*${pickedOrderTotal}*/}
              </p>
              <p>Number of Orders by Type/Revenue: </p>
            </div>
          </div>
        </div>
        {/* Shipped below, full width */}
        <div className="flex flex-row justify-evenly ml-2 mr-2 mt-4 p-4 border rounded-lg border-y  text-white text-lg text-shadow-lg font-semibold items-center">
          <div className="flex flex-col bg-gray-800/40 shadow-md shadow-white p-4 rounded-lg">
            <h1 className="text-2xl">SHIPPED:</h1>
            <p className="ml-2 text-xl"> Orders: {/*{shippedOrderCount}*/} </p>
            <p className="ml-2 text-xl">
              Total Revenue: {/*${shippedOrderTotal}*/}
            </p>
            <p>Shipping Revenue vs Shipping Cost</p>
          </div>
        </div>
        {/* Inventory Health & Needs Replenishment side by side */}
        <div className="flex flex-row justify-evenly ml-2 mr-2 mt-4 p-4 border rounded-lg border-y  text-white text-lg text-shadow-lg font-semibold items-center">
          <div className="flex flex-col bg-gray-800/30 shadow-md shadow-white p-4 rounded-lg">
            <h1 className="text-2xl">INVENTORY HEALTH:</h1>
          </div>
          <div className="flex flex-col bg-gray-800/40 shadow-md shadow-white p-4 rounded-lg">
            <h1 className="text-2xl">NEEDS REPLENISHMENT:</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
