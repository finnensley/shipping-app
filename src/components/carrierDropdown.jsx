import React from "react";

const CarrierDropdown = ({ carrierRates, selectedCarrier, onSelect }) => {
  // Debug: log all rates received
  console.log("All carrierRates from Easyship:", carrierRates);

  // Filter out invalid rates and add safety checks
  const validRates = carrierRates.filter(
    (rate) =>
      rate &&
      rate.courier_service &&
      rate.courier_service.name &&
      rate.courier_service.umbrella_name &&
      rate.total_charge !== undefined &&
      rate.total_charge !== null &&
      !isNaN(rate.total_charge)
  );
  // Debug: log filtered rates
  console.log("Valid carrierRates after filtering:", validRates);

  return (
    <div className="mt-2">
      <label>Select Carrier:</label>
      <select
        className="border rounded-lg text-white w-full p-2"
        value={
          selectedCarrier
            ? `${selectedCarrier.courier_service?.umbrella_name || ""}-${
                selectedCarrier.courier_service?.name || ""
              }`
            : ""
        }
        onChange={(e) => {
          const carrierRate = validRates.find(
            (rate) =>
              `${rate.courier_service.umbrella_name}-${rate.courier_service.name}` ===
              e.target.value
          );
          onSelect(carrierRate);
        }}
      >
        <option value="">Choose a carrier</option>
        {validRates.map((rate, index) => (
          <option
            key={`${rate.courier_service.umbrella_name}-${rate.courier_service.name}-${index}`}
            value={`${rate.courier_service.umbrella_name}-${rate.courier_service.name}`}
          >
            {rate.courier_service.umbrella_name} - {rate.courier_service.name}{" "}
            (${Number(rate.total_charge).toFixed(2)})
          </option>
        ))}
      </select>
      {validRates.length === 0 && carrierRates.length > 0 && (
        <p className="text-red-500 text-sm mt-1">
          No valid carrier rates available
        </p>
      )}
    </div>
  );
};

export default CarrierDropdown;
