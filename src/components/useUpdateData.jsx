import React, { useState } from "react";
import axios from "axios";

const useUpdateData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateData = async (locationId, quantity, itemId, locationIdDb) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `http://localhost:3000/item_locations/${locationId}`,
        { item_id: itemId, location_id: locationIdDb, quantity: quantity }
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      return null;
    }
  };

  return { updateData, loading, error };
};

export default useUpdateData;
