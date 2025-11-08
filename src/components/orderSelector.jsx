import { useState } from "react";
import { motion } from "framer-motion";

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

  const applyPriorityAndBatchType = (
    orders,
    selectedPriority,
    selectedBatch,
    quantity
  ) => {
    let filtered = [...orders];
    if (selectedBatch === "single-item") {
      filtered = filtered.filter(
        (order) => order.items && order.items.length === 1
      );
    } else if (selectedBatch === "multi-item") {
      filtered = filtered.filter(
        (order) => order.items && order.items.length > 1
      );
    }

    if (selectedPriority === "ship-by-date") {
      filtered.sort(
        (a, b) => new Date(a.ship_by_date) - new Date(b.ship_by_date)
      );
    } else {
      filtered.sort((a, b) => a.order_number - b.order_number);
    }
    return filtered.slice(0, quantity);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="w-full max-w-3xl mt-8 text-lg">
        {/* Header of "table" */}
        <div className="grid grid-cols-4 items-end border-b-4 rounded-t-lg py-2 text-white font-bold">
          <div className="flex items-center justify-center">ORDERS </div>
          <div className="flex items-center justify-center">PRIORITY</div>
          <div className="flex items-center justify-center">BATCH</div>
          <div className="flex items-center justify-center">PICK LIST</div>
        </div>

        {/* Multi Pick */}
        <div className="grid grid-cols-4 border-b border-gray-700 py-2 text-white">
          <div className="flex items-center justify-center">
            <input
              className="border w-16 text-xl text-center rounded-lg text-white"
              id="orderQuantity"
              type="number"
              min={1}
              max={orders.length}
              value={quantity}
              onChange={handleChange}
            />
          </div>
          {/* Pick Priority */}
          <div className="flex items-center justify-center">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border text-xl rounded-lg "
            >
              <option value="ship-by-date">Ship By Date</option>
              <option value="oldest-order-number">Oldest Order</option>
            </select>
          </div>

          {/* Batch Type */}
          <div className="flex items-center justify-center">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="border text-xl m-4 rounded"
            >
              <option value="multi-item">Multi-item</option>
              <option value="single-item">Single-item</option>
            </select>
          </div>
          {/* Create Pick List Button */}
          <div className="flex items-center justify-center">
            <button
              className=" bg-green-900 rounded text-white font-bold"
              onClick={() => {
                const filteredOrders = applyPriorityAndBatchType(
                  orders,
                  selectedPriority,
                  selectedBatch,
                  quantity
                );
                onCreatePickList(filteredOrders);
              }}
            >
              Create
            </button>
          </div>
        </div>

        {/* Single Order */}
        <div className="flex justify-center mt-8">
          <div className="w-full max-w-md">
            <div className="grid grid-cols-2 items-end border-b-4 rounded-t-lg px-4 py-2 text-white font-bold">
              <div>SINGLE ORDER</div>
              <div>PICK LIST</div>
            </div>

            <div className="grid grid-cols-2 border-b border-gray-700 py-2 text-white ">
              <div className="flex items-center justify-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  id="singleOrderPacking"
                  className="border rounded-lg text-xl text-white text-center w-40"
                  placeholder="enter order #"
                ></input>
              </div>

              <div className="flex items-center justify-center">
                <button
                  className=" bg-green-900 rounded text-white font-bold"
                  onClick={() => {
                    const orderToPick = orders.find(
                      (order) => order.order_number === Number(inputValue)
                    );
                    if (orderToPick) {
                      onCreatePickList([orderToPick]);
                      setSelectedOrder(orderToPick);
                    } else {
                      alert("Order not found!");
                    }
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSelector;
