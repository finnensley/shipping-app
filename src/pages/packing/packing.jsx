import React, { useState } from "react";
import { orders } from "../../data/orders";
import { items } from "../../data/inventory";
import { locations } from "../../data/locations";
import ItemPicture from "../../components/picture";
// from the staging location, pull a pickinglist - separated by orders
// choose order to pack

const PackingPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

//   useEffect(() => {
//   async function fetchPicklists() {
//     const response = await axios.get("/picklists_with_order_info");
//     setPicklists(response.data.picklists);
//   }
//   fetchPicklists();
// }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleClick = () => {
    const orderToPack = orders.find(
      (order) => order.order_number === Number(inputValue)
    );
    // console.log(orderToPack);
    setSelectedOrder(orderToPack);
  };

  return (
    <div className="m-4 font-medium">
      <h1>Packing</h1>
      <div className="m-4 text-xl">
        <label
          htmlFor="singleOrderPacking"
          className="text-xl text-white font-semibold bg-[rgba(0,0,0,0.38)]"
        >
          Order number:
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          id="singleOrderPacking"
          className="p-1 border ml-2 rounded-lg text-xl bg-[rgba(0,0,0,0.38)] text-white font-semibold placeholder-white"
          placeholder="enter an order"
        ></input>
        <button type="button" onClick={handleClick} className="ml-2">
          Enter
        </button>
      </div>
      <div className="flex gap-2 justify-between w-full mt-4">
        {selectedOrder && (
          <div className="flex flex-col mt-4 p-4 border rounded-lg w-fit">
            <h2 className="flex border-y rounded-lg text-lg font-bold m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white w-fit text-lg text-shadow-lg self-center">
              Order # {selectedOrder.order_number}
            </h2>
            <ul>
              {selectedOrder.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex border-y rounded-lg m-4 p-1 bg-[rgba(0,0,0,0.38)] text-white w-fit text-lg text-shadow-lg font-semibold items-center"
                  >
                    <ItemPicture sku={item.sku} description={item.description} />
                    Sku: {item.sku} | Item: {item.description} |
                    Quantity: {item.quantity}
                    <button
                      aria-label="Increment value"
                      className="ml-3"
                      onClick={() => dispatch(addItem())}
                    >
                      +
                    </button>
                  </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 p-4 border rounded-lg w-full border-y m-4 bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold items-center">
          <div className="inline-block w-fit">
            Address and Carriers Screen:{" "}
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 border rounded-lg w-full border-y bg-[rgba(0,0,0,0.38)] text-white text-lg text-shadow-lg font-semibold items-center">
        <div className="inline-block w-fit">
          Packing Screen
          <p>OnClick: Items appear here</p>
        </div>
      </div>
    </div>
  );
};

export default PackingPage;
