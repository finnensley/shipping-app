import React from "react";
import { orders } from "../../data/orders";
import { items } from "../../data/inventory";

const PickingPage = () => {
  //use flatMap to create a single array of all the items
  const pickList = orders.flatMap((order) => order.items);
  // const itemLocation = items.flatMap(item => item.locations.location);

  // const getItemLocation = () => {
  //   const itemLocations = items.filter(items.locations.location)

  return (
    <div>
      <div className="m-4">
        <h1>Picking Page</h1>
      </div>
      {/* Display list of items and locations for one order or a group of orders, order the list by location */}
      {/* Create interactivity -> ability to move items to a staging location*/}
      {/* Add picture that can be touched or selected */}
      <div>
        <label>Choose a location:</label>
        <input
          type="text"
          className="border rounded-lg p-1"
          placeholder="defaults to staged location"
        />
        {/* Picklist has an associated id number */}
        {/* All picklist items go to staged location, packer chooses picklist, orders display  */}
        {/* items.locations.location */}
      </div>
      <ul>
        {pickList.map((item) => (
          <li key={item.id} className="border rounded-lg m-4 p-2">
            Location: | Sku: {item.sku} | Item: {item.description} | Quantity:{" "}
            {item.quantity} | <label>transfer to </label>
            <input type="text" placeholder="new location" className="p-1" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PickingPage;
