
import { NextResponse } from "next/server";

import {
  getAllOrders,
  createOrder,
} from "@/lib/orders";

import {
  validateCreateOrder,
  ValidationError,
} from "@/lib/validation";

// GET /api/orders
// Return all saved orders.
export async function GET() {
  const orders = getAllOrders();

  return NextResponse.json(orders, {
    status: 200,
  });
}

// POST /api/orders
// Create a new order.
export async function POST(request: Request) {
  let body: unknown;

  // Step 1: Read and parse the JSON body.
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  // Step 2: Validate and create the order.
  try {
    const input = validateCreateOrder(body);

    // The server generates the ID, total and status.
    const newOrder = createOrder(input);

    // Step 3: Return the saved order.
    return NextResponse.json(newOrder, {
      status: 201,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Unexpected server errors.
    console.error("Failed to create order:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
