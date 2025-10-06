import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setOrders,
  updateItemQuantities,
} from "/src/features/orders/ordersSlice";
import useFetchData from "../../components/useFetchData";

const OrdersPage = () => {
  const { data, loading, error } = useFetchData("orders_with_items");
  const orders = data?.orders || [];
  const order = useSelector((state) => state.order);
  const dispatch = useDispatch();

  // When API data loads, update Redux state
  useEffect(() => {
    if (data && data.items) {
      dispatch(setOrders(data.items));
    }
  }, [data, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory.</div>;

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
                  <li key={item.id} className="ml-2 font-semibold">
                    Sku: {item.sku} | Item: {item.description} | Quantity:{" "}
                    {item.quantity} |
                  </li>
                ))}
              </ul>
              <div className="ml-1 flex items-center justify-center">
                <span>Total: ${order.total} | </span>
                <span className="ml-1">Shipping: ${order.shipping_paid}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrdersPage;
