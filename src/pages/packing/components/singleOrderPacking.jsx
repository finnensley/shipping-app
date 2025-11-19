import React, { useState } from "react";
import useFetchData from "../../../components/useFetchData";

const SingleOrderPacking = ({ setSelectedOrder, selectedOrder }) => {
  const { data, loading, error } = useFetchData("orders_with_items");
  const [inputValue, setInputValue] = useState("");

  const handleClick = () => {
    if (!data || !data.orders) return;
    const order = data.orders.find(
      (order) => order.order_number === Number(inputValue)
    );
    setSelectedOrder(order || null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading orders.</div>;

  return (
    <>
      <div>
        <input
          type="text"
          value={inputValue}
          id="singleOrderPacking"
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="enter order #"
          className="w-fit text-center"
        />
        <button type="button" onClick={handleClick} className="mt-2 w-fit">
          Pack Order
        </button>
      </div>
    </>
  );
};

export default SingleOrderPacking;
