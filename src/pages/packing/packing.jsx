import React, { useEffect, useState } from "react";
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
  setSelectedCarrier,
} from "../../features/packing/packingSlice";
import useFetchData from "../../components/useFetchData";
import ItemPicture from "../../components/itemPicture";
import SingleOrderPacking from "./components/singleOrderPacking";
import PickListSelector from "./components/pickListSelector";
import { motion, AnimatePresence } from "framer-motion";
import CarrierDropdown from "./components/carrierDropdown";
// import { Link, Outlet } from "react-router-dom";
// import { useParams } from "react-router-dom";
import AddressEditModal from "./AddressEditModal";

const EASYSHIP_API_KEY = import.meta.env.VITE_EASYSHIP_SAND;

const PackingPage = () => {
  const dispatch = useDispatch();
  const [carrierRates, setCarrierRates] = useState([]);
  const [showCarrierDropdown, setShowCarrierDropdown] = useState(false);
  // const { orderNumber } = useParams();
  const [showAddressEdit, setShowAddressEdit] = useState(false);
  const [labelLoading, setLabelLoading] = useState(false);

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
    selectedCarrier,
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
        }
      });
      if (Object.keys(initial).length > 0) {
        dispatch(
          setRemainingQuantities({ ...remainingQuantities, ...initial })
        );
      }
    }
  }, [selectedOrder?.order_number, dispatch]);

  //Redux action handlers
  const handlePickListSelect = (pickList) => {
    dispatch(setSelectedPickList(pickList));
  };
  const handleOrderSelect = (orderData) => {
    dispatch(
      setSelectedOrder({
        ...orderData,
        original_carrier: orderData.carrier,
        original_carrier_speed: orderData.carrier_speed,
      })
    );
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
    setShowAddressEdit(true);
  };

  // Helper function for Easyship payload
  function buildEasyshipPayload({
    selectedOrder,
    packageDimensions,
    packedItems,
    selectedCarrier,
    forShipment = false, // flag to control payload
  }) {
    const courierSettings = {
      show_courier_logo_url: false,
      apply_shipping_rules: true,
    };
    if (forShipment && selectedCarrier?.courier_service?.id) {
      courierSettings.courier_service_id = selectedCarrier.courier_service.id;
      courierSettings.allow_fallback = false;
    }

    return {
      origin_address: {
        country_alpha2: "US",
        state: "CO",
        city: "Denver",
        postal_code: "80202",
        line_1: "123 Warehouse St",
        line_2: null,
        company_name: "soloSoftwareDev",
        contact_name: "Warehouse Manager",
        contact_phone: "555-555-5555",
        contact_email: "warehouse@soloSoftwareDev.com",
      },
      destination_address: {
        country_alpha2: "US",
        state: selectedOrder?.state || "",
        city: selectedOrder?.city || "",
        postal_code: selectedOrder?.zip || "",
        line_1: selectedOrder?.address_line1 || "",
        line_2: selectedOrder?.address_line2 || null,
        company_name: selectedOrder?.company_name || null,
        contact_name: selectedOrder?.customer_name || "",
        contact_phone: selectedOrder?.customer_phone || "",
        contact_email: selectedOrder?.customer_email || "",
      },
      incoterms: "DDU",
      insurance: { is_insured: false },
      courier_settings: courierSettings,
      shipping_settings: { units: { weight: "lb", dimensions: "in" } },
      parcels: [
        {
          total_actual_weight: Number(packageDimensions.weight) || 1,
          box: {
            length: Number(packageDimensions.length) || 1,
            width: Number(packageDimensions.width) || 1,
            height: Number(packageDimensions.height) || 1,
          },
          items: packedItems.map((item) => ({
            quantity: item.quantity,
            description: item.description,
            // Hardcoded for now, fix
            origin_country_alpha2: "US",
            declared_currency: "USD",
            declared_customs_value: Number(item.declared_value) || 1,
            // Hardcoded for now, fix this with find api
            hs_code: "6912.00.21",
            contains_battery_pi966: false,
            contains_battery_pi967: false,
            contains_liquids: false,
          })),
        },
      ],
    };
  }

  const handleEditCarrier = async () => {
    const payload = buildEasyshipPayload({
      selectedOrder,
      packageDimensions,
      packedItems,
      selectedCarrier,
    });

    try {
      console.log("Easyship payload:", JSON.stringify(payload, null, 2));
      const response = await fetch(
        "https://public-api.easyship.com/2024-09/rates",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${EASYSHIP_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Easyship error response:", errorText);
        throw new Error(`Easyship API error: ${response.status}`);
      }
      const data = await response.json();
      // Clean the rates data before setting state
      const cleanRates = (data.rates || []).map((rate, index) => ({
        ...rate,
        id: rate.id || rate.courier_id || rate.rate_id || `rate-${index}`,
        courier_name: rate.courier_service?.umbrella_name || "Unknown Carrier",
        service_level: rate.courier_service?.name || "Unknown Service",
        total_charge: Number(rate.total_charge) || 0,
      }));

      setCarrierRates(cleanRates); // Used cleaned rates instead of data.rates
      setShowCarrierDropdown(true);
      console.log("Carrier rates:", data);
      console.log("Individual rates:", data.rates);
    } catch (err) {
      console.error("Error fetching carrier rates:", err);
    }
  };

  // Getting a 404 error when trying to update backend, may not need this
  // const updateCarrierOnBackend = async (orderNumber, carrierObj) => {
  //   try {
  //     await fetch(`/api/orders/${orderNumber}/carrier`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         carrier: carrierObj.courier_service.umbrella_name,
  //         carrier_speed: carrierObj.courier_service.name,
  //       }),
  //     });
  //   } catch (err) {
  //     console.error("Failed to update carrier on backend:", err);
  //   }
  // };

  const pollForLabel = async (shipmentId, tries = 0) => {
    setLabelLoading(true);
    if (tries > 4) {
      setLabelLoading(false);
      alert("Label not available yet. Please check later.");
      return;
    }
    const response = await fetch(
      `https://public-api.easyship.com/2024-09/shipments/${shipmentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${EASYSHIP_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 429) {
      setLabelLoading(false);
      alert("Too many requests. Please wait a minute and try again.");
      return;
    }
    const data = await response.json();
    const labelURL = data.shipment?.shipping_documents?.[0]?.url;
    if (labelURL) {
      window.open(labelURL, "_blank");
    } else {
      setTimeout(() => pollForLabel(shipmentId, tries + 1), 15000); // Try again in 15 seconds
    }
  };

  const handlePrintLabel = async (carrierObj) => {
    const shipmentPayload = buildEasyshipPayload({
      selectedOrder,
      packageDimensions,
      packedItems,
      selectedCarrier: carrierObj,
      forShipment: true,
    });

    try {
      console.log(
        "Easyship Shipment Payload:",
        JSON.stringify(shipmentPayload, null, 2)
      );
      const response = await fetch(
        "https://public-api.easyship.com/2024-09/shipments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${EASYSHIP_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shipmentPayload),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Easyship error response:", errorText);
        throw new Error(`Easyship API error: ${response.status}`);
      }
      const data = await response.json();

      if (data.shipment?.easyship_shipment_id) {
        pollForLabel(data.shipment.easyship_shipment_id);
      } else {
        alert("Shipment created, but label not available yet.");
      }

      console.log("Easyship shipment response:", data);
    } catch (err) {
      console.error("Error creating shipment:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading page.</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Header - only show when not in pick list selector */}
      {!showPickListSelector && !selectedOrder && (
        <div className="flex items-center mt-4 justify-center">
          <p className="text-xl text-white font-semibold">
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
          <div className="m-4 p-4 border rounded-lg text-white">
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
            setSelectedOrder={(order) =>
              dispatch(
                setSelectedOrder({
                  ...order,
                  original_carrier: order.carrier,
                  original_carrier_speed: order.carrier_speed,
                })
              )
            }
          />
        )}
        {/* Step 4: Packing interface */}
        {selectedOrder && (
          <div>
            {/* Breadcrumb navigation */}
            <div className="m-4 p-2 border rounded-lg text-white">
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
                <div className="flex-1 mt-4 p-4 border rounded-lg border-y  text-white text-lg text-shadow-lg font-semibold">
                  <h2 className="border-y rounded-lg text-lg font-bold m-4 p-1  text-white text-shadow-lg items-center">
                    Order # {selectedOrder.order_number}
                  </h2>
                  <ul className="flex flex-col items-center">
                    {selectedOrder.items?.map((item) => {
                      const remainingQty = remainingQuantities[item.id] || 0;

                      //Only show items that still have a remaining quantity
                      return remainingQty > 0 ? (
                        <li
                          key={item.id}
                          className="flex border-y rounded-lg m-4 p-1  text-white w-fit text-lg text-shadow-lg font-semibold items-center"
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
                <div className="flex-1 mt-4 p-4 border rounded-lg border-y text-white text-lg text-shadow-lg font-semibold">
                  <div>
                    <h2 className="border-y rounded-lg text-lg font-bold m-4 p-1  text-white text-shadow-lg items-center">
                      Address Verification:
                    </h2>
                    {selectedOrder ? (
                      <div className="p-4 border-y rounded-lg text-lg font-bold m-4 text-white text-shadow-lg flex flex-col space-y-2">
                        <div className="flex flex-col justify-between items-center">
                          <span>{selectedOrder.customer_name}</span>
                        </div>
                        <div className="flex flex-col justify-between items-center">
                          <span>
                            {selectedOrder.address_line1} ,{" "}
                            {selectedOrder.address_line2}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span>
                            {selectedOrder.city}, {selectedOrder.state}{" "}
                            {selectedOrder.zip}
                          </span>
                          <div>
                            {/* <Link
                              to={`/packing/orders/${selectedOrder.order_number}/address`}
                            > */}
                            <button
                              className="m-4 text-white"
                              onClick={() => setShowAddressEdit(true)}
                            >
                              Address Edit
                            </button>
                            {/* </Link> */}
                          </div>
                          {/* <AnimatePresence>
                            {selectedOrder && showAddressEdit && (
                              <motion.div
                                initial={{ x: "100%", opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "100%", opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 30,
                                }}
                                className="p-6 border-l bg-[rgba(0,0,0,0.15)] h-full mt-10"
                                style={{ position: "relative" }}
                              >
                                <Outlet />
                              </motion.div>
                            )}
                          </AnimatePresence> */}
                        </div>
                      </div>
                    ) : (
                      <p>"No customer info found"</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Packing Screen */}
              <div className="m-4 mt-4 p-4 border rounded-lg border-y text-white text-lg text-shadow-lg font-semibold items-center">
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
                          setPackageDimensions({
                            weight: Number(e.target.value),
                          })
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
                          setPackageDimensions({
                            length: Number(e.target.value),
                          })
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
                          setPackageDimensions({
                            width: Number(e.target.value),
                          })
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
                          setPackageDimensions({
                            height: Number(e.target.value),
                          })
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
                    <div key={index} className="text-sm m-2">
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

                  <div className="flex flex-col justify-end mt-4 items-end">
                    <div className="flex flex-end">
                      {selectedCarrier ? (
                        <div>
                          Carrier Updated:{" "}
                          {selectedCarrier.courier_service.umbrella_name},{" "}
                          {selectedCarrier.courier_service.name} ($
                          {selectedCarrier.total_charge.toFixed(2)})
                          <button
                            className="ml-2"
                            onClick={() => {
                              dispatch(setSelectedCarrier(null));
                              dispatch(
                                setSelectedOrder({
                                  ...selectedOrder,
                                  carrier: selectedOrder.original_carrier,
                                  carrier_speed:
                                    selectedOrder.original_carrier_speed,
                                })
                              );
                            }}
                          >
                            Undo
                          </button>
                        </div>
                      ) : (
                        ""
                        // `${selectedOrder.carrier}, ${selectedOrder.carrier_speed}`
                      )}
                    </div>
                    <div className="ml-2">
                      Customer Selected: {selectedOrder.original_carrier},{" "}
                      {selectedOrder.original_carrier_speed} ($
                      {selectedOrder.shipping_paid})
                    </div>
                    <button
                      className="ml-2 text-white"
                      onClick={handleEditCarrier}
                    >
                      Carrier Edit
                    </button>
                  </div>
                  {/*Carrier dropdown*/}
                  {showCarrierDropdown && (
                    <CarrierDropdown
                      carrierRates={carrierRates}
                      selectedCarrier={selectedCarrier}
                      onSelect={(carrierRate) => {
                        console.log("Selected carrier rate:", carrierRate);
                        // Update Redux state
                        dispatch(setSelectedCarrier(carrierRate));

                        if (carrierRate && selectedOrder) {
                          // Add in to update backend if decide necessary, was getting 404 error
                          // updateCarrierOnBackend(
                          //   selectedOrder.order_number,
                          //   carrierRate
                          // ).then(() => {

                          // Update Redux order object
                          dispatch(
                            setSelectedOrder({
                              ...selectedOrder,
                              carrier:
                                carrierRate.courier_service.umbrella_name,
                              carrier_speed: carrierRate.courier_service.name,
                            })
                          );
                        }

                        // Close the dropdown after selection
                        setShowCarrierDropdown(false);
                      }}
                    />
                  )}

                  <div className="flex flex-col items-end mt-2">
                    <select
                      type="dropdown"
                      onChange={(e) => {
                        if (e.target.value === "Print Labels And Invoices") {
                          // Use selectedCarrier if set, otherwise fallback to selectedOrder's carrier info
                          const carrierToUse =
                            selectedCarrier ||
                            (selectedOrder.courier_id &&
                            selectedOrder.courier_service_id
                              ? {
                                  courier_service: {
                                    umbrella_name: selectedOrder.carrier,
                                    name: selectedOrder.carrier_speed,
                                    courier_id: selectedOrder.courier_id,
                                    id: selectedOrder.courier_service_id,
                                  },
                                  total_charge: selectedOrder.shipping_paid,
                                }
                              : null);

                          if (!carrierToUse) {
                            alert(
                              "No valid carrier info available. Please select a carrier."
                            );
                            return;
                          }
                          handlePrintLabel(carrierToUse);
                        }
                        e.target.value = "";
                      }}
                    >
                      <option value="">Select Print Options</option>
                      <option value="Print Labels And Invoices">
                        Print Labels And Invoices
                      </option>
                      <option value="Print Invoices">Print Invoices</option>
                    </select>
                  </div>
                  {labelLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg shadow-lg text-black text-lg font-bold">
                        Generating shipping label, please wait...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modal */}
      <AnimatePresence>
        {showAddressEdit && selectedOrder && (
          <AddressEditModal
            order={selectedOrder}
            onClose={() => setShowAddressEdit(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PackingPage;
