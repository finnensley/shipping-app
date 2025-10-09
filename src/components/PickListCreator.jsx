import React, { useState } from 'react';

const [selectOrders, setSelectedOrders] = useState([]);
const [pickList, setPickList] = useState([]);
//  const pickLists = useSelector((state) => state.picking.pickLists); // keep to use with multi picklist logic


const handleCreatePickList = () => {
const itemsList = orders.flatMap((order) =>
    order.items.map((item) => ({ ...item, order_number: order.order_number }))
  );
  console.log(itemsList); // []


  // groups by id and adds quantities of the same item.id together, Object.values converts object of grouped items into an array of values
  const groupedPickList = Object.values(
    itemsList.reduce((acc, item) => {
      if (acc[item.id]) {
        acc[item.id].quantity += item.quantity;
        //Add order number if not already present
        if (!acc[item.id].order_numbers.includes(item.order_number)) {
          acc[item.id].order_numbers.push(item.order_number);
        }
      } else {
        acc[item.id] = { ...item, order_numbers: [item.order_number] };
      }
      return acc;
    }, {})
  );
  setPickList(groupedPickList); //snapshot that does not change
};

const handleOrderUpdate = (orderId) => {

}