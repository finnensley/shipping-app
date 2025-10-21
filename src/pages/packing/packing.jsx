import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPickLists, addItem } from "../../features/packing/packingSlice";
import useFetchData from "../../components/useFetchData";
import ItemPicture from "../../components/itemPicture";
import axios from "axios";
import SingleOrderPacking from "../../components/singleOrderPacking";
// import useCustomerInfo from "../../components/useCustomerInfo";
import PickListSelector from "../../components/pickListSelector";

// from the staging table, pull a pickinglist ID - separated by orders - "picked_orders_staged_for_packing" table
// choose order to pack, order status changes to packing, then to shipped
// test with pick_list_id: 10119

const PackingPage = () => {
  const [orderToPack, setOrderToPack] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPickList, setSelectedPickList] = useState(null);
  const { data, loading, error } = useFetchData(
    "picked_orders_staged_for_packing"
  );
  const dispatch = useDispatch();
  const pickLists = useSelector((state) => state.packing.pickLists);
  const [quantities, setQuantities] = useState({});
  // const { customerInfo, loading: customerLoading } = useCustomerInfo(
  //   selectedOrder?.order_number
  // );
  const customerInfo = selectedOrder;

  // initialize and update staged pickLists
  useEffect(() => {
    console.log("Data received:", data); //debug log
    if (data?.picklists) {
      console.log("Picklists:", data.picklists); //debug log
      dispatch(setPickLists(data.picklists));

      // initialize quantities from all items in all picklists
      const initial = {};
      data.picklists.forEach((pickList) => {
        // pick_list_id, order_numbers, items.sku, items.quantity, items.description
        pickList.items?.forEach((item) => {
          initial[item.id] = item.quantity;
        });
      });
      setQuantities(initial);
    }
  }, [data, dispatch]);

  const handlePickListSelect = (pickList) => {
    setSelectedPickList(pickList);
    setSelectedOrder(null); // resets selected order when changing picklist
  };

  //Filter orders based on selected picklist
  const availableOrders = selectedPickList
    ? selectedPickList.order_numbers.map((orderNum) => ({
        order_number: orderNum,
        items: selectedPickList.items.filter((item) =>
          item.order_numbers?.includes(orderNum)
        ),
      }))
    : [];

  const handleEditAddress = () => {
    //insert address validation and automatic update w/ a note of change
  };

  const handleEditCarrier = () => {};

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory.</div>;

  return (
    <div>
      <div className="flex flex-col font-medium">
        {/* Step 1: Select Pick List */}
        {!selectedPickList && (
          <PickListSelector
            pickLists={data?.picklists}
            selectedPickList={selectedPickList}
            onSelectPickList={handlePickListSelect}
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
              <button
                className="text-blue-300 hover:text-blue-100"
                onClick={() => setSelectedPickList(null)}
              >
                ← Back to Pick Lists
              </button>
            </div>
            {/* Add debug logging */}
            {console.log("Selected PickList:", selectedPickList)}
            {console.log("Order Numbers:", selectedPickList.order_numbers)}
            {console.log("Items:", selectedPickList.items)}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedPickList.order_numbers.map((orderNum) => {
                const fullOrderData = selectedPickList.orders.find(
                  (order) => order.order_number === orderNum
                );
                // Debug each order's items
                const orderItems = selectedPickList.items.filter((item) =>
                  item.order_numbers?.includes(orderNum)
                );
                console.log(`Order ${orderNum} items:`, orderItems);
                console.log(`Order ${orderNum} full data:`, fullOrderData);

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
                      console.log("Setting selected order:", orderData); // Add this debug log too

                      setSelectedOrder(orderData);
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
        {!selectedPickList && (
          <SingleOrderPacking
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
          />
        )}
        {/* Step 4: Show selected order details and packing interface */}
        {selectedOrder && (
          <>
            {/* Add breadcrumb navigation */}
            <div className="m-4 p-2 border rounded-lg bg-[rgba(0,0,0,0.38)] text-white">
              <div className="flex items-center space-x-2">
                {selectedPickList && (
                  <>
                    <button
                      className="text-blue-300 hover:text-blue-100"
                      onClick={() => {
                        setSelectedOrder(null);
                        setSelectedPickList(null);
                      }}
                    >
                      Pick Lists
                    </button>
                    <span>→</span>
                    <button
                      className="text-blue-300 hover:text-blue-100"
                      onClick={() => setSelectedOrder(null)}
                    >
                      Pick List #{selectedPickList.pick_list_id}
                    </button>
                    <span>→</span>
                    <span>Order #{selectedOrder.order_number}</span>
                  </>
                )}
                {!selectedPickList && (
                  <span>
                    Order #{selectedOrder.order_number} (Manual Entry)
                  </span>
                )}
              </div>
            </div>
            {/* Main packing content - ALWAYS show when order is selected */}
            <div>
              <div className="flex justify-evenly m-4 gap-x-4">
                {/* Order items column */}
                <div className="flex-1 mt-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold">
                  <h2 className="border-y rounded-lg text-lg font-bold m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg items-center">
                    Order # {selectedOrder.order_number}
                  </h2>
                  <ul className="flex flex-col items-center">
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
                          onClick={() =>
                            dispatch(
                              addItem({
                                id: item.id,
                                sku: item.sku,
                                description: item.description,
                                quantity: 1,
                              })
                            )
                          }
                        >
                          pack
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Customer info column */}
                <div className="flex-1 mt-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold">
                  <div>
                    <h2 className="border-y rounded-lg text-lg font-bold m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg items-center">
                      Address And Carrier Verification:
                    </h2>
                    {customerInfo ? (
                      <div className="p-4 border-y rounded-lg text-lg font-bold m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg flex flex-col space-y-2">
                        <div className="flex flex-col justify-between items-center">
                          <span>{customerInfo.customer_name}</span>
                        </div>
                        <div className="flex flex-col justify-between items-center">
                          <span>
                            {customerInfo.address_line1}
                            {customerInfo.address_line2}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span>
                            {customerInfo.city}, {customerInfo.state}{" "}
                            {customerInfo.zip}
                          </span>
                          <div>
                            <button
                              className="m-4 text-white"
                              onClick={() => handleEditAddress()}
                            >
                              Address Edit
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-around items-center">
                          <span>
                            {customerInfo.carrier} :{" "}
                            {customerInfo.carrier_speed}
                          </span>
                          <span>Paid ${customerInfo.shipping_paid}</span>
                          <button
                            className="ml-2 text-white"
                            onClick={() => handleEditCarrier()}
                          >
                            Carrier Edit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>
                        {customerLoading
                          ? "Loading..."
                          : "No customer info found"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Packing Screen */}
              <div className="m-4 mt-4 p-4 border rounded-lg border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold items-center">
                <div className="inline-block w-fit">
                  Packing Screen
                  <p>OnClick: Items appear here</p>
                </div>
              </div>
            </div>
          </>
        )}
        {/* Show default state when no order is selected */}
        {!selectedOrder && (
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
