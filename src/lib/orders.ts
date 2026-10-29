
import type {
  Order,
  CreateOrderInput,
} from "@/types/order";

// Keep one shared order store during local development.
const globalStore = globalThis as typeof globalThis & {
  nourOrders?: Order[];
};

const orders = (globalStore.nourOrders ??= []);

// Return all orders.
export function getAllOrders(): Order[] {
  return orders.map((order) => ({ ...order }));
}

// Find an order by ID.
export function getOrderById(
  id: string
): Order | undefined {
  const order = orders.find((order) => order.id === id);

  return order ? { ...order } : undefined;
}

// Calculate money using integer cents.
export function calculateTotal(
  quantity: number,
  unitPrice: number
): number {
  const priceInCents = Math.round(unitPrice * 100);

  return (quantity * priceInCents) / 100;
}

// Create a new order.
export function createOrder(
  input: CreateOrderInput
): Order {
  const order: Order = {
    // Generate a unique ID on the server.
    id: crypto.randomUUID(),

    // Trim text before saving.
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    productName: input.productName.trim(),

    quantity: input.quantity,
    unitPrice: input.unitPrice,

    // The server calculates the total.
    total: calculateTotal(
      input.quantity,
      input.unitPrice
    ),

    // Every new order starts as Pending.
    status: "Pending",
  };

  orders.push(order);

  return { ...order };
}

// Delete an order.
export function deleteOrder(id: string): boolean {
  const index = orders.findIndex(
    (order) => order.id === id
  );

  if (index === -1) {
    return false;
  }

  orders.splice(index, 1);

  return true;
}

// Update an existing order.
export function updateOrder(
  id: string,
  updates: Partial<CreateOrderInput> & {
    status?: Order["status"];
  }
): Order | undefined {
  const index = orders.findIndex(
    (order) => order.id === id
  );

  if (index === -1) {
    return undefined;
  }

  const currentOrder = orders[index];

  const updatedOrder: Order = {
    ...currentOrder,
    ...updates,

    // The ID cannot be changed.
    id: currentOrder.id,

    // Trim updated text fields.
    customerName:
      updates.customerName !== undefined
        ? updates.customerName.trim()
        : currentOrder.customerName,

    phone:
      updates.phone !== undefined
        ? updates.phone.trim()
        : currentOrder.phone,

    productName:
      updates.productName !== undefined
        ? updates.productName.trim()
        : currentOrder.productName,
  };

  // Recalculate the total on the server.
  updatedOrder.total = calculateTotal(
    updatedOrder.quantity,
    updatedOrder.unitPrice
  );

  // Save the updated order.
  orders[index] = updatedOrder;

  return { ...updatedOrder };
}
