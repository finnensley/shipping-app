import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPickLists } from "../../features/packing/packingSlice";
import useFetchData from "../../components/useFetchData";
import ItemPicture from "../../components/itemPicture";
import axios from "axios";
import SingleOrderPacking from "../../components/singleOrderPacking";

// from the staging table, pull a pickinglist ID - separated by orders - "picked_orders_staged_for_packing" table
// choose order to pack, order status changes to packing, then to shipped
// test with pick_list_id: 10119

const PackingPage = () => {
  const [orderToPack, setOrderToPack] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { data, loading, error } = useFetchData(
    "picked_orders_staged_for_packing"
  );
  const dispatch = useDispatch();
  const pickLists = useSelector((state) => state.pickLists);
  const [quantities, setQuantities] = useState({});

  // initialize or update pickLists
  useEffect(() => {
    if (pickLists) {
      const initial = {};
      pickLists.forEach((pickList) => {
        // pick_list_id, order_numbers, items.sku, items.quantity, items.description
        pickList.order_numbers.forEach((item) => {
          initial[item.id] = item.quantity;
        });
      });
      setQuantities(initial);
    }
  }, [pickLists]);

  //updates Redux when new API data is loaded
  useEffect(() => {
    if (data && data.items) {
      dispatch(setPickLists(data.picklists));
    }
  }, [data, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory.</div>;

  return (
    <div>
      <div className="flex flex-col font-medium">
        <SingleOrderPacking
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
        />
        {selectedOrder ? (
          <div>
            <div className="flex justify-evenly m-4 gap-x-4">
              <div className="flex-1 mt-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold">
                <h2 className="border-y rounded-lg text-lg font-bold m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg items-center">
                  Order # {selectedOrder.order_number}
                </h2>
                <ul>
                  {selectedOrder.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex border-y rounded-lg m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white w-fit text-lg text-shadow-lg font-semibold items-center"
                    >
                      <ItemPicture
                        sku={item.sku}
                        description={item.description}
                      />
                      Sku: {item.sku} | Item: {item.description} | Quantity:{" "}
                      {item.quantity}
                      <button
                        aria-label="add item"
                        className="ml-3"
                        onClick={() => dispatch(addItem())}
                      >
                        +
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 mt-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold">
                Address and Carriers Screen:
              </div>
            </div>
            <div className="m-4 mt-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold items-center">
              <div className="inline-block w-fit">
                Packing Screen
                <p>OnClick: Items appear here</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="m-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold">
              Address and Carriers Screen
            </div>
            <div className="mb-4 p-4 border rounded-lg m-4 border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold items-center">
              <div className="inline-block w-fit">
                Packing Screen
                <p>OnClick: Items appear here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackingPage;
