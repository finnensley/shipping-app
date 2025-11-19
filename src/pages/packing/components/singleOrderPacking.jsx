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
      <div className="flex flex-col items-center justify-center m-4 font-medium">
        <div className="m-4">
          <label
            htmlFor="singleOrderPacking"
            className="text-xl text-white font-semibold "
          >
            Order number:
          </label>
          <input
            type="text"
            value={inputValue}
            id="singleOrderPacking"
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="enter order number"
            className="pl-1 text-center border ml-2 rounded-lg text-xl text-white font-semibold placeholder-gray-400"
          />
          <button type="button" onClick={handleClick} className="ml-2">
            Enter
          </button>
        </div>
      </div>
    </>
  );
};

export default SingleOrderPacking;
