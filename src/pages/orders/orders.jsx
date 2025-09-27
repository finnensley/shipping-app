import React from "react";
import { orders } from "../../data/orders";


const OrdersPage = () => {
  return (
    <div className="m-4">
      <h1>Orders Page</h1>
      {/* Display orders in a list */}
      <div>
        <ul>
          {orders.map((order) => (
            <li key={order.order_number} className="border rounded-lg m-4 p-2">
              <strong>Order #{order.order_number}</strong>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
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
