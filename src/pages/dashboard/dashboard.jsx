import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setOrderTotal,
  setOpenOrderCount,
  setLoading,
  setError,
} from "../../features/dashboard/dashboardSlice";
import { fetchOrderTotal } from "../../features/dashboard/dashboardSlice";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="flex flex-col items-center justify-center mt-8 p-2 text-xs">
        <h1 className="flex text-3xl font-bold mb-2">TOTAL ORDERS</h1>
        <div className="flex flex-col border-b max-w-3xl bg-gray-800/30 shadow-md shadow-white rounded-lg">
          <div className="grid grid-cols-3 gap-6 border-b-4 rounded-t-lg px-4 py-2 text-white font-bold text-lg">
            <div>CATEGORY</div>
            <div>TOTAL</div>
            <div>REVENUE</div>
          </div>
          <div className="grid grid-cols-3 p-2 border-b gap-6 items-center ">
            <div>READY TO SHIP</div>
            <div>{openOrderCount}</div>
            <div>${orderTotal}</div>
          </div>
          <div className="grid grid-cols-3 p-2 border-b gap-6 items-center">
            <div>PICKED</div>
            <div>{openOrderCount}</div>
            <div>${orderTotal}</div>
          </div>
          <div className="grid grid-cols-3 p-2 border-b gap-6 items-center">
            <div>SHIPPED</div>
            <div>{openOrderCount}</div>
            <div>${orderTotal}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-8 p-2 text-xs">
        <h1 className="flex text-3xl font-bold mb-2">ORDERS BY TYPE</h1>
        <div className="flex flex-col border-b max-w-3xl bg-gray-800/30 shadow-md shadow-white rounded-lg">
          <div className="grid grid-cols-4 gap-6 border-b-4 rounded-t-lg px-4 py-2 text-white font-bold text-lg">
            <div>ORDER TYPE</div>
            <div>READY TO SHIP</div>
            <div>PICKED</div>
            <div>SHIPPED</div>
          </div>
          <div className="grid grid-cols-4 p-2 border-b gap-6 items-center ">
            <div>D2C</div>
            <div>2</div>
            <div>2</div>
            <div>2</div>
          </div>
          <div className="grid grid-cols-4 p-2 border-b gap-6 items-center">
            <div>B2B</div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="grid grid-cols-4 p-2 border-b gap-6 items-center">
            <div>HOSPITALITY</div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-8 p-2 text-xs">
        <h1 className="flex text-3xl font-bold mb-2">ORDERS WITH ISSUES</h1>
        <div className="flex flex-col border-b max-w-3xl bg-gray-800/30 shadow-md shadow-white rounded-lg">
          <div className="grid grid-cols-4 gap-6 border-b-4 rounded-t-lg px-4 py-2 text-white font-bold text-lg">
            <div>ORDER #</div>
            <div>ORDER TYPE</div>
            <div>STATUS </div>
            <div>COMMENTS</div>
          </div>
          <div className="grid grid-cols-4 p-2 border-b gap-6 items-center ">
            <div>#</div>
            <div>D2C</div>
            <div>BACK ORDER</div>
            <div>Receiving 12/12, PO #</div>
          </div>
          <div className="grid grid-cols-4 p-2 border-b gap-6 items-center">
            <div>#</div>
            <div>B2B</div>
            <div>ON HOLD</div>
            <div>CX Update</div>
          </div>
          <div className="grid grid-cols-4 p-2 border-b gap-6 items-center">
            <div>#</div>
            <div>WHOLESALE</div>
            <div>ADDRESS FLAG</div>
            <div>CX Alerted</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-8 p-2 text-xs">
        <h1 className="flex text-3xl font-bold mb-2">INVENTORY HEALTH</h1>
        <div className="flex flex-col border-b max-w-3xl bg-gray-800/30 shadow-md shadow-white rounded-lg">
          <div className="grid grid-cols-3 gap-6 border-b-4 rounded-t-lg px-4 py-2 text-white font-bold text-lg">
            <div>CATEGORY</div>
            <div>TOTAL </div>
            <div>DATE RECEIVING</div>
          </div>
          <div className="grid grid-cols-3 p-2 border-b gap-6 items-center ">
            <div>OUT OF STOCK</div>
            <div>#</div>
            <div>PO Arrival Date</div>
          </div>
          <div className="grid grid-cols-3 p-2 border-b gap-6 items-center">
            <div>LOW STOCK</div>
            <div>#</div>
            <div>PO Arrival Date</div>
          </div>
          <div className="grid grid-cols-3 p-2 border-b gap-6 items-center">
            <div>STAGNANT</div>
            <div>#</div>
            <div></div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-8 p-2 text-xs">
        <h1 className="flex text-3xl font-bold mb-2">REPLENISHMENT</h1>
        <div className="flex flex-col border-b max-w-3xl bg-gray-800/30 shadow-md shadow-white rounded-lg">
          <div className="grid grid-cols-3 gap-6 border-b-4 rounded-t-lg px-4 py-2 text-white font-bold text-lg">
            <div>CATEGORY</div>
            <div>TOTAL </div>
            <div>DATE RECEIVING</div>
          </div>
          <div className="grid grid-cols-3 p-2 border-b gap-6 items-center ">
            <div>OUT OF STOCK</div>
            <div>#</div>
            <div>PO Arrival Date</div>
          </div>
          <div className="grid grid-cols-3 p-2 border-b gap-6 items-center">
            <div>LOW STOCK</div>
            <div>#</div>
            <div>PO Arrival Date</div>
          </div>
          <div className="grid grid-cols-3 p-2 border-b gap-6 items-center">
            <div>EMPTY LOCATIONS</div>
            <div>#</div>
            <div></div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-8 p-2 text-xs">
        <h1 className="flex text-3xl font-bold mb-2">AVERAGE OUTPUT</h1>
        <div className="flex flex-col border-b max-w-3xl bg-gray-800/30 shadow-md shadow-white rounded-lg">
          <div className="grid grid-cols-5 gap-6 border-b-4 rounded-t-lg px-4 py-2 text-white font-bold text-lg">
            <div>CATEGORY</div>
            <div>ORDERS RECEIVED</div>
            <div>SALES REVENUE</div>
            <div>SHIPPED</div>
            <div>SHIPPED REVENUE</div>
          </div>
          <div className="grid grid-cols-5 p-2 border-b gap-6 items-center ">
            <div>DAILY</div>
            <div>#</div>
            <div>$</div>
            <div>#</div>
            <div>$</div>
          </div>
          <div className="grid grid-cols-5 p-2 border-b gap-6 items-center">
            <div>WEEKLY</div>
            <div>#</div>
            <div>$</div>
            <div>#</div>
            <div>$</div>
          </div>
          <div className="grid grid-cols-5 p-2 border-b gap-6 items-center">
            <div>MONTHLY</div>
            <div>#</div>
            <div>$</div>
            <div>#</div>
            <div>$</div>
          </div>
          <div className="grid grid-cols-5 p-2 border-b gap-6 items-center">
            <div>YTD</div>
            <div>#</div>
            <div>$</div>
            <div>#</div>
            <div>$</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
