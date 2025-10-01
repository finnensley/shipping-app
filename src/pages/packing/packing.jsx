import React, { useState } from "react";
import { orders } from "../../data/orders";
import { items } from "../../data/inventory";
import { locations } from "../../data/locations";

// from the staging location, pull a pickinglist - separated by orders
// choose order to pack

const PackingPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleClick = () => {
    const orderToPack = orders.find(
      (order) => order.order_number === Number(inputValue)
    );
    // console.log(orderToPack);
    setSelectedOrder(orderToPack)
  };

  return (
    <div className="m-4">
      <h1>Packing Page</h1>
      <div className="m-4 text-xl">
        <label htmlFor="singleOrderPacking">Order number:</label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          id="singleOrderPacking"
          className="p-1 border ml-2 rounded-lg"
          placeholder="type in an order number"
        ></input>
        <button type="button" onClick={handleClick} className="ml-2">
          Enter
        </button>
      </div>
      {selectedOrder && (
        <div className="mt-4 p-4 border rounded-lg">
          <h2 className="text-lg font-bold">Order # {selectedOrder.order_number}</h2>
          <ul>
            {selectedOrder.items.map(item => (
              <li key={item.id}>
                Sku: {item.sku} | Item: {item.description} | Quantity: {item.quantity}
              </li>
            ))}
          </ul>
          </div>
      )}

    </div>
  );
};

export default PackingPage;
