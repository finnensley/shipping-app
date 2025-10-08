import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setOrder, updateItemQuantity } from "../../features/orders/orderSlice";
import useFetchData from "../../components/useFetchData";
import useUpdateOrderData from "../../components/useUpdateOrderData";
import axios from "axios";

const OrdersPage = () => {
  const { data, loading, error } = useFetchData("orders_with_items");
  const orders = useSelector((state) => state.order);
  const dispatch = useDispatch();
  const { updateData } = useUpdateOrderData();
  const [quantities, setQuantities] = useState({});

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

  // fetch the latest orders and update Redux, use in onBlur
  const fetchOrders = async () => {
    const response = await fetch("http://localhost:3000/orders_with_items");
    const data = await response.json();
    dispatch(setOrder(data.orders));
  };

  return (
    <div className="m-4 font-medium text-shadow-lg">
      <h1>Orders</h1>
      {/* Display orders in a list */}
      <div>
        <ul>
          {orders.map((order) => (
            <li
              key={order.order_number}
              className="border-y rounded-lg m-4 p-2 flex bg-[rgba(0,0,0,0.38)] text-white w-fit text-xl text-shadow-lg items-center"
            >
              <strong>Order # {order.order_number} |</strong>
              <ul>
                {order.items.map((item) => (
                  // local state for each input

                  <li key={item.id} className="ml-2 font-semibold">
                    Sku: {item.sku} | Item: {item.description} | Total: ${order.total} | Shipping: ${order.shipping_paid} | Quantity:
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
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrdersPage;
