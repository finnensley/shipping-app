import React from "react";
import { items } from "../../data/inventory";

const InventoryPage = () => {
  return (
    <div className="m-5">
      <div className="flex justify-center my-4">
      <h1 className="inline-block text-xl rounded-lg text-shadow-lg font-medium">Inventory</h1>
      </div>
      <div className="flex">
        <ul>
          {items.map((item) => (
            <li key={item.id} className="flex border-y rounded-lg m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white w-fit text-lg text-shadow-lg font-semibold items-center">
              SKU: {item.sku} | Item: {item.description} | Total OH:{" "}
              {item.total_quantity} |
              <ul>
                {item.locations.map((location) => (
                  <li key={location.id} className="flex ml-1 items-center">
                    Location: {location.location} | Quantity:{" "}
                    <button className="ml-1">{location.quantity}</button>
                    <button className="ml-1">+</button>
                    <button className="ml-1">-</button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {/* Using divs works but is not semantic, keep ul/li from above */}
        {/* <div>
        {items.map((item) => (
         <div key={item.id} className="border rounded-lg m-4">
          SKU: {item.sku} | Item: {item.description} | Total OH: {item.total_quantity} |
          <div>
            {item.locations.map((location) => (
              <div key={location.id}>
                Location: {location.location} | Quantity: {location.quantity}
              </div> 
        ))}
      </div>
      </div>
        ))}
      </div> */}
      </div>
    </div>
  );
};

export default InventoryPage;
