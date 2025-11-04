import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateOrder, fetchOrders } from "../../features/orders/orderSlice";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const AddressDetailsPage = () => {
  const dispatch = useDispatch();
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const orders = useSelector((state) => state.order);
  const [showAddressEdit, setShowAddressEdit] = useState(false);

  const selectedOrder = useSelector((state) => state.packing.selectedOrder);
  // Try to find the order from selectedOrder first, then from orders array
  const order = selectedOrder && String(selectedOrder.order_number) === String(orderNumber) 
    ? selectedOrder 
    : orders?.find((o) => String(o.order_number) === String(orderNumber));

 console.log("Selected order from packing:", selectedOrder);
  console.log("Found order:", order);
  console.log("Order number from URL:", orderNumber);

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
        //add customer_phone: order.customer_phone ?? "",
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

  const handleSave = async (e) => {
    if (e) e.preventDefault(); // prevents form submit if passed

    const orderEditsToSend = {
      ...orderEdits,
      order_number: Number(orderEdits.order_number),
      customer_id: Number(orderEdits.customer_id),
    };

    console.log(
      "Saving orderEdits:",
      JSON.stringify(orderEditsToSend, null, 2)
    );
    dispatch(updateOrder(orderEditsToSend)); // redux state
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
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1); // Go back one step in browser history
              } else {
                navigate("/packing");
              }
            }}
          >
            ⓧ Close
          </button>
          <h1 className="mt-4 text-xl font-bold shadow-lg">
            Order # {order.order_number}
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

export default AddressDetailsPage;
