import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addPickList,
  setOrders,
  setItems,
} from "../../features/picking/pickingSlice";
import useFetchData from "../../components/useFetchData";
import ItemPicture from "../../components/picture";
import axios from "axios";

// Helper function for unique pickListId
const generateRandomId = (max = 1000000) => Math.floor(Math.random() * max) + 1;
const getUniquePickListId = (existingIds, max = 1000000) => {
  const id = generateRandomId(max);
  return existingIds.includes[id] ? getUniquePickListId(existingIds, max) : id;
};

const PickingPage = () => {
  const { data, loading, error } = useFetchData("orders_with_items");
  const dispatch = useDispatch();
  const staged = useSelector((state) => state.picking.staged);
  const orders = useSelector((state) => state.picking.orders);
  const items = useSelector((state) => state.picking.items);

  // For unique pickListId
  const stagedPickListIds = staged.map((order) => order.pickListId);
  const [pickListId] = useState(() => getUniquePickListId(stagedPickListIds)); // argument that passes to the existingIds parameter
  const [itemsList, setItemsList] = useState([]);
  const [locationOverrides, setLocationOverrides] = useState({});

  // When API data loads, update Redux state

  useEffect(() => {
    if (data && Array.isArray(data.orders)) {
      data.orders.forEach((order) => {
        console.log("Order:", order.order_number, "Items array:", order.items);
      });
    }
  }, [data]);

  useEffect(() => {
    console.log("Fetched data:", data);
    if (data && Array.isArray(data.orders)) {
      dispatch(setOrders(data.orders));
      dispatch(setItems(data.items ?? []));
    }
  }, [data, dispatch]);

  useEffect(() => {
    console.log("Redux orders after dispatch:", orders);
    console.log("Redux items after dispatch:", items);
  }, [orders, items]);

  // Re-calculate itemsList whenever orders change
  useEffect(() => {
    if (Array.isArray(orders)) {
      //use flatMap to create a single array of all the items and the order_numbers
      const updatedItemsList = orders.flatMap((order) =>
        Array.isArray(order.items)
          ? order.items.map((item) => ({
              ...item,
              order_number: order.order_number,
            }))
          : []
      );
      setItemsList(updatedItemsList);
      console.log("Updated itemsList:", updatedItemsList);
    }
  }, [orders]);

  console.log("orders:", orders);
  console.log("itemsList:", itemsList);

  // groups by id and adds quantities of the same item.id together, Object.values converts object of grouped items into an array of values
  const pickList = Object.values(
    itemsList.reduce((acc, item) => {
      if (acc[item.sku]) {
        acc[item.sku].quantity += item.quantity;
        //Add order number if not already present
        if (!acc[item.sku].order_numbers.includes(item.order_number)) {
          acc[item.sku].order_numbers.push(item.order_number);
        }
      } else {
        acc[item.sku] = { ...item, order_numbers: [item.order_number] };
      }
      return acc;
    }, {})
  );
  console.log(pickList);

  // Handle manual location input
  const handleLocationChange = (sku, value) => {
    setLocationOverrides((prev) => ({
      ...prev,
      [sku]: value,
    }));
  };

  // Transfer picklist: deduct inventory and stage picklist
  const handlePickListTransfer = async () => {
    for (const item of pickList) {
      // Find inventory item and eligible locations
      const inventoryItem = items.find((inv) => inv.sku === item.sku);
      let chosenLocation = null;
      if (locationOverrides[item.id]) {
        chosenLocation = { location: locationOverrides[item.sku] };
      } else if (inventoryItem) {
        const eligibleLocations = inventoryItem.locations.filter(
          (loc) => loc.quantity >= item.quantity
        );
        if (eligibleLocations.length === 1) {
          chosenLocation = eligibleLocations[0];
        } else if (eligibleLocations.length > 1) {
          eligibleLocations.sort((a, b) =>
            a.quantity !== b.quantity
              ? a.quantity - b.quantity
              : a.location - b.location
          );
          chosenLocation = eligibleLocations[0];
        }
      }

      // Deduct inventory from chosen location
      if (chosenLocation) {
        await axios.post("/inventory/transfer", {
          itemId: item.id,
          quantity: item.quantity,
          location: chosenLocation.location,
        });
        item.chosenLocation = chosenLocation.location;
      } else {
        item.chosenLocation = "N/A";
      }
    }

    const newPickList = {
      pickListId,
      order_numbers: pickList.flatMap((item) => item.order_numbers),
      items: pickList.map((item) => ({
        id: item.id,
        sku: item.sku,
        description: item.description,
        quantity: item.quantity,
        chosenLocation: item.chosenLocation,
      })),
      createdAt: new Date().toISOString(),
      status: "staged",
    };

    await axios.post("/picked_orders_staged_for_packing", newPickList);

    // Add to Redux
    dispatch(addPickList(newPickList));

    // Re-fetch inventory
    const inventoryRes = await axios.get("/items");
    dispatch(setItems(inventoryRes.data));

    alert("Pick list transferred and inventory updated!");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading picklist.</div>;

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
          if (locationOverrides[item.id]) {
            chosenLocation = { location: locationOverrides[item.id] };
          } else if (eligibleLocations.length === 1) {
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
            <div className="place-content-center" key={item.sku}>
              <li className="flex border-y text-white font-semibold bg-[rgba(0,0,0,0.38)] rounded-lg m-1 p-1 text-xl place-items-center">
                <ItemPicture sku={item.sku} description={item.description} image_path={item.image_path}/>
                Order #: {item.order_numbers.join(", ")} | Location:{" "}
                {chosenLocation ? chosenLocation.location : "N/A"} | Sku:{" "}
                {item.sku} | Item: {item.description} | Quantity:{" "}
                {item.quantity} |{" "}
                <label htmlFor={`locationTransfer-${item.sku}`} className="ml-2">
                  transfer to{" "}
                </label>
                <input
                  id={`locationTransfer-${item.sku}`}
                  type="text"
                  placeholder=" type new location"
                  className="p-1 ml-2 border rounded-lg placeholder-white"
                  value={locationOverrides[item.sku] || ""}
                  onChange={(e) =>
                    handleLocationChange(item.sku, e.target.value)
                  }
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
