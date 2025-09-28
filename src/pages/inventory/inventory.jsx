import React from "react";
import { items } from "../../data/inventory";

const InventoryPage = () => {
  return (
    <div className="m-4">
      <h1>Inventory Page</h1>
      <div>
        <ul>
          {items.map((item) => (
            <li key={item.id} className="border rounded-lg m-4 p-2">
              SKU: {item.sku} | Item: {item.description} | Total OH:{" "}
              {item.total_quantity} |
              <ul>
                {item.locations.map((location) => (
                  <li key={location.id}>
                    Location: {location.location} | Quantity:{" "}
                    <button>{location.quantity}</button>
                    <button>+</button>
                    <button>-</button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {/* Using divs works but is not semantic, keepy ul/li from above */}
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
