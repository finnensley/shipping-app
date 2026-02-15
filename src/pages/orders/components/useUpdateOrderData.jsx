import React, { useState } from "react";
import axios from "axios";
import API_URL from "../../../utils/api";

const useUpdateOrderData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateData = async (orderItemId, orderId, itemId, quantity) => {
    console.log(
      "updateData called with:",
      orderItemId,
      orderId,
      itemId,
      quantity,
    );

    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_URL}/api/order_items/${orderItemId}`,
        { quantity },
      );
      return response.data;
    } catch (err) {
      setError(err);
      console.log("Update error:", err);
    }
  };
  return { updateData, loading, error };
};

export default useUpdateOrderData;
