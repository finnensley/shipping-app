import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateOrder, fetchOrders } from "../../features/orders/orderSlice";
import { motion } from "framer-motion";
import { setSelectedOrder } from "../../features/packing/packingSlice";

const AddressEditModal = ({ order, onClose }) => {
  const dispatch = useDispatch();
  const [orderEdits, setOrderEdits] = useState(null);

  useEffect(() => {
    if (order) {
      setOrderEdits({
        id: order.id,
        order_number: order.order_number,
        address_line1: order.address_line1 ?? "",
        address_line2: order.address_line2 ?? "",
        city: order.city ?? "",
        state: order.state ?? "",
        zip: order.zip ?? "",
        country: order.country ?? "",
        customer_id: order.customer_id,
        customer_name: order.customer_name ?? "",
        customer_email: order.customer_email ?? "",
      });
    }
  }, [order]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const orderEditsToSend = {
      ...orderEdits,
      order_number: Number(orderEdits.order_number),
      customer_id: Number(orderEdits.customer_id),
    };

    console.log(
      "Saving orderEdits:",
      JSON.stringify(orderEditsToSend, null, 2)
    );
    dispatch(updateOrder(orderEditsToSend));

    try {
      const response = await fetch(
        `http://localhost:3000/orders/${orderEdits.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderEditsToSend),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        alert("Unable to save edits: " + errorText);
        return;
      }

      if (response.ok) {
        // Update both Redux states
        dispatch(updateOrder(orderEditsToSend)); // Updates state.order
        dispatch(setSelectedOrder(orderEditsToSend)); // Updates state.packing.selectedOrder
        dispatch(fetchOrders()); // Re-fetch for consistency

        alert("Order was updated successfully");
        onClose(); // Close modal after successful save
      }
    } catch (err) {
      console.error("Unable to save edits:", err);
      alert("Unable to save edits: " + err.message);
    }
  };

  if (!orderEdits) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose} // Close when clicking backdrop
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-lg p-6 w-full max-w-xl mx-4 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ⓧ Close
        </button>

        <h1 className="mt-4 text-xl font-bold text-gray-800 mb-4">
          Edit Address - Order #{order.order_number}
        </h1>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center">
            <label className="w-40 text-right mr-2 text-gray-700">
              Customer:
            </label>
            <input
              className="border rounded-lg px-3 py-2 flex-1"
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
            <label className="w-40 text-right mr-2 text-gray-700">Email:</label>
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
            <label className="w-40 text-right mr-2 text-gray-700">
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
            <label className="w-40 text-right mr-2 text-gray-700">
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
            <label className="w-40 text-right mr-2 text-gray-700">City:</label>
            <input
              className="border rounded-lg px-3 py-2 flex-1"
              placeholder={order.city}
              value={orderEdits.city ?? ""}
              onChange={(e) =>
                setOrderEdits((edits) => ({ ...edits, city: e.target.value }))
              }
            />
          </div>

          <div className="flex items-center">
            <label className="w-40 text-right mr-2 text-gray-700">State:</label>
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

          <div className="flex items-center">
            <label className="w-40 text-right mr-2 text-gray-700">Zip:</label>
            <input
              className="border rounded-lg px-3 py-2 flex-1"
              placeholder={order.zip}
              value={orderEdits.zip ?? ""}
              onChange={(e) =>
                setOrderEdits((edits) => ({ ...edits, zip: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-center space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddressEditModal;
