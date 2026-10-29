
# Assignment 4 — Nour's Order Desk

## 1. Project Overview

Build a small order management dashboard using Next.js,
TypeScript, and a CRUD API.

The application helps Nour manage customer orders,
identify orders requiring preparation, and correct mistakes.

## 2. Technology Stack

- Next.js App Router
- TypeScript
- REST API using Next.js Route Handlers
- React frontend
- In-memory order storage

## 3. Main Features

- Display all orders
- View order details
- Create a new order
- Edit an existing order
- Delete an order
- Display order status and summary information
- Show loading, empty, success, and error states

## 4. API Design

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/orders | List orders |
| POST | /api/orders | Create order |
| GET | /api/orders/:id | Get one order |
| PATCH | /api/orders/:id | Update order |
| DELETE | /api/orders/:id | Delete order |

## 5. Validation and Error Handling

- Validate incoming request bodies.
- Reject invalid fields and values.
- Return appropriate HTTP status codes.
- Return clear JSON error messages.
- Handle malformed JSON.
- Return 404 for unknown order IDs.
- Ensure failed requests do not modify existing orders.

## 6. Frontend Integration

The frontend communicates with the backend using fetch.

The interface must reflect actual server responses,
rather than pretending an operation succeeded.

Users should receive clear feedback when an action
succeeds or fails.

## 7. Usability

- Responsive layout for desktop and mobile
- Accessible form labels
- Keyboard-accessible controls
- Clear validation messages
- Disabled buttons during submissions
- Confirmation before destructive actions

## 8. Testing Strategy

Test each endpoint independently.

Verify:
- Successful order creation
- Order retrieval
- Successful updates
- Successful deletion
- Invalid input rejection
- Unknown order handling
- Data remains unchanged after failed requests
- Frontend updates after API responses
- Mobile and keyboard usability

Record test results in docs/TESTING.md.

## 9. Documentation

Maintain:
- README.md
- docs/PLAN.md
- docs/API.md
- docs/TESTING.md
- docs/REVIEW.md

## 10. Completion Criteria

The assignment is complete when:

- The required order workflow works end to end.
- API methods and responses are documented.
- Invalid requests are handled safely.
- The frontend reflects server state.
- Required tests pass.
- Documentation and evidence are complete.
- The implementation is committed to GitHub.
