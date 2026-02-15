import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setOrder, updateItemQuantity } from "../../features/orders/orderSlice";
import useFetchData from "../../components/useFetchData";
import useUpdateOrderData from "./components/useUpdateOrderData";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import OrderEditModal from "./orderEditModal";
import API_URL from "../../utils/api";

const OrdersPage = () => {
  const { data, loading, error } = useFetchData("orders_with_items");
  const orders = useSelector((state) => state.order);
  const dispatch = useDispatch();
  const { updateData } = useUpdateOrderData();
  const [quantities, setQuantities] = useState({});
  // const { orderNumber } = useParams();
  const [showOrderEdit, setShowOrderEdit] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    const response = await fetch(`${API_URL}/api/orders_with_items`);
    const data = await response.json();
    dispatch(setOrder(data.orders));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="w-full max-w-3xl mx-auto mt-8">
        <div className="grid grid-cols-7 gap-6 border-b-4 rounded-t-lg px-4 py-2 text-white font-bold text-lg sticky top-0 z-10">
          <div>EDIT</div>
          <div>ORDER #</div>
          <div>SKU</div>
          <div>ITEM</div>
          <div>QUANTITY</div>
          <div>SAVE</div>
          <div>UNDO</div>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          <ul>
            {orders.map((order) => (
              <li
                key={order.order_number}
                className="border-b border-gray-700 px-4 py-2 text-white"
              >
                <div className="grid grid-cols-7 gap-6 items-center">
                  {/* View/Edit */}
                  <div>
                    <button
                      className="text-blue-400 underline"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderEdit(true);
                      }}
                    >
                      VIEW/EDIT
                    </button>
                  </div>
                  {/* Order Number */}
                  <div>
                    <strong>{order.order_number}</strong>
                  </div>
                  {/* SKU(s) */}
                  <div>
                    <div className="flex flex-col gap-2">
                      {order.items.map((item) => (
                        <span key={item.id}>{item.sku}</span>
                      ))}
                    </div>
                  </div>
                  {/* Item(s) */}
                  <div>
                    <div className="flex flex-col gap-2">
                      {order.items.map((item) => (
                        <span key={item.id}>{item.description}</span>
                      ))}
                    </div>
                  </div>
                  {/* Quantity(s) */}
                  <div>
                    <div className="flex flex-col gap-2 items-center">
                      {order.items.map((item) => (
                        <input
                          key={item.id}
                          type="number"
                          className="text-center bg-[rgba(0,0,0,0.38)]"
                          value={quantities[item.id] ?? item.quantity}
                          min={0}
                          onChange={(e) => {
                            setQuantities((q) => ({
                              ...q,
                              [item.id]: Number(e.target.value),
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Save */}
                  <div>
                    <div className="flex flex-col items-center gap-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-2">
                          <button
                            className="bg-green-900"
                            onClick={async () => {
                              dispatch(
                                updateItemQuantity({
                                  orderId: order.order_id || order.id,
                                  itemId: item.id,
                                  delta:
                                    (quantities[item.id] ?? item.quantity) -
                                    item.quantity,
                                }),
                              );
                              await updateData(
                                item.id,
                                order.order_id || order.id,
                                item.item_id,
                                quantities[item.id] ?? item.quantity,
                              );
                              await fetchOrders();
                            }}
                          >
                            SAVE
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col gap-2">
                      {order.items.map((item) => (
                        <button
                          key={item.id}
                          className="bg-gray-700"
                          onClick={() => {
                            axios
                              .post(`${API_URL}/order_items/${item.id}/undo`)
                              .then(fetchOrders);
                          }}
                        >
                          UNDO
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {/* </div> */}
          {/* </motion.div> */}
          {/* Animated sidebar for order details, below NavBar and even with orders list */}
          {/* <AnimatePresence>
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
          </AnimatePresence> */}
        </div>
      </div>
      {/* Modal */}
      <AnimatePresence>
        {showOrderEdit && selectedOrder && (
          <OrderEditModal
            order={selectedOrder}
            onClose={() => setShowOrderEdit(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrdersPage;
