import React from "react";

const orders = [
  {
    order_number: 100,
    items: [
      {
        id: 1,
        sku: 111111,
        description: "plate",
        quantity: 1,
        subtotal: 40,
        taxes: 3,
        shipping_paid: 10,
      },
    ],
  },

  {
    order_number: 101,
    items: [
      {
        id: 2,
        sku: 222222,
        description: "bowl",
        quantity: 1,
        subtotal: 30,
        taxes: 3,
        shipping_paid: 10,
      },
    ],
  },

  {
    order_number: 102,
    items: [
      {
        id: 3,
        sku: 333333,
        description: "mug",
        quantity: 1,
        subtotal: 20,
        taxes: 3,
        shipping_paid: 10,
      },
      {
        id: 2,
        sku: 222222,
        description: "bowl",
        quantity: 1,
        subtotal: 30,
        taxes: 3,
        shipping_paid: 10,
      },
    ],
  },
];

const OrdersPage = () => {
  return (
    <div className="m-4">
      <h1>Orders Page</h1>
      {/* Display orders in a list */}
      <div>
        <ul>
          {orders.map((order) => (
            <li key={order.order_number} className="border rounded-lg m-4">
              <strong>Order #{order.order_number}</strong>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    Sku: {item.sku} Item: {item.description} Quantity: {item.quantity}
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
