import React, { useState } from 'react';
import axios from "axios";

const useUpdateOrderData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateData = async (orderItemId, orderId, itemId, quantity) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(
                `http://localhost:3000/order_items/${orderItemId}`,
                { order_id: orderId, item_id: itemId, quantity: quantity }
            );
            setLoading(false);
            return response.data
        } catch (err) {
            setError(err);
            setLoading(false);
            return null;

        }
    };
    return { updateData, loading, error };
}

export default useUpdateOrderData;