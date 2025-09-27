export const orders = [
  {
    order_number: 100,
    items: [
      {
        id: 1,
        sku: 111111,
        description: "plate",
        quantity: 1,
        subtotal: 40,
        taxes: 3,
        shipping_paid: 10,
      },
    ],
  },

  {
    order_number: 101,
    items: [
      {
        id: 2,
        sku: 222222,
        description: "bowl",
        quantity: 2,
        subtotal: 30,
        taxes: 3,
        shipping_paid: 10,
      },
    ],
  },

  {
    order_number: 102,
    items: [
      {
        id: 3,
        sku: 333333,
        description: "mug",
        quantity: 1,
        subtotal: 20,
        taxes: 3,
        shipping_paid: 10,
      },
      {
        id: 2,
        sku: 222222,
        description: "bowl",
        quantity: 1,
        subtotal: 30,
        taxes: 3,
        shipping_paid: 10,
      },
    ],
  },
];

//Taxes, Subtotal, shipping_paid should be moved out of items object and into Accessorial, fix with database table
