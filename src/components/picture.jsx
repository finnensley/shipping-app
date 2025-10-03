import React from "react";
import { items } from "../data/inventory";

const ItemPicture = ({ sku, description }) => {
  const inventoryItem = items.find((inv) => inv.sku === sku);
  
  return (
    <img
      src={inventoryItem ? inventoryItem.picture : ""}
      alt={description}
      style={{
        width: "50px",
        height: "50px",
        objectFit: "cover",
        marginRight: "1rem",
      }}
    />
  );
 
};

export default ItemPicture;
