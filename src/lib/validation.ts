
import type { CreateOrderInput } from "@/types/order";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateCreateOrder(
  data: unknown
): CreateOrderInput {
  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data)
  ) {
    throw new ValidationError(
      "Order data must be an object"
    );
  }

  const input = data as Record<string, unknown>;

  function requiredText(
    value: unknown,
    field: string
  ): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new ValidationError(
        `${field} is required`
      );
    }

    return value.trim();
  }

  const customerName = requiredText(
    input.customerName,
    "Customer name"
  );

  const phone = requiredText(
    input.phone,
    "Phone"
  );

  const productName = requiredText(
    input.productName,
    "Product name"
  );

  if (
    typeof input.quantity !== "number" ||
    !Number.isInteger(input.quantity) ||
    input.quantity < 1
  ) {
    throw new ValidationError(
      "Quantity must be a positive integer"
    );
  }

  if (
    typeof input.unitPrice !== "number" ||
    !Number.isFinite(input.unitPrice) ||
    input.unitPrice < 0 ||
    !Number.isSafeInteger(
      Math.round(input.unitPrice * 100)
    ) ||
    Math.abs(
      input.unitPrice * 100 -
      Math.round(input.unitPrice * 100)
    ) > 1e-8
  ) {
    throw new ValidationError(
      "Unit price must be non-negative with at most two decimal places"
    );
  }

  return {
    customerName,
    phone,
    productName,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
  };
}

export function validateUpdateOrder(data: unknown) {
  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data)
  ) {
    throw new ValidationError("Update data must be an object");
  }

  const input = data as Record<string, unknown>;

  const allowedFields = [
    "customerName",
    "phone",
    "productName",
    "quantity",
    "unitPrice",
    "status",
  ];

 const editableInput = { ...input };
delete editableInput.total;
const keys = Object.keys(editableInput);

  if (keys.length === 0) {
    throw new ValidationError("At least one field is required");
  }

  for (const key of keys) {
    if (!allowedFields.includes(key)) {
      throw new ValidationError(`Unknown field: ${key}`);
    }
const value = editableInput[key];

    if (["customerName", "phone", "productName"].includes(key)) {
      if (typeof value !== "string" || !value.trim()) {
        throw new ValidationError(`${key} must be non-empty text`);
      }
    }

    if (key === "quantity") {
      if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 1
      ) {
        throw new ValidationError("Quantity must be a positive integer");
      }
    }

    if (key === "unitPrice") {
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < 0 ||
        !Number.isSafeInteger(Math.round(value * 100)) ||
        Math.abs(value * 100 - Math.round(value * 100)) > 1e-8
      ) {
        throw new ValidationError(
          "Unit price must be non-negative with at most two decimal places"
        );
      }
    }

    if (key === "status") {
      if (
        value !== "Pending" &&
        value !== "Preparing" &&
        value !== "Delivered"
      ) {
        throw new ValidationError("Invalid order status");
      }
    }
  }

 return editableInput as unknown as
    Partial<import("@/types/order").CreateOrderInput> & {
      status?: import("@/types/order").OrderStatus;
    };
}

