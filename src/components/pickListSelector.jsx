import React from "react";

const PickListSelector = ({
  pickLists,
  selectedPickList,
  onSelectPickList,
  onClose,
}) => {
  if (!pickLists.length) {
    return (
      <div className="m-4 p-4 border rounded-lg  text-white">
        <h2 className="text-lg font-bold mb-4">No Pick Lists Available</h2>
        <p>There are no staged pick lists ready for packing.</p>
      </div>
    );
  }
  return (
    <div className="m-4 p-4 border rounded-lg  text-white">
      <div className="flex justify-end">
        <button onClick={onClose}>ⓧ Close</button>
      </div>
      <h2 className="text-lg font-bold mb-4">Select Pick List to Pack:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pickLists?.map((pickList) => (
          <div
            key={pickList.pick_list_id}
            className="p-3 border border-gray-500 hover:border-gray-300 rounded-lg cursor-pointer transition-colors"
            onClick={() => onSelectPickList(pickList)}
          >
            <h3 className="font-semibold">
              Pick List #{pickList.pick_list_id}
            </h3>
            <span className="text-sm">
              Orders: {pickList.order_numbers.length} |{" "}
            </span>
            <span className="text-sm">
              Items:{" "}
              {pickList.items?.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
            <p className="text-sm">
              Revenue: $
              {pickList.orders
                ?.reduce((sum, order) => sum + parseFloat(order?.total), 0)
                .toFixed(2)}
            </p>

            <p className="text-xs text-gray-300">
              Created: {new Date(pickList.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        Total Revenue Picked: $
        {pickLists
          ?.flatMap((pickList) => pickList.orders)
          .reduce((sum, order) => sum + parseFloat(order?.total), 0)
          .toFixed(2)}
      </div>
    </div>
  );
};

export default PickListSelector;
