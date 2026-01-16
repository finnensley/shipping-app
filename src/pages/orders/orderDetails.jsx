import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateOrder, fetchOrders } from "../../features/orders/orderSlice";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import API_URL from "../../utils/api";

const OrderDetailsPage = () => {
  const dispatch = useDispatch();
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const orders = useSelector((state) => state.order);
  const order = orders.find(
    (o) => String(o.order_number) === String(orderNumber),
  );
  const orderId = order?.id;
  const [newItem, setNewItem] = useState(null);
  const [orderEdits, setOrderEdits] = useState(null);

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

  if (!order) {
    return (
      <div className="flex items-center justify-center m-5">
        <h2>Order not found for #{orderNumber}</h2>
      </div>
    );
  }

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="flex items-center justify-center w-full">
        <form className="text-semibold flex flex-col border-y rounded-lg p-4 text-md w-full max-w-xl">
          <button
            className="m-2 w-fit absolute top-6 right-4"
            onClick={() => navigate("/orders")}
          >
            ⓧ Close
          </button>
          <h1 className="mt-4 text-xl font-bold shadow-lg">
            Order Number: {order.order_number}
          </h1>
          <div className="mr-2 p-2">
            <div className="mt-2 flex items-center">
              <label className="w-40 text-right mr-2">Customer: </label>
              <input
                className="border rounded-lg text-center"
                placeholder={order.customer_name}
                value={orderEdits.customer_name ?? ""}
                onChange={(e) =>
                  setOrderEdits((edits) => ({
                    ...edits,
                    customer_name: e.target.value,
                  }))
                }
              ></input>
            </div>
            {/* <p>Customer: {order.customer_name}</p> */}
            {/* <p>Email: {order.customer_email}</p> */}
            <div className="mt-2 flex items-center">
              <label className="w-40 text-right mr-2">Email: </label>
              <input
                className="border rounded-lg text-center flex-1"
                placeholder={order.customer_email}
                value={orderEdits.customer_email ?? ""}
                onChange={(e) =>
                  setOrderEdits((edits) => ({
                    ...edits,
                    customer_email: e.target.value,
                  }))
                }
              ></input>
            </div>
            {/* <p>
            Address: {order.address_line1}, {order.city}, {order.state}{" "}
            {order.zip}
          </p> */}
            <div className="mt-2 flex items-center">
              <label className="w-40 text-right mr-2">Address Line 1: </label>
              <input
                className="border rounded-lg text-center flex-1"
                placeholder={order.address_line1}
                value={orderEdits.address_line1 ?? ""}
                onChange={(e) =>
                  setOrderEdits((edits) => ({
                    ...edits,
                    address_line1: e.target.value,
                  }))
                }
              ></input>
            </div>
            <div className="mt-2 flex items-center">
              <label className="w-40 text-right mr-2">Address Line 2: </label>
              <input
                className="border rounded-lg text-center"
                placeholder={order.address_line2}
                value={orderEdits.address_line2 ?? ""}
                onChange={(e) =>
                  setOrderEdits((edits) => ({
                    ...edits,
                    address_line2: e.target.value,
                  }))
                }
              ></input>
            </div>
            <div className="mt-2 flex items-center">
              <label className="w-40 text-right mr-2">City: </label>
              <input
                className="border rounded-lg text-center"
                placeholder={order.city}
                value={orderEdits.city ?? ""}
                onChange={(e) =>
                  setOrderEdits((edits) => ({ ...edits, city: e.target.value }))
                }
              ></input>
            </div>
            <div className="mt-2 flex items-center">
              <label className="w-40 text-right mr-2">State: </label>
              <input
                className="border rounded-lg text-center"
                placeholder={order.state}
                value={orderEdits.state ?? ""}
                onChange={(e) =>
                  setOrderEdits((edits) => ({
                    ...edits,
                    state: e.target.value,
                  }))
                }
              ></input>
            </div>
            <div className="mt-2 flex items-center">
              <label className="w-40 text-right mr-2">Zip: </label>
              <input
                className="border rounded-lg text-center"
                placeholder={order.zip}
                value={orderEdits.zip ?? ""}
                onChange={(e) =>
                  setOrderEdits((edits) => ({ ...edits, zip: e.target.value }))
                }
              ></input>
            </div>
            {/* <p>
            Carrier: {order.carrier} ({order.carrier_speed})
          </p> */}
            <div className="mt-2 flex items-center">
              <label className="w-40 text-right mr-2">Carrier: </label>
              <input
                className="border rounded-lg text-center"
                placeholder={order.carrier}
                value={orderEdits.carrier ?? ""}
                onChange={(e) =>
                  setOrderEdits((edits) => ({
                    ...edits,
                    carrier: e.target.value,
                  }))
                }
              ></input>
            </div>
            <div className="mt-2 flex items-center">
              <label className="w-40 text-right mr-2">Carrier Speed: </label>
              <input
                className="border rounded-lg text-center"
                placeholder={order.carrier_speed}
                value={orderEdits.carrier_speed ?? ""}
                onChange={(e) =>
                  setOrderEdits((edits) => ({
                    ...edits,
                    carrier_speed: e.target.value,
                  }))
                }
              ></input>
            </div>
            {/* <p>Total: ${order.total}</p> */}
            <div className="mt-2 flex items-center">
              <label className="w-40 text-right mr-2">Total: </label>
              <input
                className="border rounded-lg text-center"
                placeholder={order.total}
                value={orderEdits.total ?? 0}
                onChange={(e) =>
                  setOrderEdits((edits) => ({
                    ...edits,
                    total: e.target.value,
                  }))
                }
              ></input>
            </div>
            {/* <p>Shipping Paid: ${order.shipping_paid}</p> */}
            <div className="mt-2 flex items-center">
              <label className="w-40 text-right mr-2">Shipping Paid: </label>
              <input
                className="border rounded-lg text-center"
                placeholder={order.shipping_paid}
                value={orderEdits.shipping_paid ?? 0}
                onChange={(e) =>
                  setOrderEdits((edits) => ({
                    ...edits,
                    shipping_paid: e.target.value,
                  }))
                }
              ></input>
            </div>
          </div>
          {/* <h3>Items:</h3>
          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.sku} - {item.description} (Qty: {item.quantity})
              </li>
            ))}
          </ul> */}
          <div className="mt-2">
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
                      setOrderEdits((edits) => ({ ...edits, items: newItems }));
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
      </div>
    </motion.div>
  );
};

export default OrderDetailsPage;
