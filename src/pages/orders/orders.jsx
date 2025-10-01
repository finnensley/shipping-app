import React from "react";
import { orders } from "../../data/orders";


const OrdersPage = () => {
  return (
    <div className="m-4 font-medium text-shadow-lg">
      <h1>Orders</h1>
      {/* Display orders in a list */}
      <div>
        <ul>
          {orders.map((order) => (
            <li key={order.order_number} className="border-y rounded-lg m-4 p-2 flex bg-[rgba(0,0,0,0.38)] text-white w-fit text-xl text-shadow-lg">
              <strong>Order # {order.order_number}</strong>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id} className="ml-2 font-semibold">
                    Sku: {item.sku} | Item: {item.description} | Quantity: {item.quantity} | SubTotal: ${item.subtotal} | Shipping: ${item.shipping_paid}
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
