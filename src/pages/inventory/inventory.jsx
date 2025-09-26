import React from "react";

const items = [
  { id: 1, sku: 111111, description: "plate", total_quantity: 10, location: { A01: 10 } },
  { id: 2, sku: 222222, description: "bowl", total_quantity: 10, location: { A02: 5, A03: 5 } },
  { id: 3, sku: 333333, description: "mug", total_quantity: 10, location: { A04: 10 } },
];

const InventoryPage = () => {
  return (
    <div className="m-4">
      <h1>Inventory Page</h1>
    </div>
  );
};

export default InventoryPage;
