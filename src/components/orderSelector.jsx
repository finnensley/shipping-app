import { useState } from "react";


const OrderSelector = ({ orders, onSelect, onCreatePickList }) => {
  console.log("orders in selector:", orders);
  const [quantity, setQuantity] = useState(0);

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

  return (
    <div>
      <label htmlFor="orderQuantity">Choose number of orders:</label>
      <input
        className="ml-1 w-16 text-center text-white bg-[rgba(0,0,0,0.38)]"
        id="orderQuantity"
        type="number"
        min={1}
        max={orders.length}
        value={quantity}
        onChange={handleChange}
      />
      <button className="ml-2" onClick={onCreatePickList}>Create Pick List</button>
      {/* <ul>
        {selectedOrders.map((order) => (
          <li key={order.order_number}>Order #{order.order_number}</li>
        ))}
      </ul> */}
    </div>
  );
};

export default OrderSelector;

//set default category to be oldest order
//logic for oldest order

// for now pull orders by earliest order_number
// expand this logic to: ship by date, earliest order (need to add both to table), identical items, multi items
