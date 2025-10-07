import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setInventory,
  updateItemQuantity,
} from "/src/features/inventory/inventorySlice";
import useFetchData from "../../components/useFetchData";
import useUpdateInventoryData from "../../components/useUpdateInventoryData";

const InventoryPage = () => {
  const inventory = useSelector((state) => state.inventory);
  const dispatch = useDispatch();
  const { data, loading, error } = useFetchData("items");
  const { updateData } = useUpdateInventoryData();
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (inventory) {
      const initial = {};
      inventory.forEach((item) => {
        (item.locations || []).forEach((locations) => {
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
    <div className="m-5">
      <div className="flex justify-center my-4">
        <h1 className="inline-block text-xl rounded-lg text-shadow-lg font-medium">
          Inventory
        </h1>
      </div>
      <div className="flex">
        <ul>
          {inventory.map((item) => (
            <li
              key={item.id}
              className="flex border-y rounded-lg m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white w-fit text-lg text-shadow-lg font-semibold items-center"
            >
              SKU: {item.sku} | Item: {item.description} | Total OH:{" "}
              {item.total_quantity} |
              <ul>
                {(item.locations || []).map((location) => (
                  <li key={location.id} className="flex ml-1 items-center">
                    Location: {location.location_number}{" "}
                    {location.location_name} | Quantity:{" "}
                    <input
                      type="text"
                      className="ml-1 w-16 text-center text-white bg-[rgba(0,0,0,0.38)]"
                      value={quantities[location.id] ?? location.quantity}
                      min={0}
                      onChange={(e) => {
                        setQuantities((q) => ({
                          ...q,
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
                            delta: newQuantity - location.quantity,
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
                      aria-label="Increment value"
                      className="ml-2"
                      onClick={() => {
                        dispatch(
                          updateItemQuantity({
                            itemId: item.id,
                            locationId: location.id,
                            delta: 1,
                          })
                        );
                        updateData(
                          location.id,
                          location.quantity + 1,
                          item.id,
                          location.location_id
                        );
                      }}
                    >
                      +
                    </button>
                    <button
                      aria-label="Decrement value"
                      className="ml-2"
                      onClick={() => {
                        dispatch(
                          updateItemQuantity({
                            itemId: item.id,
                            locationId: location.id,
                            delta: -1,
                          })
                        );
                        updateData(
                          location.id,
                          location.quantity - 1,
                          item.id,
                          location.location_id
                        );
                      }}
                    >
                      -
                    </button>
                    <button
                      className="ml-2"
                      onClick={async () => {
                        await axios.post(`http://localhost:3000/item_locations/${location.id}/undo`);
                        window.location.reload();
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
  );
};

export default InventoryPage;
