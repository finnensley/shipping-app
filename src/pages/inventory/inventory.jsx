import React, {useEffect} from "react";
import { items } from "../../data/inventory";
import { useSelector, useDispatch } from 'react-redux'
import { setInventory, updateItemQuantity, addItem, removeItem} from '/src/features/inventory/inventorySlice'

const InventoryPage = () => {
  const inventory = useSelector(state => state.inventory);
  const dispatch = useDispatch();

  //Initialize Redux state from static items
  useEffect(() => {
    dispatch(setInventory(items));
  }, [dispatch]);

  return (
    <div className="m-5">
      <div className="flex justify-center my-4">
      <h1 className="inline-block text-xl rounded-lg text-shadow-lg font-medium">Inventory</h1>
      </div>
      <div className="flex">
        <ul>
          {inventory.map((item) => (
            <li key={item.id} className="flex border-y rounded-lg m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white w-fit text-lg text-shadow-lg font-semibold items-center">
              SKU: {item.sku} | Item: {item.description} | Total OH:{" "}
              {item.total_quantity} |
              <ul>
                {item.locations.map((location) => (
                  <li key={location.id} className="flex ml-1 items-center">
                    Location: {location.location} | Quantity:{" "}
                    <button className="ml-1">{location.quantity}</button>
                    <button aria-label="Increment value" className="ml-1" onClick={() => dispatch(addItem())}>+</button>
                    <button aria-label="Decrement value" className="ml-1" onClick={() => dispatch(removeItem())}>-</button>
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
