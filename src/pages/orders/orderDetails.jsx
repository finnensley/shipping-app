import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";



const OrderDetailsPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const orders = useSelector((state) => state.order);
  const order = orders.find(
    (o) => String(o.order_number) === String(orderNumber)
  );

  if (!order) {
    return (
      <div className="flex items-center justify-center m-5">
        <h2>Order not found for #{orderNumber}</h2>
      </div>
    );
  }


  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <h2>Order Details for #{order.order_number}</h2>
        <p>Customer: {order.customer_name}</p>
        <p>Email: {order.customer_email}</p>
        <p>
          Address: {order.address_line1}, {order.city}, {order.state}{" "}
          {order.zip}
        </p>
        <p>
          Carrier: {order.carrier} ({order.carrier_speed})
        </p>
        <p>Total: ${order.total}</p>
        <p>Shipping Paid: ${order.shipping_paid}</p>
        <h3>Items:</h3>
        <ul>
          {order.items.map((item) => (
            <li key={item.id}>
              {item.sku} - {item.description} (Qty: {item.quantity})
            </li>
          ))}
        </ul>
        <button className="m-2" onClick={() => navigate("/orders")}>ⓧ Close</button>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
