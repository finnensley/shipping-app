import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setInventory,
  updateItemQuantity,
} from "/src/features/inventory/inventorySlice";
import NavBar from "../../components/navBar";
import useFetchData from "../../components/useFetchData";
import useUpdateInventoryData from "../../components/useUpdateInventoryData";
import axios from "axios";

const InventoryPage = () => {
  const inventory = useSelector((state) => state.inventory);
  const dispatch = useDispatch();
  const { data, loading, error } = useFetchData("items");
  const { updateData } = useUpdateInventoryData();
  const [quantities, setQuantities] = useState({});

  // initializes or updates inventory
  useEffect(() => {
    if (inventory) {
      const initial = {};
      inventory.forEach((item) => {
        (item.locations || []).forEach((location) => {
          initial[location.id] = location.quantity;
        });
      });
      setQuantities(initial);
    }
  }, [inventory]);

  // When API data loads, update Redux state
  useEffect(() => {
    if (data && data.items) {
      dispatch(setInventory(data.items));
    }
  }, [data, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory.</div>;

  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center">
          <ul>
            {inventory.map((item) => (
              <li
                key={item.id}
                className="flex border-y rounded-lg m-4 p-1  text-white w-fit text-shadow-lg font-semibold items-center"
              >
                SKU: {item.sku} | Item: {item.description} | Total OH:{" "}
                {item.total_quantity} |
                <ul>
                  {(item.locations || []).map((location) => (
                    <li key={location.id} className="flex ml-1 items-center">
                      Location: {location.location_number}{" "}
                      {location.location_name} | Quantity:{" "}
                      <input
                        type="number"
                        className="ml-1 w-16 text-center text-white bg-[rgba(0,0,0,0.38)]"
                        value={quantities[location.id] ?? location.quantity} // ?? is nullish coalescing operator. if left side is null or undefined use right side
                        min={0}
                        onChange={(e) => {
                          setQuantities((q) => ({
                            ...q, // spread operator allows update only to the current location
                            [location.id]: Number(e.target.value),
                          }));
                        }}
                      />
                      <button
                        className="ml-2"
                        onClick={async () => {
                          const newQuantity =
                            quantities[location.id] ?? location.quantity;
                          dispatch(
                            updateItemQuantity({
                              itemId: item.id,
                              locationId: location.id,
                              delta: newQuantity - location.quantity, //Redux applies a change(called delta) to the stored value (not a replacement)
                            })
                          );

                          // Update backend
                          await updateData(
                            location.id,
                            newQuantity,
                            item.id,
                            location.location_id
                          );
                        }}
                      >
                        {" "}
                        Save{" "}
                      </button>
                      <button
                        className="m-2"
                        onClick={async () => {
                          await axios.post(
                            `http://localhost:3000/item_locations/${location.id}/undo`
                          );
                          // .then(() => window.location.reload());

                          // Re-fetch inventory data and update Redux state
                          const response = await fetch(
                            "http://localhost:3000/items"
                          );
                          const data = await response.json();
                          dispatch(setInventory(data.items));
                        }}
                      >
                        Undo
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
