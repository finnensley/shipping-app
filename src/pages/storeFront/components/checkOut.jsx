import React from "react";
import { useNavigate } from "react-router-dom";

const CheckOut = () => {
  const navigate = useNavigate();

  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

  const handleCheckOut = async () => {
    const response = await fetch(
      "http://localhost:3000/create-checkout-session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }),
      }
    );
    const data = await response.json();
    if (data.url) {
      window.location = data.url; // Redirect to Stripe Checkout
    } else {
      alert("Checkout failed. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex justify-center item-center rounded-lg mt-8">
                <div className="flex flex-col border-b shadow-md shadow-white rounded-xl p-10">

        {/* <div className="flex flex-col justify-evenly shadow-2xl shadow-black-950 bg-blue-200/40 rounded-xl drop-shadow-lg p-10"> */}
          <h2 className="flex justify-center text-3xl border-b-4 px-4 py-2">
            Shopping Cart Summary
          </h2>
          <hr />
          <ul className="divide-y-2 divide-gray-500 p-5 text-2xl">
            {cartItems.map((item) => (
              <li key={item.id} className="mb-2 p-5">
                {item.name} x {item.quantity} — ${item.price * item.quantity}
              </li>
            ))}
          </ul>
          <p className="p-5 text-3xl text-center">
            Total: $
            {cartItems
              .reduce((acc, item) => acc + item.price * item.quantity, 0)
              .toFixed(2)}
            <br />
            <span className="text-center text-base">
              *excludes taxes and shipping
            </span>
          </p>
          <hr />
          <button className="mt-4 p-2" onClick={handleCheckOut}>
            Check Out
          </button>
        </div>
      </div>

      <button className="mt-4" onClick={() => navigate("/store")}>
        Return To Cart
      </button>
    </div>
  );
};

export default CheckOut;
