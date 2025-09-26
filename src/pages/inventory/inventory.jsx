import React from "react";

const items = [
  { id: 1, name: "plate", total_quantity: 10, location: { A01: 10 } },
  { id: 2, name: "bowl", total_quantity: 10, location: { A02: 5, A03: 5 } },
  { id: 3, name: "mub", total_quantity: 10, location: { A04: 10 } },
];

const InventoryPage = () => {
  return <div>
    <h1>Inventory Page</h1>
  </div>;
};

export default InventoryPage;
