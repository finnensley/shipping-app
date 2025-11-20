// __tests__/components/OrderSelector.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import OrderSelector from "../../../src/pages/picking/components/orderSelector.jsx";

describe("OrderSelector Component", () => {
  const mockOrders = [
    {
      id: 1,
      order_number: 1001,
      items: [{ id: 1, sku: "12345", description: "Test Item 1", quantity: 2 }],
    },
    {
      id: 2,
      order_number: 1002,
      items: [{ id: 2, sku: "67890", description: "Test Item 2", quantity: 1 }],
    },
  ];

  const mockOnCreatePickList = jest.fn();

  beforeEach(() => {
    mockOnCreatePickList.mockClear();
  });

  test("should display order quantity input with correct max value", () => {
    render(
      <OrderSelector
        orders={mockOrders}
        onCreatePickList={mockOnCreatePickList}
      />
    );

    const quantityInput = screen.getByDisplayValue("1");
    expect(quantityInput).toHaveAttribute("max", "2");
  });

  test("should update quantity when input changes", async () => {
    const user = userEvent.setup();

    render(
      <OrderSelector
        orders={mockOrders}
        onCreatePickList={mockOnCreatePickList}
      />
    );

    const quantityInput = screen.getByDisplayValue("1");
    await user.clear(quantityInput);
    await user.type(quantityInput, "2");

    expect(quantityInput).toHaveValue(2);
  });

  test("should handle priority selection", async () => {
    const user = userEvent.setup();

    render(
      <OrderSelector
        orders={mockOrders}
        onCreatePickList={mockOnCreatePickList}
      />
    );

    const prioritySelect = screen.getByDisplayValue("ship-by-date");
    await user.selectOptions(prioritySelect, "oldest-order-number");

    expect(prioritySelect).toHaveValue("oldest-order-number");
  });

  test("should handle batch type selection", async () => {
    const user = userEvent.setup();

    render(
      <OrderSelector
        orders={mockOrders}
        onCreatePickList={mockOnCreatePickList}
      />
    );

    const batchSelect = screen.getByDisplayValue("multi-item");
    await user.selectOptions(batchSelect, "single-item");

    expect(batchSelect).toHaveValue("single-item");
  });

  test("should call onCreatePickList when CREATE button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <OrderSelector
        orders={mockOrders}
        onCreatePickList={mockOnCreatePickList}
      />
    );

    const createButton = screen.getByText("CREATE");
    await user.click(createButton);

    expect(mockOnCreatePickList).toHaveBeenCalledTimes(1);
  });

  test("should handle single order input and creation", async () => {
    const user = userEvent.setup();

    render(
      <OrderSelector
        orders={mockOrders}
        onCreatePickList={mockOnCreatePickList}
      />
    );

    const singleOrderInput = screen.getByPlaceholderText("enter order #");
    const singleOrderButton = screen.getAllByText("CREATE")[1];

    await user.type(singleOrderInput, "1001");
    await user.click(singleOrderButton);

    expect(mockOnCreatePickList).toHaveBeenCalledWith([mockOrders[0]]);
  });
});
