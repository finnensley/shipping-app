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
      {/* Ready to Ship & Picked side by side */}
      <div className="flex flex-row justify-evenly ml-2 mr-2 mt-4 p-4 border-x rounded-lg  text-white text-lg text-shadow-lg font-semibold items-center">
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
      <div className="flex flex-row justify-evenly ml-2 mr-2 mt-4 p-4 border-x rounded-lg  text-white text-lg text-shadow-lg font-semibold items-center">
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
      <div className="flex flex-row justify-evenly ml-2 mr-2 mt-4 p-4 border-x rounded-lg text-white text-lg text-shadow-lg font-semibold items-center">
        <div className="flex flex-col bg-gray-800/30 shadow-md shadow-white p-4 rounded-lg">
          <h1 className="text-2xl">INVENTORY HEALTH:</h1>
        </div>
        <div className="flex flex-col bg-gray-800/40 shadow-md shadow-white p-4 rounded-lg">
          <h1 className="text-2xl">NEEDS REPLENISHMENT:</h1>
        </div>
      </div>
      <div className="m-4">
        <h1 className="text-xl">AVERAGE OUTPUT:</h1>
      </div>
      <div className="flex flex-row justify-evenly ml-2 mr-2 mt-4 p-4 rounded-lg border-x  text-white text-lg text-shadow-lg font-semibold items-center">
        <div className="flex flex-col bg-gray-800/40 shadow-md shadow-white p-4 rounded-lg">
          <h1 className="text-2xl">DAILY:</h1>
          <p className="ml-2 text-xl"> Picked: {/*{dailyPicked}*/} </p>
          <p className="ml-2 text-xl">Shipped: {/*${dailyShipped}*/}</p>
        </div>
        <div className="flex flex-col bg-gray-800/40 shadow-md shadow-white p-4 rounded-lg">
          <h1 className="text-2xl">WEEKLY:</h1>
          <p className="ml-2 text-xl"> Picked: {/*{weeklyPicked}*/} </p>
          <p className="ml-2 text-xl">Shipped: {/*${weeklyShipped}*/}</p>
        </div>
        <div className="flex flex-col bg-gray-800/40 shadow-md shadow-white p-4 rounded-lg">
          <h1 className="text-2xl">MONTHLY:</h1>
          <p className="ml-2 text-xl"> Picked: {/*{monthlyPicked}*/} </p>
          <p className="ml-2 text-xl">Shipped: {/*${monthlyShipped}*/}</p>
        </div>
        <div className="flex flex-col bg-gray-800/40 shadow-md shadow-white p-4 rounded-lg">
          <h1 className="text-2xl">YEAR TO DATE:</h1>
          <p className="ml-2 text-xl"> Picked: {/*{yearlyPicked}*/} </p>
          <p className="ml-2 text-xl">Shipped: {/*${yearlyShipped}*/}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
