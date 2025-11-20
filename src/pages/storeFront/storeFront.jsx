import React, { useState, useEffect } from "react";
import NavBar from "../../components/header/navBar";
import { useNavigate } from "react-router-dom";

const initialItems = [
  { id: 1, name: "T-shirt", price: 3, quantity: 2 },
  { id: 2, name: "Hats", price: 10, quantity: 3 },
  { id: 3, name: "Mug", price: 10, quantity: 4 },
  { id: 4, name: "Jacket", price: 5, quantity: 0 },
];

const StoreFrontPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => {
    const storedItems = localStorage.getItem("items");
    return storedItems ? JSON.parse(storedItems) : initialItems;
  });
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cartItems");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // saves inventory items and  cart items to localStorage
  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [items, cartItems]);

  const handleAddToCart = (item) => {
    if (item.quantity === 0) return;
    setItems((prevItems) =>
      prevItems.map((it) =>
        it.id === item.id ? { ...it, quantity: it.quantity - 1 } : it
      )
    );
    setCartItems((prevCartItems) => {
      const found = prevCartItems.find((cartItem) => cartItem.id === item.id);
      if (found) {
        return prevCartItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCartItems, { ...item, quantity: 1 }];
      }
    });
  };

  const handleIncrease = (cartItem) => {
    setCartItems((prevCartItems) =>
      prevCartItems.map((ci) =>
        ci.id === cartItem.id ? { ...ci, quantity: ci.quantity + 1 } : ci
      )
    );
    setItems((prevItems) =>
      prevItems.map((it) =>
        it.id === cartItem.id ? { ...it, quantity: it.quantity - 1 } : it
      )
    );
  };

  const handleDelete = (cartItem) => {
    setCartItems((prevCartItems) =>
      prevCartItems.filter((ci) => ci.id !== cartItem.id)
    );
    setItems((prevItems) =>
      prevItems.map((it) =>
        it.id === cartItem.id
          ? { ...it, quantity: it.quantity + cartItem.quantity }
          : it
      )
    );
  };

  const handleDecrease = (cartItem) => {
    if (cartItem.quantity === 1) {
      // handleDelete happens after click past 1
      handleDelete(cartItem);
    } else {
      setCartItems((prevCartItems) =>
        prevCartItems.map((ci) =>
          ci.id === cartItem.id ? { ...ci, quantity: ci.quantity - 1 } : ci
        )
      );

      setItems((prevItems) =>
        prevItems.map((it) =>
          it.id === cartItem.id ? { ...it, quantity: it.quantity + 1 } : it
        )
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center mt-8 ">
        <div className="flex flex-col border-b shadow-md shadow-white rounded-xl p-10 ml-5">
          {/* <div className="flex flex-col justify-evenly ml-5 mb-15 border shadow-2xl shadow-black-950 drop-shadow-lg p-10 rounded-xl"> */}
          <h2 className="flex justify-center text-3xl border-b-4 px-4 py-2">
            Inventory Items
          </h2>

          <ul
            // style={{ listStyleType: "none" }}
            className="divide-y-2 divide-gray-500 p-5 text-xl"
          >
            {items.map((item) => (
              <li key={item.id} className="p-5">
                {item.name} : ${item.price} | Qty:{" "}
                {item.quantity === 0 ? "Out of Stock" : item.quantity}
                <button
                  className="ml-4"
                  onClick={() => handleAddToCart(item)}
                  hidden={item.quantity === 0}
                >
                  Add To Cart
                </button>
              </li>
            ))}
          </ul>
          <hr></hr>
        </div>
        <div className="flex justify-center item-center rounded-lg">
          <div className="flex flex-col border-b shadow-md shadow-white rounded-xl p-10 ml-5">
            {/* <div className="flex flex-col justify-evenly ml-5 mr-5 shadow-2xl shadow-black-950 border rounded-xl drop-shadow-lg p-10"> */}
            <h2 className="flex justify-center border-b-4 px-4 py-2 text-3xl">
              Shopping Cart
            </h2>

            {cartItems.map((cartItem) => {
              const itemInStock = items.find((it) => it.id === cartItem.id);
              const stock = itemInStock ? itemInStock.quantity : 0;
              return (
                <div>
                  <ul
                    className="border-b-2 border-gray-500 p-5 text-xl"
                  >
                    <li key={cartItem.id}>
                      {cartItem.name} : ${cartItem.price} x {cartItem.quantity}
                      <button
                        className="ml-2 w-10 font-extrabold"
                        onClick={() => handleIncrease(cartItem)}
                        disabled={stock === 0}
                      >
                        +
                      </button>
                      <button
                        className="ml-2 w-10 font-extrabold bg-red-900"
                        onClick={() => handleDecrease(cartItem)}
                        disabled={cartItem.quantity === 0}
                      >
                        -
                      </button>
                      <button
                        className= "m-1 ml-2 bg-red-900"
                        onClick={() => handleDelete(cartItem)}
                      >
                        Remove
                      </button>
                    </li>
                  </ul>
                  {/* <span className="inline-flex items-center ml-2">
                    <button
                      className="ml-35 w-10"
                      onClick={() => handleIncrease(cartItem)}
                      disabled={stock === 0}
                    >
                      +
                    </button>
                    <button
                      className="ml-2 w-10"
                      onClick={() => handleDecrease(cartItem)}
                      disabled={cartItem.quantity === 0}
                    >
                      -
                    </button>
                  </span> */}
                  {/* <button
                    className="w-full mb-2"
                    onClick={() => handleDelete(cartItem)}
                  >
                    Delete
                  </button>
                  <hr></hr> */}
                </div>
              );
            })}
            <div>
              <p className="p-2 text-2xl text-center">
                Total: $
                {
                  cartItems
                    .map((cartItem) => cartItem.quantity * cartItem.price)
                    .reduce((acc, itemTotal) => acc + itemTotal, 0) // itemTotal could be amt, can be anything
                }
              </p>
              <span className="text-center">*excludes taxes and shipping</span>
              <hr></hr>
              <button
                onClick={() => navigate("/checkout")}
                className="mt-5 bg-green-900"
                type="submit"
              >
                Check Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreFrontPage;
