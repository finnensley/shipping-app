import React, { useState } from "react";
import { orders } from "../../data/orders";
import { items } from "../../data/inventory";
import { stagedOrders } from "../../data/staged";

//Helper function for unique pickListId
const generateRandomId = (max = 1000000) => Math.floor(Math.random() * max) + 1;
const getUniquePickListId = (existingIds, max = 1000000) => {
  const id = generateRandomId(max);
  if (existingIds.includes(id)) {
    return getUniquePickListId(existingIds, max);
  } else {
    return id;
  }
};


const PickingPage = () => {
  //use flatMap to create a single array of all the items
  const itemsList = orders.flatMap((order) => order.items);
  console.log(itemsList); // []

  // groups by id and adds quantities of the same item.id together, Object.values converts object of grouped items into an array of values
  const pickList = Object.values(
    itemsList.reduce((acc, item) => {
      if (acc[item.id]) {
        // checks if acc object has the item.id already
        acc[item.id].quantity += item.quantity; // if it does add the current item's quantity to the existing total quantity for that id
      } else {
        acc[item.id] = { ...item }; //if entry doesn't exist, create a new entry and copy all properties from item
      }
      return acc;
    }, {})
  );

  const stagedPickListIds = stagedOrders.map((order) => order.pickListId);
  const [pickListId] = useState(() => getUniquePickListId(stagedPickListIds)); // argument that passes to the existingIds parameter

  return (
    <div className="m-5">
      <div className="flex justify-center my-4">
        <h1 className="inline-block text-xl rounded-lg text-shadow-lg font-medium">
          Picking
        </h1>
      </div>
      {/* Display list of items and locations for one order or a group of orders, order the list by location */}
      {/* Create interactivity -> ability to move items to a staging location*/}
      {/* Add picture that can be touched or selected */}
      <div>
        <label
          htmlFor="allItemsTransfer"
          className="text-xl text-white font-semibold bg-[rgba(0,0,0,0.38)]"
        >
          Choose a transfer location for all items or leave blank:{" "}
        </label>
        <input
          id="allItemsTransfer"
          type="text"
          className="border rounded-lg p-1 text-xl bg-[rgba(0,0,0,0.38)] text-white font-semibold placeholder-white"
          placeholder="defaults to staged location"
        />
        {/* Picklist has an associated id number */}
        {/* All picklist items go to staged location by default, packer chooses picklist, orders display  */}
        {/* items.locations.location doesn't work */}
      </div>
      {/* filter locations for each item quantity, then find the one with the lowest location id */}
      <ul>
        {/* // Original code, without locations logic */}
        {/* {pickList.map((item) => (
          <li key={item.id} className="border rounded-lg m-4 p-2">
            Location: | Sku: {item.sku} | Item: {item.description} | Quantity:{" "}
            {item.quantity} | <label>transfer to </label>
            <input type="text" placeholder="new location" className="p-1" />
          </li>
        ))} */}

        {pickList.map((item) => {
          // Find the matching inventory item by SKU
          const inventoryItem = items.find((inv) => inv.sku === item.sku);
          const picture = (
            <img
              src={inventoryItem ? inventoryItem.picture : ""}
              alt={item.description}
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                marginRight: "1rem",
              }}
            />
          );
          // Filter locations with enough quantity
          const eligibleLocations = inventoryItem
            ? inventoryItem.locations.filter(
                (loc) => loc.quantity >= item.quantity
              )
            : [];

          // Choose location logic
          let chosenLocation = null;
          if (eligibleLocations.length === 1) {
            chosenLocation = eligibleLocations[0];
          } else if (eligibleLocations.length > 1) {
            // Sort by quantity ascending, then by location number ascending
            eligibleLocations.sort((a, b) =>
              a.quantity !== b.quantity
                ? a.quantity - b.quantity
                : a.location - b.location
            );
            chosenLocation = eligibleLocations[0];
          }

          return (
            <div className="place-content-center">
              <li
                key={item.id}
                className="flex border-y text-white font-semibold bg-[rgba(0,0,0,0.38)] rounded-lg m-1 p-1 text-xl place-items-center"
              >
                {picture} Location:{" "}
                {chosenLocation ? chosenLocation.location : "N/A"} | Sku:{" "}
                {item.sku} | Item: {item.description} | Quantity:{" "}
                {item.quantity} |{" "}
                <label htmlFor="locationTransfer" className="ml-2">
                  transfer to{" "}
                </label>
                <input
                  id="locationTransfer"
                  type="text"
                  placeholder=" type new location"
                  className="p-1 ml-2 border rounded-lg placeholder-white"
                />
              </li>
            </div>
          );
        })}
      </ul>
      <button className="text-xl mb-4">Transfer</button>
      <div className="flex justify-end">
        <div className="inline-block text-xl bg-[rgba(0,0,0,0.38)] rounded-lg px-1">
          Pick List #: {pickListId}{" "}
        </div>
      </div>
    </div>
  );
};

export default PickingPage;
