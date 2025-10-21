import React from "react";

const PickListSelector = ({
  pickLists,
  selectedPickList,
  onSelectPickList,
}) => {
  if (!pickLists || pickLists.length === 0) {
    return (
      <div className="m-4 p-4 border rounded-lg bg-[rgba(0,0,0,0.38)] text-white">
        <h2 className="text-lg font-bold mb-4">No Pick Lists Available</h2>
        <p>There are no staged pick lists ready for packing.</p>
      </div>
    );
  }
  return (
    <div className="m-4 p-4 border rounded-lg bg-[rgba(0,0,0,0.38)] text-white">
      <h2 className="text-lg font-bold mb-4">Select Pick List to Pack:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pickLists?.map((pickList) => (
          <div
            key={pickList.pick_list_id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedPickList?.pick_list_id === pickList.pick_list_id
                ? "border-blue-400 bg-blue-900/50"
                : "border-gray-500 hover:border-gray-300"
            }`}
            onClick={() => onSelectPickList(pickList)}
          >
            <h3 className="font-semibold">
              Pick List #{pickList.pick_list_id}
            </h3>
            <p className="text-sm">
              Orders: {pickList.order_numbers.join(", ")}
            </p>
            <p className="text-sm">Items: {pickList.items?.length || 0}</p>
            <p className="text-xs text-gray-300">
              Created: {new Date(pickList.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PickListSelector;
