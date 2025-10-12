import { useState } from "react";

const OrderSelector = ({ orders, onSelect, onCreatePickList }) => {
  console.log("orders in selector:", orders);
  const [quantity, setQuantity] = useState(0);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [inputValue, setInputValue] = useState("");

  // Get the earliest orders by order_number
  const sortedOrders = [...orders].sort(
    (a, b) => a.order_number - b.order_number
  );

  // Notify parent when selection changes
  const handleChange = (e) => {
    const newQuantity = Number(e.target.value);
    setQuantity(newQuantity);
    onSelect(sortedOrders.slice(0, newQuantity));
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // Use handleClick to show pickList for single order(logic not written out yet)
  const handleClick = () => {
    const orderToPick = orders.find(
      (order) => order.order_number === Number(inputValue)
    );
    setSelectedOrder(orderToPick);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center mb-4">
        <label
          className="text-2xl m-2 rounded-lg pl-1 pr-1 bg-[rgba(0,0,0,0.38)]"
          htmlFor="orderQuantity"
        >
          Choose number of orders:
        </label>
        <input
          className="m-2 w-16 text-2xl text-center rounded-lg text-white bg-[rgba(0,0,0,0.38)]"
          id="orderQuantity"
          type="number"
          min={1}
          max={orders.length}
          value={quantity}
          onChange={handleChange}
        />
        {/* <button className="m-2" onClick={onCreatePickList}>
          Create Pick List
        </button> */}
      </div>
      <div className="flex m-2 gap-x-4 text-xl">
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="border-x rounded-lg"
        >
          <option value="">Select Pick Priority</option>
          <option value="ship-by-date">Earliest Ship By Date</option>
          <option value="oldest-order-number">Oldest Order Number</option>
        </select>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="border-x rounded-lg"
        >
          <option value="">Select Batch Type</option>
          <option value="single-item">Single-item</option>
          <option value="multi-item">Multi-item</option>
          <option value="same-item">Same-item</option>
        </select>
      </div>
      <div className="items-center m-4">
        <label
          htmlFor="singleOrderPacking"
          className="text-2xl m-2 pl-1 pr-1 bg-[rgba(0,0,0,0.38)] rounded-lg"
        >
          Order number:
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          id="singleOrderPacking"
          // "m-2 text-2xl text-center
          className=" ml-2 border rounded-lg text-2xl bg-[rgba(0,0,0,0.38)] text-white text-center"
          placeholder="enter an order"
        ></input>
        <div>
          <button
            className="mt-5 justify-center items-center"
            onClick={onCreatePickList}
          >
            Create Pick List
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSelector;

//set default category to be oldest order
//logic for oldest order

// for now pull orders by earliest order_number
// expand this logic to: ship by date, earliest order (need to add both to table), identical items, multi items
