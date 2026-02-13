import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateOrder, fetchOrders } from "../../features/orders/orderSlice";
import { motion } from "framer-motion";
import API_URL from "../../utils/api";

const OrderEditModal = ({ order, onClose }) => {
  const dispatch = useDispatch();
  const [orderEdits, setOrderEdits] = useState(null);
  const [newItem, setNewItem] = useState(null);

  useEffect(() => {
    // Prevents background from scrolling
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (order) {
      setOrderEdits({
        id: order.id,
        order_number: order.order_number,
        subtotal: order.subtotal ?? 0,
        taxes: order.taxes ?? 0,
        total: order.total ?? 0,
        shipping_paid: order.shipping_paid ?? 0,
        address_line1: order.address_line1 ?? "",
        address_line2: order.address_line2 ?? "",
        city: order.city ?? "",
        state: order.state ?? "",
        zip: order.zip ?? "",
        country: order.country ?? "",
        carrier: order.carrier ?? "",
        carrier_speed: order.carrier_speed ?? "",
        customer_id: order.customer_id,
        customer_name: order.customer_name ?? "",
        customer_email: order.customer_email ?? "",
        items: order.items ?? [],
      });
    }
  }, [order]);

  if (!orderEdits) {
    return (
      <div className="flex items-center justify-center m-5">
        <h2>Loading order details...</h2>
      </div>
    );
  }

  const handleShowNewItemInput = () => {
    setNewItem({ sku: "", description: "", quantity: 1 });
  };

  const handleAddingASku = async (sku) => {
    try {
      const response = await axios.get(`${API_URL}/items/by_sku/${sku}`);
      console.log("API RESPONSE:", response.data);
      const { id, description } = response.data;
      setNewItem((item) => ({
        ...item,
        sku,
        description,
        item_id: id,
      }));
    } catch (err) {
      setNewItem((item) => ({
        ...item,
        sku,
        description: "",
        item_id: null,
      }));
    }
  };

  // Handler for confirming add
  const handleAddNewItem = async () => {
    if (!newItem.sku) return;
    if (!newItem.description || !newItem.item_id) {
      await handleAddingASku(newItem.sku);
      // Wait for state update before proceeding
      return;
    }
    setOrderEdits((edits) => ({
      ...edits,
      items: [
        ...edits.items,
        {
          item_id: newItem.item_id,
          sku: newItem.sku,
          description: newItem.description,
          quantity: newItem.quantity,
        },
      ],
    }));
    setNewItem(null);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault(); // prevents form submit if passed

    const orderEditsToSend = {
      ...orderEdits,
      order_number: Number(orderEdits.order_number),
      subtotal: Number(orderEdits.subtotal),
      taxes: Number(orderEdits.taxes),
      total: Number(orderEdits.total),
      shipping_paid: Number(orderEdits.shipping_paid),
      customer_id: Number(orderEdits.customer_id),
      items: orderEdits.items.map((item) => ({
        ...item,
        item_id: Number(item.item_id),
        quantity: Number(item.quantity),
      })),
    };
    console.log(
      "Saving orderEdits:",
      JSON.stringify(orderEditsToSend, null, 2),
    );
    dispatch(updateOrder(orderEditsToSend)); // redux state
    try {
      const response = await fetch(`${API_URL}/orders/${orderEdits.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderEditsToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert("Unable to save edits: " + errorText);
        return;
      }
      if (response.ok) {
        // const data = await response.json();
        // dispatch(updateOrder({ ...data.order, items: data.items }));
        dispatch(fetchOrders()); // re-fetch orders from backend
        alert("Order was updated successfully");
      }
    } catch (err) {
      console.error("Unable to save edits:", err);
      alert("Unable to save edits: " + err.message);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        onClick={onClose} // Close when clicking backdrop
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-black/80 border border-y rounded-xl p-6 max-w-3xl mx-4 relative overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          <button
            className="absolute top-4 right-2 text-gray-300 hover:text-gray-400"
            onClick={onClose}
          >
            ⓧ Close
          </button>

          <h1 className="mt-4 text-3xl font-bold text-white mb-4">
            Edit Address - Order #{order.order_number}
          </h1>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center">
                  <label className="w-40 text-right mr-2 text-white">
                    Customer:
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 flex-1 w-full"
                    placeholder={order.customer_name}
                    value={orderEdits.customer_name ?? ""}
                    onChange={(e) =>
                      setOrderEdits((edits) => ({
                        ...edits,
                        customer_name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center">
                  <label className="w-40 text-right mr-2 text-white">
                    Email:
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 flex-1"
                    placeholder={order.customer_email}
                    value={orderEdits.customer_email ?? ""}
                    onChange={(e) =>
                      setOrderEdits((edits) => ({
                        ...edits,
                        customer_email: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center">
                  <label className="w-40 text-right mr-2 text-white">
                    Address Line 1:
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 flex-1"
                    placeholder={order.address_line1}
                    value={orderEdits.address_line1 ?? ""}
                    onChange={(e) =>
                      setOrderEdits((edits) => ({
                        ...edits,
                        address_line1: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center">
                  <label className="w-40 text-right mr-2 text-white">
                    Address Line 2:
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 flex-1"
                    placeholder={order.address_line2}
                    value={orderEdits.address_line2 ?? ""}
                    onChange={(e) =>
                      setOrderEdits((edits) => ({
                        ...edits,
                        address_line2: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center">
                  <label className="w-40 text-right mr-2 text-white">
                    City:
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 flex-1"
                    placeholder={order.city}
                    value={orderEdits.city ?? ""}
                    onChange={(e) =>
                      setOrderEdits((edits) => ({
                        ...edits,
                        city: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center">
                  <label className="w-40 text-right mr-2 text-white">
                    State:
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 flex-1"
                    placeholder={order.state}
                    value={orderEdits.state ?? ""}
                    onChange={(e) =>
                      setOrderEdits((edits) => ({
                        ...edits,
                        state: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* 2nd column */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center">
                  <label className="w-40 text-right mr-2 text-white">
                    Zip:
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 flex-1"
                    placeholder={order.zip}
                    value={orderEdits.zip ?? ""}
                    onChange={(e) =>
                      setOrderEdits((edits) => ({
                        ...edits,
                        zip: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center">
                  <label className="w-40 text-right mr-2 text-white">
                    Country:
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 flex-1"
                    placeholder={order.country}
                    value={orderEdits.country ?? ""}
                    onChange={(e) =>
                      setOrderEdits((edits) => ({
                        ...edits,
                        country: e.target.value.toUpperCase(), // Always uppercase
                      }))
                    }
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-right mr-2 text-white">
                    Carrier:
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 flex-1"
                    placeholder={order.carrier}
                    value={orderEdits.carrier ?? ""}
                    onChange={(e) =>
                      setOrderEdits((edits) => ({
                        ...edits,
                        carrier: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-right mr-2 text-white">
                    Carrier Speed:
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 flex-1"
                    placeholder={order.carrier_speed}
                    value={orderEdits.carrier_speed ?? ""}
                    onChange={(e) =>
                      setOrderEdits((edits) => ({
                        ...edits,
                        carrier_speed: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-right mr-2 text-white">
                    Total:
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 flex-1"
                    placeholder={order.total}
                    value={orderEdits.total ?? 0}
                    onChange={(e) =>
                      setOrderEdits((edits) => ({
                        ...edits,
                        total: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-right mr-2 text-white">
                    Shipping Paid:
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 flex-1"
                    placeholder={order.shipping_paid}
                    value={orderEdits.shipping_paid ?? 0}
                    onChange={(e) =>
                      setOrderEdits((edits) => ({
                        ...edits,
                        shipping_paid: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* closing div for grid cols-2 */}
              </div>
            </div>

            <div className="mt-6">
              <h3>Items:</h3>
              <ul>
                {orderEdits.items.map((item, idx) => (
                  <li
                    key={item.id ?? item.item_id ?? `${item.sku}-${idx}`}
                    className="flex items-center justify-center gap-2 my-2"
                  >
                    <span>
                      {item.sku} - {item.description}
                    </span>
                    <label>Qty:</label>
                    <input
                      type="number"
                      className="ml-2 border rounded-lg text-center w-16"
                      value={item.quantity ?? 0}
                      min={0}
                      onChange={(e) => {
                        const newItems = [...orderEdits.items];
                        newItems[idx] = {
                          ...item,
                          quantity: Number(e.target.value),
                        };
                        setOrderEdits((edits) => ({
                          ...edits,
                          items: newItems,
                        }));
                      }}
                    />
                    <button
                      className="ml-2 text-red-500"
                      type="button"
                      onClick={() => {
                        setOrderEdits((edits) => ({
                          ...edits,
                          items: edits.items.filter(
                            (itm, i) =>
                              // Remove by id for existing items
                              itm.id !== item.id &&
                              // Remove by item_id and sku for new items (no id)
                              !(
                                itm.item_id === item.item_id &&
                                itm.sku === item.sku &&
                                i === idx
                              ),
                          ),
                        }));
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
              {/* New Item Input */}
              {newItem ? (
                <div className="flex items-center gap-2 my-2">
                  <input
                    className="border rounded-lg text-center w-24"
                    placeholder="SKU"
                    value={newItem.sku}
                    onChange={(e) => {
                      setNewItem((item) => ({
                        ...item,
                        sku: e.target.value,
                      }));
                    }}
                    onBlur={(e) => handleAddingASku(e.target.value)}
                  />
                  <span className="w-40 text-left">{newItem.description}</span>
                  <label>Qty:</label>
                  <input
                    type="number"
                    className="ml-2 border rounded-lg text-center w-16"
                    value={newItem.quantity}
                    min={1}
                    onChange={(e) =>
                      setNewItem((item) => ({
                        ...item,
                        quantity: Number(e.target.value),
                      }))
                    }
                  />
                  <button
                    className="ml-2 text-green-500"
                    type="button"
                    onClick={handleAddNewItem}
                  >
                    Add
                  </button>
                  <button
                    className="ml-2 text-gray-500"
                    type="button"
                    onClick={() => setNewItem(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="m-2 text-green-500"
                  type="button"
                  onClick={handleShowNewItemInput}
                >
                  Add New Item
                </button>
              )}
            </div>

            <div className="flex items-center justify-center">
              <button className="m-2" type="button" onClick={handleSave}>
                ⓧ Save
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderEditModal;
