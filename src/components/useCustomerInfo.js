import { useState, useEffect } from "react";
import useFetchData from "./useFetchData";

const useCustomerInfo = (orderNumber) => {
  const {
    data: ordersData,
    loading,
    error,
  } = useFetchData("orders_with_items");
  const [customerInfo, setCustomerInfo] = useState(null);

  useEffect(() => {
    if (!orderNumber || !ordersData?.orders) {
      setCustomerInfo(null);
      return;
    }

    const order = ordersData.orders.find(order =>
      order.order_number === parseInt(orderNumber));

    setCustomerInfo(order || null);
  }, [orderNumber, ordersData]);

  return { customerInfo, loading, error };
};

export default useCustomerInfo;
