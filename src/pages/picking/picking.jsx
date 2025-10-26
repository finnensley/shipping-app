import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addPickList,
  setOrders,
  setItems,
  saveLastPickList,
  clearLastPickList,
} from "../../features/picking/pickingSlice";
import NavBar from "../../components/navBar";
import useFetchData from "@/components/useFetchData";
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
  // Get pickListIds from pickLists, deleted staged
  const pickLists = useSelector((state) => state.picking.pickLists) || [];
  const { lastGeneratedPickList, lastPickListOrders, lastPickListId } =
    useSelector((state) => state.picking);

  // Generate pickListId dynamically - use saved ID if resuming
  const [pickListId, setPickListId] = useState(() => {
    if (lastPickListId) {
      return lastPickListId; // Use saved Id if available
    }
    const stagedPickListIds = pickLists.map((order) => order.pickListId);
    return getUniquePickListId(stagedPickListIds); // argument that passes to the existingIds parameter
  });

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

  const handleCreatePickList = (ordersArray) => {
    //ordersArray is passed from OrderSelector's onCreatePickList
    setSelectedOrders(ordersArray); //updates local state
    const generatedPickList = createPickList(ordersArray);
    setPickListGenerated(true); // shows the pick list UI

    // Add debugging here:
    // console.log('About to save:');
    // console.log('generatedPickList:', generatedPickList);
    // console.log('ordersArray:', ordersArray);
    // console.log('pickListId:', pickListId);

    // Save the pick list for potential resume
    dispatch(
      saveLastPickList({
        pickList: generatedPickList,
        selectedOrders: ordersArray,
        pickListId: pickListId, // Use current ID
      })
    );
  };

  // Handle resuming the last pick list
  const handleResumeLastPickList = () => {
    if (lastGeneratedPickList && lastPickListOrders && lastPickListId) {
      setSelectedOrders(lastPickListOrders);
      setPickListId(lastPickListId); // Set the saved ID
      // The pickList will be recreated by usePickListCreator hook
      setPickListGenerated(true);
    }
  };

  // Handle start fresh
  const handleStartFresh = () => {
    dispatch(clearLastPickList());
    setSelectedOrders([]);
    setPickListGenerated(false);

    // Generate new ID for fresh start
    const stagedPickListIds = pickLists.map((order) => order.pickListId);
    const newPickListId = getUniquePickListId(stagedPickListIds);
    setPickListId(newPickListId);
  };

  // Modified back button
  const handleBack = () => {
    setPickListGenerated(false);
    setSelectedOrders([]);
    // Don't clear the last pick list when going back
  };

  // Handle manual location input
  const handleLocationChange = (sku, value) => {
    // sku = sku of item to override, value = changed pick location
    setLocationOverrides((prev) => ({
      ...prev,
      [sku]: value,
    }));
  };

  // Transfer picklist: deduct inventory and stage picklist
  const handlePickListTransfer = async () => {
    try {
      for (const item of pickList) {
        // Find inventory item and eligible locations
        const inventoryItem = items.find((inv) => inv.sku === item.sku);
        let chosenLocation = null;

        // Manual override
        if (locationOverrides[item.sku] && inventoryItem) {
          const overrideLocation = inventoryItem.location.find(
            (loc) =>
              String(loc.location_number) ===
              String(locationOverrides[item.sku])
          );
          if (overrideLocation) {
            chosenLocation = overrideLocation;
          }
        } else if (inventoryItem) {
          const eligibleLocations = inventoryItem.locations.filter(
            (loc) => loc.quantity >= item.quantity
          );
          // recalculates chosenLocation before transfer and makes changes if no longer enough inventory there, will take inventory from lowest qty site or lowest location number
          // Is this the logic I want to use? It could keep from having inv issues and allow changes during picking (like cyclecounts)
          if (eligibleLocations.length === 1) {
            chosenLocation = eligibleLocations[0];
          } else if (eligibleLocations.length > 1) {
            eligibleLocations.sort((a, b) =>
              a.quantity !== b.quantity
                ? a.quantity - b.quantity
                : a.location - b.location
            );
            chosenLocation = eligibleLocations[0]; // saves the entire location object to use in transfer
          }
        }

        // Deduct inventory from chosen location
        if (chosenLocation) {
          item.chosenLocation = chosenLocation; // Saves the whole object
          await axios.post("/inventory/transfer", {
            itemId: item.item_id,
            quantity: item.quantity,
            location: item.chosenLocation.location_id, // Set by the pickList logic
          });
        } else {
          item.chosenLocation = "N/A";
        }
      }

      // Adds order to staged table and redux store

      const completedPickList = {
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

      await axios.post("/picked_orders_staged_for_packing", completedPickList);

      // Add to Redux
      dispatch(addPickList(completedPickList));

      // Re-fetch inventory
      const inventoryRes = await axios.get("/items");
      dispatch(
        setItems(
          inventoryRes.data.items ? inventoryRes.data.items : inventoryRes.data
        )
      );

      alert("Pick list transferred and inventory updated!");

      // Clear the saved pick lst after successful transfer
      dispatch(clearLastPickList());
      setPickListGenerated(false);
      setSelectedOrders([]);

      // Generate new ID for next pick list
      const stagedPickListIds = [
        ...pickLists.map((order) => order.pickListId),
        pickListId,
      ];
      const newPickListId = getUniquePickListId(stagedPickListIds);
      setPickListId(newPickListId);
    } catch (err) {
      console.error("Transfer error:", err);
      alert("Transfer failed. See console for details.");
    }
  };

  if (error) return <div>Error loading picklist.</div>;
  if (loading) return <div>Loading inventory...</div>;

  console.log("pickListGenerated:", pickListGenerated);
  console.log("pickList:", pickList);
  console.log("items:", items);
  return (
    <div>
      <div className="m-5">
        <div className="flex items-center justify-center">
          {!pickListGenerated && (
            <>
              {/* Show resume option if there is a last generated pick list */}
              {lastGeneratedPickList ? (
                <div className="mb-4 p-3 bg-gray-500 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white text-lg">
                        📋 Pick List #{lastPickListId} with{" "}
                        {lastPickListOrders.length} orders exists:
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleResumeLastPickList}
                        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Resume Pick List
                      </button>
                      <button
                        onClick={handleStartFresh}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Start New
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <OrderSelector
                  orders={orders}
                  onSelect={setSelectedOrders}
                  onCreatePickList={handleCreatePickList}
                />
              )}
            </>
          )}
        </div>
        {/* Add picture that can be touched or selected */}

        {/* Picklist UI */}
        {pickListGenerated && pickList.length > 0 && items.length > 0 && (
          <>
            <button
              className="text-xl mb-4"
              onClick={handleBack}

              // setPickListGenerated(false);
              // setSelectedOrders([]);
            >
              Back
            </button>
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
                      {chosenLocation && typeof chosenLocation === "object"
                        ? chosenLocation.location_number || "N/A"
                        : "N/A"}{" "}
                      | Sku: {item.sku} | Item: {item.description} | Quantity:{" "}
                      {item.quantity} |{" "}
                      <label
                        htmlFor={`locationTransfer-${item.sku}`}
                        className="ml-2"
                      >
                        Picked From Location:{" "}
                      </label>
                      <input
                        id={`locationTransfer-${item.sku}`}
                        type="text"
                        // placeholder={chosenLocation.location_number}
                        placeholder={
                          chosenLocation && typeof chosenLocation === "object"
                            ? chosenLocation.location_number || "N/A"
                            : "N/A"
                        }
                        className="ml-1 w-16 text-center text-white bg-[rgba(0,0,0,0.38)] placeholder-white"
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
    </div>
  );
};

export default PickingPage;
