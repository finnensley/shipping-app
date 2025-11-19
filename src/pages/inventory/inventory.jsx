import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setInventory,
  updateItemQuantity,
} from "/src/features/inventory/inventorySlice";
import useFetchData from "../../components/useFetchData";
import useUpdateInventoryData from "./components/useUpdateInventoryData";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="w-full max-w-3xl mx-auto mt-8 ">
        <div className="grid grid-cols-7 gap-4 border-b-4 rounded-t-lg px-4 py-2 text-white font-bold text-lg sticky top-0 z-10">
          <div className="text-center">SKU</div>
          <div className="text-center">ITEM</div>
          <div className="text-center">TOTAL</div>
          <div className="text-center">LOC</div>
          <div className="text-center">QUANTITY</div>
          <div className="text-center">SAVE</div>
          <div className="text-center">UNDO</div>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          <ul>
            {inventory.map((item) => (
              <li
                key={item.id}
                className="border-b border-gray-700 px-4 py-2 text-white"
              >
                <div className="grid grid-cols-7 gap-4 items-center">
                  <div>{item.sku}</div>
                  <div>{item.description}</div>
                  <div>{item.total_quantity} </div>
                  {/* LOCATIONS column */}
                  <div>
                    <div className="flex flex-col gap-2">
                      {(item.locations || []).map((location) => (
                        <span key={location.id} className="font-semibold">
                          {location.location_number} {location.location_name}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* QUANTITY column */}
                  <div>
                    <div className="flex flex-col items-center gap-2">
                      {(item.locations || []).map((location) => (
                        <input
                          key={location.id}
                          type="number"
                          className="text-center bg-[rgba(0,0,0,0.38)]"
                          value={quantities[location.id] ?? location.quantity} // ?? is nullish coalescing operator. if left side is null or undefined use right side
                          min={0}
                          onChange={(e) => {
                            setQuantities((q) => ({
                              ...q, // spread operator allows update only to the current location
                              [location.id]: Number(e.target.value),
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Save column */}
                  <div>
                    <div className="flex flex-col items-center gap-2">
                      {(item.locations || []).map((location) => (
                        <button
                          key={location.id}
                          className="bg-green-900"
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
                          SAVE
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Undo column */}
                  <div>
                    <div className="flex flex-col items-center gap-2">
                      {(item.locations || []).map((location) => (
                        <button
                          key={location.id}
                          onClick={async () => {
                            await axios.post(
                              `http://localhost:3000/item_locations/${location.id}/undo`
                            );

                            const response = await fetch(
                              "http://localhost:3000/items"
                            );
                            const data = await response.json();
                            dispatch(setInventory(data.items));
                          }}
                        >
                          UNDO
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default InventoryPage;
