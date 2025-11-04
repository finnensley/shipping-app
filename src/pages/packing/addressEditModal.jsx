import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateOrder, fetchOrders } from "../../features/orders/orderSlice";
import { motion } from "framer-motion";
import { setSelectedOrder } from "../../features/packing/packingSlice";

const EASYSHIP_API_KEY = import.meta.env.VITE_EASYSHIP_SAND;

const AddressEditModal = ({ order, onClose }) => {
  const dispatch = useDispatch();
  const [orderEdits, setOrderEdits] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (order) {
      setOrderEdits({
        id: order.id,
        order_number: order.order_number,
        address_line1: order.address_line1 ?? "",
        address_line2: order.address_line2 ?? null,
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

  // Address validation using Easyship /rates endpoint
  const validateAddress = async () => {
    setValidating(true);
    setValidationError("");

    const normalizedCountry =
      orderEdits && orderEdits.country === "USA"
        ? "US"
        : orderEdits?.country || "";

    // Basic client-side validation before API call
    if (
      !orderEdits ||
      !orderEdits.address_line1 ||
      !orderEdits.city ||
      !orderEdits.state ||
      !orderEdits.zip ||
      !normalizedCountry ||
      orderEdits.address_line1.length > 35 ||
      orderEdits.city.length > 200 ||
      orderEdits.state.length > 2 ||
      orderEdits.zip.length > 20 ||
      normalizedCountry.length !== 2
    ) {
      setValidationError(
        "Please fill all required fields with valid values (2-letter country/state codes, address < 35 chars, city < 200 chars)."
      );
      setValidating(false);
      return false;
    }

    const payload = {
      origin_address: {
        country_alpha2: normalizedCountry,
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
        country_alpha2: normalizedCountry,
        state: orderEdits.state,
        city: orderEdits.city,
        postal_code: orderEdits.zip,
        line_1: orderEdits.address_line1,
        line_2: orderEdits.address_line2 || "",
        company_name: null,
        contact_name: orderEdits.customer_name,
        contact_phone: "",
        contact_email: orderEdits.customer_email,
      },
      parcels: [
        {
          total_actual_weight: 1,
          box: { length: 1, width: 1, height: 1 },
          items: [
            {
              quantity: 1,
              description: "Test",
              origin_country_alpha2: "US",
              declared_currency: "USD",
              declared_customs_value: 1,
              hs_code: "6912.00.21",
              contains_battery_pi966: false,
              contains_battery_pi967: false,
              contains_liquids: false,
            },
          ],
        },
      ],
    };

    // Log payload for debugging
    console.log(
      "Validating address payload:",
      JSON.stringify(payload, null, 2)
    );

    try {
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
        setValidationError(
          "Address validation failed. Please check the details."
        );
        setValidating(false);
        return false;
      }
      const data = await response.json();
      if (!data.rates || data.rates.length === 0) {
        setValidationError("No rates found. Address may be invalid.");
        setValidating(false);
        return false;
      } else {
        setValidationError(""); // Address is valid
        setValidating(false);
        return true;
      }
    } catch (err) {
      setValidationError("Error validating address.");
      setValidating(false);
      return false;
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const isValid = await validateAddress();
    if (!isValid) return;

    const orderEditsToSend = {
      id: orderEdits.id,
      order_number: Number(orderEdits.order_number),
      subtotal: order.subtotal ?? 0,
      taxes: order.taxes ?? 0,
      total: order.total ?? 0,
      shipping_paid: order.shipping_paid ?? 0,
      address_line1: orderEdits.address_line1,
      address_line2: orderEdits.address_line2,
      city: orderEdits.city,
      state: orderEdits.state,
      zip: orderEdits.zip,
      country: orderEdits.country,
      carrier: order.carrier ?? "",
      carrier_speed: order.carrier_speed ?? "",
      customer_id: Number(orderEdits.customer_id),
      customer_name: orderEdits.customer_name,
      customer_email: orderEdits.customer_email,
      updated_at: new Date().toISOString(),
      items: order.items ?? [],
    };

    console.log(
      "Saving orderEdits:",
      JSON.stringify(orderEditsToSend, null, 2)
    );

    // Debugging logs
    console.log("API URL:", `http://localhost:3000/orders/${orderEdits.id}`);
    console.log("Request body:", JSON.stringify(orderEditsToSend, null, 2));
    console.log("Order ID being used:", orderEdits.id);

    try {
      const response = await fetch(
        `http://localhost:3000/orders/${orderEdits.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderEditsToSend),
        }
      );

      // Logs to see response data
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        console.error("Response headers:", [...response.headers.entries()]);
        console.error("Request that failed:", {
          url: `http://localhost:3000/orders/${orderEdits.id}`,
          method: "PUT",
          body: orderEditsToSend,
        });
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
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose} // Close when clicking backdrop
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-black/80 border border-y rounded-xl p-6 w-full max-w-lg mx-4 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-400"
          onClick={onClose}
        >
          ⓧ Close
        </button>

        <h1 className="mt-4 text-xl font-bold text-white mb-4">
          Edit Address - Order #{order.order_number}
        </h1>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center">
            <label className="w-40 text-right mr-2 text-white">Customer:</label>
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
            <label className="w-40 text-right mr-2 text-white">Email:</label>
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
            <label className="w-40 text-right mr-2 text-white">City:</label>
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
            <label className="w-40 text-right mr-2 text-white">State:</label>
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
            <label className="w-40 text-right mr-2 text-white">Zip:</label>
            <input
              className="border rounded-lg px-3 py-2 flex-1"
              placeholder={order.zip}
              value={orderEdits.zip ?? ""}
              onChange={(e) =>
                setOrderEdits((edits) => ({ ...edits, zip: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center">
            <label className="w-40 text-right mr-2 text-white">Country:</label>
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
              className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700"
              disabled={validating}
            >
              {validating ? "Validating..." : "Save Changes"}
            </button>
          </div>
          {validationError && (
            <div className="text-red-600 mt-2 text-center">
              {validationError}
            </div>
          )}
        </form>
        <div className="flex justify-center mt-2">
          <button
            type="button"
            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600"
            onClick={validateAddress}
            disabled={validating}
          >
            {validating ? "Validating..." : "Validate Address"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddressEditModal;
