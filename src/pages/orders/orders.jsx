import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setOrder, updateItemQuantity } from "../../features/orders/orderSlice";
import NavBar from "../../components/navBar";
import useFetchData from "../../components/useFetchData";
import useUpdateOrderData from "../../components/useUpdateOrderData";
import axios from "axios";
import { Link, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";

const OrdersPage = () => {
  const { data, loading, error } = useFetchData("orders_with_items");
  const orders = useSelector((state) => state.order);
  const dispatch = useDispatch();
  const { updateData } = useUpdateOrderData();
  const [quantities, setQuantities] = useState({});
  const { orderNumber } = useParams();

  useEffect(() => {
    if (orders) {
      const initial = {};
      orders.forEach((order) => {
        order.items.forEach((item) => {
          initial[item.id] = item.quantity;
        });
      });
      setQuantities(initial);
    }
  }, [orders]);

  // When API data loads, update Redux state
  useEffect(() => {
    if (data && data.orders) {
      dispatch(setOrder(data.orders));
    }
  }, [data, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory.</div>;

  // fetch the latest orders and update Redux
  const fetchOrders = async () => {
    const response = await fetch("http://localhost:3000/orders_with_items");
    const data = await response.json();
    dispatch(setOrder(data.orders));
  };

  return (
    <div className="flex-1 items-center justify-center min-h-screen">
      {/* <div className="w-2/3 p-6"> */}
      <div
        className={`flex ${!orderNumber ? "justify-center items-center" : ""}`}
      >
        {/* Animate orders list width */}
        {/* Orders list/main content */}
        <motion.div
          className={`p-6 ${!orderNumber ? "mx-auto" : ""}`}
          initial={false}
          animate={{ width: orderNumber ? "66.6667%" : "auto" }} // 2/3 = 66.6667%
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="font-medium text-shadow-lg">
            <ul>
              {orders.map(
                (order) => (
                  console.log(orders),
                  (
                    <li
                      key={order.order_number}
                      className="border-y rounded-lg m-4 p-2 flex  text-white w-fit text-shadow-lg items-center"
                    >
                      <Link
                        to={`/orders/${order.order_number}`}
                        className="mr-2 text-blue-400 underline"
                      >
                        View Details
                      </Link>
                      <strong>Order # {order.order_number} |</strong>
                      <ul>
                        {order.items.map((item) => (
                          // local state for each input

                          <li key={item.id} className="ml-2 font-semibold">
                            Sku: {item.sku} | Item: {item.description} |
                            Quantity:
                            <input
                              type="number"
                              className="ml-1 w-16 text-center text-white bg-[rgba(0,0,0,0.38)]"
                              value={quantities[item.id] ?? item.quantity}
                              min={0}
                              onChange={(e) => {
                                setQuantities((q) => ({
                                  ...q,
                                  [item.id]: Number(e.target.value),
                                }));
                              }}
                            />
                            <button
                              className="ml-2"
                              onClick={async () => {
                                //Update Redux for instant UI feedback
                                dispatch(
                                  updateItemQuantity({
                                    orderId: order.order_id || order.id,
                                    itemId: item.id,
                                    delta:
                                      (quantities[item.id] ?? item.quantity) -
                                      item.quantity,
                                  })
                                );
                                // Update backend

                                await updateData(
                                  item.id,
                                  order.order_id || order.id,
                                  item.item_id,
                                  quantities[item.id] ?? item.quantity
                                );
                                //Re-fetch to sync UI
                                await fetchOrders();
                              }}
                            >
                              Save
                            </button>
                            <button
                              className="ml-2"
                              onClick={() => {
                                axios
                                  .post(
                                    `http://localhost:3000/order_items/${item.id}/undo`
                                  )
                                  // .then(() => window.location.reload());
                                  .then(fetchOrders);
                              }}
                            >
                              Undo
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                )
              )}
            </ul>
          </div>
        </motion.div>
        {/* Animated sidebar for order details, below NavBar and even with orders list */}
        <AnimatePresence>
          {orderNumber && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-1/3 p-6 border-l bg-[rgba(0,0,0,0.15)] h-full mt-10"
              style={{ position: "relative" }}
            >
              <Outlet />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrdersPage;
