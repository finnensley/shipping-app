import React from "react";
// import { items } from "../data/inventory";
import useFetchData from "../components/useFetchData";

const ItemPicture = ({ sku, description }) => {
  const { data, loading, error } = useFetchData("items");
  if (!sku || !description) return null;
  if (loading || error || !data || !data.items) return null;

  const inventoryItem = data.items.find((item) => item.sku === sku);
  const src = inventoryItem?.image_path || "";
  return src ? (
    <img
      src={src}
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
