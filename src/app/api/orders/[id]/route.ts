
import { NextResponse } from "next/server";
import {
  getOrderById,
  updateOrder,
  deleteOrder,
} from "@/lib/orders";
import {
  validateUpdateOrder,
  ValidationError,
} from "@/lib/validation";

// GET /api/orders/:id
// Retrieve one order using its unique ID.
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const order = getOrderById(id);

  // Return 404 when the order does not exist.
  if (!order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  // Return the requested order.
  return NextResponse.json(order, {
    status: 200,
  });
}

// PATCH /api/orders/:id
// Update an existing order.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  try {
    const updates = validateUpdateOrder(body);
    const updatedOrder = updateOrder(id, updates);

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOrder, {
      status: 200,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error("Failed to update order:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/:id
// Delete an existing order.
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const deleted = deleteOrder(id);

  // Return 404 if the order does not exist.
  if (!deleted) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  // Return 204 No Content after successful deletion.
  return new Response(null, {
    status: 204,
  });
}
