# Assignment 4 — Nour's Order Desk

## Review and AI Reflection

### 1. Trace one Add Order action from the form to the Route Handler and back.

When the user fills out the Add Order form and clicks the submit button, the frontend collects the form data and sends a POST request to `/api/orders`.

The POST Route Handler receives the request, validates the submitted data, creates a new order, calculates the total, and assigns an ID and a default Pending status.

If the request is valid, the server returns HTTP 201 Created with the new order.

The frontend reads the API response and updates the displayed orders and summary counts.

### 2. Where is the total calculated, and why is that decision important?

The order total is calculated on the backend using:

**Total = Quantity × Unit Price**

This is important because the server should be responsible for business rules instead of trusting values submitted by the frontend.

For example, an order with quantity 3 and unit price $8 has a total of $24. When the quantity changes to 4, the server recalculates the total to $32.

During testing, the server also calculated the total instead of trusting a client-supplied value of `total: 0`.

### 3. Show one invalid request. Why did it fail, and did stored data remain unchanged?

I tested an invalid PATCH request containing:

```json
{
  "quantity": -5
}
```

The API returned HTTP 400 Bad Request because the quantity must be a positive integer.

I retrieved the order before and after the invalid request. Its quantity remained 2, confirming that the failed update did not modify the stored data.

This test demonstrates that validation protects data integrity.

### 4. What is the difference between PATCH and replacing an entire object?

PATCH updates only the fields included in the request.

For example, sending:

```json
{
  "quantity": 4
}
```

updates the quantity while preserving the existing customer name, product, and other unchanged fields.

Replacing an entire object means supplying a complete new representation of the resource, typically using PUT.

PATCH is useful in this project because users can edit individual order fields without resending the entire order.

### 5. What happens to your orders after a server restart?

The application uses in-memory storage instead of a database.

Orders are stored in the server's memory, so they are not permanently saved. When the server process restarts, the stored orders may be lost or reset to the initial data.

For permanent storage, the application would need a database.

### 6. Which AI suggestion did you correct or verify, and what evidence helped you decide?

One technical decision I reviewed with AI assistance was how to handle PATCH requests without allowing clients to modify server-owned fields.

The challenge was to distinguish between fields that users are allowed to update and fields that must remain protected, such as the order ID.

I verified this behavior by sending a PATCH request attempting to change the `id` field. The API returned HTTP 400 Bad Request with the message `Unknown field: id`.

I then checked that the existing order was still accessible using its original ID.

This confirmed that the API rejects unauthorized field changes while preserving the stored order. It also helped me understand why update validation should explicitly control which fields can be modified.

## Conclusion

This assignment helped me understand how a Next.js frontend communicates with REST API Route Handlers, how backend validation protects stored data, and why API responses should control frontend updates.

By testing successful and invalid requests using Thunder Client and Browser Developer Tools, I verified the main CRUD operations and their HTTP status codes.