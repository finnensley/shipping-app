import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addPickList,
  setOrders,
  setItems,
} from "../../features/picking/pickingSlice";
import useFetchData from "../../components/useFetchData";
import ItemPicture from "../../components/itemPicture";
import axios from "axios";
import usePickListCreator from "../../components/usePickListCreator";
import OrderSelector from "../../components/orderSelector";

// Helper function for unique pickListId
const generateRandomId = (max = 1000000) => Math.floor(Math.random() * max) + 1;
const getUniquePickListId = (existingIds, max = 1000000) => {
  const id = generateRandomId(max);
  return existingIds.includes(id) ? getUniquePickListId(existingIds, max) : id;
};

const PickingPage = () => {
  const { data, loading, error } = useFetchData("orders_with_items");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const { pickList, createPickList } = usePickListCreator(selectedOrders);
  const dispatch = useDispatch();
  const staged = useSelector((state) => state.picking.staged) || [];
  const stagedPickListIds = staged.map((order) => order.pickListId);
  const [pickListId] = useState(() => getUniquePickListId(stagedPickListIds)); // argument that passes to the existingIds parameter
  const [pickListGenerated, setPickListGenerated] = useState(false);
  const orders = useSelector((state) => state.picking.orders);
  const items = useSelector((state) => state.picking.items) || [];

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
    if (data && Array.isArray(data.orders)) {
      dispatch(setOrders(data.orders));
      axios.get("http://localhost:3000/items").then((res) => {
        console.log("Fetched inventory:", res.data);

        dispatch(setItems(Array.isArray(res.data.items) ? res.data.items : []));
      });
    }
  }, [data, dispatch]);

  console.log("selectedOrders before creating picklist:", selectedOrders);
  const handleCreatePickList = () => {
    createPickList();
    setPickListGenerated(true);
  };

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
      if (locationOverrides[item.sku]) {
        chosenLocation = { location_number: locationOverrides[item.sku] };
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
          location: chosenLocation.location_number,
        });
        item.chosenLocation = chosenLocation.location_number;
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
    setPickListGenerated(false);
    setSelectedOrders([]);
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
      {!pickListGenerated && (
        <OrderSelector
          orders={orders}
          onSelect={setSelectedOrders}
          onCreatePickList={handleCreatePickList}
        />
      )}
      {/* Display list of items and locations for one order or a group of orders, order the list by location */}
      {/* Create interactivity -> ability to move items to a staging location*/}
      {/* Add picture that can be touched or selected */}
      {pickListGenerated && pickList.length > 0 && items.length > 0 && (
        <>
          <button
            className="text-xl mb-4"
            onClick={() => {
              setPickListGenerated(false);
              setSelectedOrders([]);
            }}
          >
            Back
          </button>
          {/* Picklist UI */}
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
              // console.log("Rendering item:", item);
              // console.log("Inventory item:", inventoryItem);
              // console.log("Eligible locations:", eligibleLocations);
              // console.log("pickList item.sku:", item.sku);
              // console.log(
              //   "inventory skus:",
              //   items.map((inv) => inv.sku)
              // );

              // Choose location logic
              let chosenLocation = null;
              if (locationOverrides[item.sku]) {
                chosenLocation = {
                  location_number: locationOverrides[item.sku],
                };
              } else if (eligibleLocations.length === 1) {
                chosenLocation = eligibleLocations[0];
              } else if (eligibleLocations.length > 1) {
                // Sort by quantity ascending, then by location number ascending
                eligibleLocations.sort((a, b) =>
                  a.quantity !== b.quantity
                    ? a.quantity - b.quantity
                    : a.location_number - b.location_number
                );
                chosenLocation = eligibleLocations[0];
              }

              return (
                <div className="place-content-center" key={item.id}>
                  <li className="flex border-y text-white font-semibold bg-[rgba(0,0,0,0.38)] rounded-lg m-1 p-1 text-xl place-items-center">
                    <ItemPicture
                      sku={item.sku}
                      description={item.description}
                      image_path={item.image_path}
                    />
                    Order #: {item.order_numbers.join(", ")} | Location:{" "}
                    {chosenLocation
                      ? chosenLocation.location_number || "N/A"
                      : "N/A"}{" "}
                    | Sku: {item.sku} | Item: {item.description} | Quantity:{" "}
                    {item.quantity} |{" "}
                    <label
                      htmlFor={`locationTransfer-${item.sku}`}
                      className="ml-2"
                    >
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
        </>
      )}
    </div>
  );
};

export default PickingPage;
