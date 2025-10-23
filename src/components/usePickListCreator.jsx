import React, { useState } from "react";

//  const pickLists = useSelector((state) => state.picking.pickLists); // keep to use with multi picklist logic

const usePickListCreator = (orders) => {
  const [pickList, setPickList] = useState([]);

  const createPickList = (ordersArg = orders) => { // passing ordersArg so can call with correct single order instead of [] because state hasn't updated
    const itemsList = ordersArg.flatMap((order) =>
      order.items.map((item) => ({ ...item, order_number: order.order_number }))
    );
    console.log(`itemsList: ${itemsList}`); // []

    // groups by id and adds quantities of the same item.id together, Object.values converts object of grouped items into an array of values
    const groupedPickList = Object.values(
      itemsList.reduce((acc, item) => {
        if (acc[item.sku]) {
          acc[item.sku].quantity += item.quantity;
          //Add order number if not already present
          if (!acc[item.sku].order_numbers.includes(item.order_number)) {
            acc[item.sku].order_numbers.push(item.order_number);
          }
        } else {
          acc[item.sku] = { ...item, order_numbers: [item.order_number] };
        }
        return acc;
      }, {})
    );
    setPickList(groupedPickList); //snapshot that does not change

    return groupedPickList;
  };

  return { pickList, createPickList };
};

// If an order is updated after it is in a picklist, order is still picked but transfered to a holding location or table, instead of
// to the staged table. User is flagged or alerted at transfer.
// const handleOrderUpdate = (orderId) => {

// }

export default usePickListCreator;
