import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setPickLists,
  setSelectedPickList,
  setSelectedOrder,
  setShowPickListSelector,
  setRemainingQuantities,
  packItem,
  unpackItem,
  setSelectedPackage,
  setPackageDimensions,
  resetPackingState,
} from "../../features/packing/packingSlice";
import useFetchData from "../../components/useFetchData";
import ItemPicture from "../../components/itemPicture";
import SingleOrderPacking from "../../components/singleOrderPacking";
import PickListSelector from "../../components/pickListSelector";

const PackingPage = () => {
  const dispatch = useDispatch();

  // Get all state from Redux
  const {
    pickLists,
    selectedPickList,
    selectedOrder,
    showPickListSelector,
    remainingQuantities,
    packedItems,
    selectedPackage,
    packageDimensions,
    loading: packingLoading,
    error: packingError,
  } = useSelector((state) => state.packing);

  const {
    data,
    loading: fetchLoading,
    error: fetchError,
  } = useFetchData("picked_orders_staged_for_packing");

  const loading = fetchLoading || packingLoading;
  const error = fetchError || packingError;

  // Initialize Redux state when data is fetched
  useEffect(() => {
    if (data?.picklists) {
      dispatch(setPickLists(data.picklists));

      // Initialize quantities from all items in all picklists
        if (Object.keys(remainingQuantities).length === 0) {
      const initial = {};
      data.picklists.forEach((pickList) => {
        // pick_list_id, order_numbers, items.sku, items.quantity, items.description
        pickList.items?.forEach((item) => {
          initial[item.id] = item.quantity;
        });
      });
      dispatch(setRemainingQuantities(initial));
    }
  }
  }, [data, dispatch]);

  // Initialize when manual order is selected
  useEffect(() => {
    if (selectedOrder && selectedOrder.items) {
      const initial = {};
      selectedOrder.items.forEach((item) => {
         if (remainingQuantities[item.id] === undefined) {
        initial[item.id] = item.quantity;
    }});
    if (Object.keys(initial).length > 0) {
      dispatch(setRemainingQuantities({...remainingQuantities, ...initial}));
    }
    }
  }, [selectedOrder?.order_number, dispatch]);


  //Redux action handlers
  const handlePickListSelect = (pickList) => {
    dispatch(setSelectedPickList(pickList));
  };
  const handleOrderSelect = (orderData) => {
    dispatch(setSelectedOrder(orderData));
  };

  // Reset everything to start screen
  const handleResetToStart = () => {
    dispatch(resetPackingState());
  };

  // Go back one step
  const handleGoBack = () => {
    if (selectedOrder) {
      dispatch(setSelectedOrder(null));
      if (!selectedPickList) {
        dispatch(setShowPickListSelector(false));
      }
    } else if (selectedPickList) {
      dispatch(setSelectedPickList(null));
      dispatch(setShowPickListSelector(true));
    } else if (showPickListSelector) {
      dispatch(setShowPickListSelector(false));
    }
  };

  const handleEditAddress = () => {
    //insert address validation and automatic update w/ a note of change
  };

  const handleEditCarrier = () => {};

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory.</div>;

  return (
    <div>
      {/* Header - only show when not in pick list selector */}
      {!showPickListSelector && !selectedOrder && (
        <div className="flex items-center text-xl mt-4 justify-center">
          <p className="text-xl text-white font-semibold bg-[rgba(0,0,0,0.38)]">
            Select Pick List To Pack
          </p>
          <button
            type="button"
            onClick={() => dispatch(setShowPickListSelector(true))}
            className="ml-2"
          >
            Click Here
          </button>
        </div>
      )}
      <div className="flex flex-col font-medium">
        {/* Step 1: Select Pick List */}
        {showPickListSelector && !selectedPickList && (
          <PickListSelector
            pickLists={pickLists}
            selectedPickList={selectedPickList}
            onSelectPickList={handlePickListSelect}
            onClose={() => dispatch(setShowPickListSelector(false))}
          />
        )}

        {/* Step 2: Select Order from Pick List */}
        {selectedPickList && !selectedOrder && (
          <div className="m-4 p-4 border rounded-lg bg-[rgba(0,0,0,0.38)] text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                Pick List #{selectedPickList.pick_list_id} - Select Order to
                Pack:
              </h2>
              <button onClick={handleGoBack}>← Back to Pick Lists</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedPickList.order_numbers.map((orderNum) => {
                const fullOrderData = selectedPickList.orders?.find(
                  (order) => order.order_number === orderNum
                );
                // Debug each order's items
                const orderItems = selectedPickList.items.filter((item) =>
                  item.order_numbers?.includes(orderNum)
                );

                return (
                  <div
                    key={orderNum}
                    className="p-3 border rounded-lg cursor-pointer hover:border-gray-300"
                    onClick={() => {
                      // Create order object for selected order
                      const orderData = {
                        ...fullOrderData,
                        items: orderItems,
                      };
                      handleOrderSelect(orderData);
                    }}
                  >
                    <h3 className="font-semibold">Order #{orderNum}</h3>
                    <p className="text-sm">
                      Items:
                      {orderItems.length}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {!selectedPickList && !selectedOrder && !showPickListSelector && (
          <SingleOrderPacking
            selectedOrder={selectedOrder}
            setSelectedOrder={(order) => dispatch(setSelectedOrder(order))}
          />
        )}
        {/* Step 4: Packing interface */}
        {selectedOrder && (
          <>
            {/* Breadcrumb navigation */}
            <div className="m-4 p-2 border rounded-lg bg-[rgba(0,0,0,0.38)] text-white">
              <div className="flex items-center space-x-2">
                {selectedPickList ? (
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center space-x-2">
                      <button onClick={handleResetToStart}>Pick Lists</button>
                      <span>→</span>
                      <button onClick={handleGoBack}>
                        Pick List #{selectedPickList.pick_list_id}
                      </button>
                      <span>→</span>
                      <span>Order #{selectedOrder.order_number}</span>
                    </div>
                    <button onClick={handleResetToStart}>ⓧ Close</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <span>
                      Order #{selectedOrder.order_number} (Manual Entry)
                    </span>
                    <button onClick={handleResetToStart}>ⓧ Close</button>
                  </div>
                )}
              </div>
            </div>
            {/* Main packing interface */}
            <div>
              <div className="flex justify-evenly m-4 gap-x-4">
                {/* Order items column */}
                <div className="flex-1 mt-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold">
                  <h2 className="border-y rounded-lg text-lg font-bold m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg items-center">
                    Order # {selectedOrder.order_number}
                  </h2>
                  <ul className="flex flex-col items-center">
                    {selectedOrder.items?.map((item) => {
                      const remainingQty = remainingQuantities[item.id] || 0;

                      //Only show items that still have a remaining quantity
                      return remainingQty > 0 ? (
                        <li
                          key={item.id}
                          className="flex border-y rounded-lg m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white w-fit text-lg text-shadow-lg font-semibold items-center"
                        >
                          <ItemPicture
                            sku={item.sku}
                            description={item.description}
                          />
                          Sku: {item.sku} | Item: {item.description} | Quantity:{" "}
                          {remainingQty}
                          <button
                            className="ml-3"
                            onClick={() =>
                              dispatch(
                                packItem({
                                  id: item.id,
                                  sku: item.sku,
                                  description: item.description,
                                })
                              )
                            }
                            disabled={remainingQty === 0}
                          >
                            pack
                          </button>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>

                {/* Customer info column */}
                <div className="flex-1 mt-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold">
                  <div>
                    <h2 className="border-y rounded-lg text-lg font-bold m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg items-center">
                      Address And Carrier Verification:
                    </h2>
                    {selectedOrder ? (
                      <div className="p-4 border-y rounded-lg text-lg font-bold m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg flex flex-col space-y-2">
                        <div className="flex flex-col justify-between items-center">
                          <span>{selectedOrder.customer_name}</span>
                        </div>
                        <div className="flex flex-col justify-between items-center">
                          <span>
                            {selectedOrder.address_line1}
                            {selectedOrder.address_line2}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span>
                            {selectedOrder.city}, {selectedOrder.state}{" "}
                            {selectedOrder.zip}
                          </span>
                          <div>
                            <button
                              className="m-4 text-white"
                              onClick={handleEditAddress}
                            >
                              Address Edit
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-around items-center">
                          <span>
                            {selectedOrder.carrier} :{" "}
                            {selectedOrder.carrier_speed}
                          </span>
                          <span>Paid ${selectedOrder.shipping_paid}</span>
                          <button
                            className="ml-2 text-white"
                            onClick={handleEditCarrier}
                          >
                            Carrier Edit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>"No customer info found"</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Packing Screen */}
              <div className="m-4 mt-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold items-center">
                <div className="w-full">
                  <div className="flex  items-center justify-center">
                    <p>Package 1 of 1</p>
                    <button className="text-xs ml-2">Add Package</button>
                  </div>
                  <div className="m-2">
                    <label>Box Selection:</label>
                    <select
                      type="dropdown"
                      value={selectedPackage}
                      onChange={(e) =>
                        dispatch(setSelectedPackage(e.target.value))
                      }
                    >
                      <option value="">Choose one or enter manually</option>
                      <option value="6x6x6">6 Cube</option>
                      <option value="8x8x8">8 Cube</option>
                      <option value="10x10x10">10 Cube</option>
                      <option value="12x12x12">12 Cube</option>
                      <option value="14x14x14">14 Cube</option>
                    </select>
                  </div>
                  <div className="m-2">
                    <label>Weight: </label>
                    <input
                      type="number"
                      value={packageDimensions.weight}
                      onChange={(e) =>
                        dispatch(
                          setPackageDimensions({ weight: e.target.value })
                        )
                      }
                      className="border rounded-lg text-center w-20 h-10"
                    ></input>{" "}
                    <label className="ml-2">Length: </label>
                    <input
                      type="number"
                      value={packageDimensions.length}
                      onChange={(e) =>
                        dispatch(
                          setPackageDimensions({ length: e.target.value })
                        )
                      }
                      className="border rounded-lg text-center w-20 h-10"
                    ></input>
                    <label className="ml-2">Width: </label>
                    <input
                      type="number"
                      value={packageDimensions.width}
                      onChange={(e) =>
                        dispatch(
                          setPackageDimensions({ width: e.target.value })
                        )
                      }
                      className="border rounded-lg text-center w-20 h-10"
                    ></input>
                    <label className="ml-2">Height: </label>
                    <input
                      type="number"
                      value={packageDimensions.height}
                      onChange={(e) =>
                        dispatch(
                          setPackageDimensions({ height: e.target.value })
                        )
                      }
                      className="border rounded-lg text-center w-20 h-10"
                    ></input>
                  </div>
                  <p>
                    Packed Items:{" "}
                    {packedItems.reduce(
                      (total, item) => total + item.quantity,
                      0
                    )}
                  </p>
                  {/* Display packed items */}
                  {packedItems.map((item, index) => (
                    <div key={index} className="text-sm">
                      {item.sku} - {item.description} | Packed Qty:{" "}
                      {item.quantity}
                      <button
                        className="ml-3"
                        onClick={() => dispatch(unpackItem(item.id))}
                      >
                        unpack
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-col items-end">
                    <select type="dropdown">
                      <option>Print Invoices</option>
                      <option>Print Labels</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PackingPage;
