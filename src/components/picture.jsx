import React from "react";
// import { items } from "../data/inventory";

const ItemPicture = ({ sku, description, image_path }) => {
  if (!sku || !description) return null;
  // const inventoryItem = items.find((inv) => inv.sku === sku);
  const src = image_path || "";
  return src ? (
    <img
      src={src}
      // src={inventoryItem ? inventoryItem.picture : ""}
      alt={description}
      style={{
        width: "50px",
        height: "50px",
        objectFit: "cover",
        marginRight: "1rem",
      }}
    />
  ) : null;
};

export default ItemPicture;
