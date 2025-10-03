import React, { useState } from "react";
import { orders } from "../../data/orders";
import { items } from "../../data/inventory";
import { stagedOrders } from "../../data/staged";
import ItemPicture from "../../components/picture";

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
  const stagedPickListIds = stagedOrders.map((order) => order.pickListId);
  const [pickListId] = useState(() => getUniquePickListId(stagedPickListIds)); // argument that passes to the existingIds parameter
  const [inventory, setInventory] = useState(items);
  const [staged, setStaged] = useState(stagedOrders);
  //use flatMap to create a single array of all the items and the order_numbers
  const itemsList = orders.flatMap((order) =>
    order.items.map((item) => ({ ...item, order_number: order.order_number }))
  );
  // console.log(itemsList); // []

  // groups by id and adds quantities of the same item.id together, Object.values converts object of grouped items into an array of values
  const pickList = Object.values(
    itemsList.reduce((acc, item) => {
      if (acc[item.id]) {
        acc[item.id].quantity += item.quantity;
        //Add order number if not already present
        if (!acc[item.id].order_numbers.includes(item.order_number)) {
          acc[item.id].order_numbers.push(item.order_number);
        }
      } else {
        acc[item.id] = { ...item, order_numbers: [item.order_number] };
      }
      return acc;
    }, {})
  );
  const handlePickListTransfer = () => {
    const updatedInventory = inventory.map((invItem) => {
      //delete quantity of each item from inventory location specified on pickinglist
      pickList.forEach((item) => {
        const inventoryItem = items.find((inv) => inv.id === item.id);
        if (inventoryItem) {
          const locationObj = inventoryItem.locations.find(
            (loc) => loc.location === item.chosenLocation
          );
          if (locationObj) {
            locationObj.quantity = Math.max(
              0,
              locationObj.quantity - item.quantity
            );
          }
        }
      });
      return invItem;
    });
    setInventory(updatedInventory);

    setStaged([
      ...staged,
      {
        pickListId: pickListId,
        order_numbers: pickList.flatMap((item) => item.order_numbers),
        items: pickList.map((item) => ({
          id: item.id,
          sku: item.sku,
          description: item.description,
          quantity: item.quantity,
        })),
      },
    ]);
    alert("Pick list transferred and inventory updated!");
  };

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
        {/* packer chooses picklist, orders display  */}
      </div>
      <ul>
        {pickList.map((item) => {
          // Find the matching inventory item by SKU
          const inventoryItem = items.find((inv) => inv.sku === item.sku);
          
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
                 <ItemPicture sku={item.sku} description={item.description} />
                Order #: {item.order_numbers.join(", ")} | Location:{" "}
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
      <button className="text-xl mb-4" onClick={handlePickListTransfer}>
        Transfer
      </button>
      <div className="flex justify-end">
        <div className="inline-block text-xl bg-[rgba(0,0,0,0.38)] rounded-lg px-1">
          Pick List #: {pickListId}{" "}
        </div>
      </div>
    </div>
  );
};

export default PickingPage;
