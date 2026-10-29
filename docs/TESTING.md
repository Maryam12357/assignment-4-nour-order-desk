# Assignment 4 — Nour's Order Desk

## Testing Report

### 1. Testing Objective

The purpose of testing is to verify that Nour's Order Desk correctly performs CRUD operations, validates incoming requests, handles errors safely, preserves data integrity, and updates the frontend based on actual API responses.

The application uses Next.js App Router, TypeScript, REST API route handlers, and in-memory storage.

### 2. Testing Environment

- **Application:** Nour's Order Desk
- **Framework:** Next.js with TypeScript
- **Server:** Local development server
- **URL:** http://localhost:3000
- **API testing tools:** Thunder Client and Browser Developer Tools
- **Frontend testing tools:** Browser Developer Tools, including Console, Network, and responsive device mode
- **Testing approach:** Manual API, frontend, validation, and usability testing

### 3. API CRUD Testing

| Test | Expected Result | Recorded Result |
|---|---|---|
| GET /api/orders | HTTP 200 and an array of orders | Passed |
| POST /api/orders with valid data | HTTP 201, unique ID, calculated total, Pending status | Passed |
| GET /api/orders/:id | HTTP 200 and matching order | Passed |
| PATCH /api/orders/:id | HTTP 200 and updated order | Passed |
| PATCH order status | HTTP 200 and updated status | Passed |
| DELETE /api/orders/:id | HTTP 204 with no response body | Passed |
| GET deleted order | HTTP 404, Order not found | Passed |

### 4. API Validation and Error Testing

| Test | Input | Expected Result | Recorded Result |
|---|---|---|---|
| G.1 Negative quantity | quantity: -2 | HTTP 400 | Passed |
| G.2 Missing customer name | customerName omitted | HTTP 400 | Passed |
| G.3 Malformed JSON | Incomplete JSON body | HTTP 400 | Passed |
| G.4 Invalid status | status: "Cancelled" | HTTP 400 | Passed |
| G.5 Unknown order ID | GET nonexistent ID | HTTP 404 | Passed |
| G.6 Invalid update | PATCH quantity: -5 | HTTP 400, order unchanged | Passed |
| G.7 Unknown deletion | DELETE nonexistent ID | HTTP 404 | Passed |
| G.8 Empty PATCH | Empty object {} | HTTP 400 | Passed |
| G.9 Unexpected field | PATCH id: "new-fake-id" | HTTP 400 | Passed |
| Blank phone | Empty phone string | HTTP 400 | Passed |
| Invalid quantities | 0, -1, and 1.5 | HTTP 400 | Passed |
| Invalid unit price | Negative or non-numeric price | HTTP 400 | Passed |
| Invalid status | status: "Flying" | HTTP 400 | Passed |
| PATCH unknown ID | Update nonexistent order | HTTP 404 | Passed |
| DELETE unknown ID | Delete nonexistent order | HTTP 404 | Passed |

The API returned clear JSON error messages for invalid requests.

### 5. Data Integrity and Business Rules Testing

**Test A — Invalid quantity does not modify an order**

An existing order was retrieved before attempting an invalid PATCH request.

The API received:

```json
{
  "quantity": -5
}
```

Observed results:

- HTTP status: 400
- Error: Quantity must be a positive integer
- Quantity after failed update: 2
- Comparison of the order before and after: unchanged

**Result: Passed.**

**Test B — Server-owned order ID cannot be changed**

A PATCH request attempted to update the `id` field.

Observed results:

- HTTP status: 400
- Error: Unknown field: id
- The existing order remained accessible with its original ID

**Result: Passed.**

**Test C — Server calculates the order total**

An order was created with:

- Product: Vanilla Candle
- Quantity: 3
- Unit price: $8
- Server-calculated total: $24

The quantity was updated to 4.

Observed results:

- HTTP status: 200
- Updated quantity: 4
- Updated total: $32

An additional test supplied `total: 0` alongside valid editable data. The server calculated the total from quantity and unit price rather than trusting the submitted total.

**Result: Passed.**

**Test D — Update quantity without resending customer name**

A PATCH request updated only the quantity.

The API preserved the existing customer name and other unchanged fields.

**Result: Passed.**

**Test E — Deleted orders are no longer accessible**

An existing order was deleted successfully.

Observed results:

- DELETE returned HTTP 204 with an empty body.
- A subsequent GET using the deleted ID returned HTTP 404.
- PATCH and DELETE requests using the deleted ID also returned HTTP 404.

**Result: Passed.**

### 6. Frontend Functional Testing

| Feature | Recorded Result |
|---|---|
| Create a new order | Passed |
| Display existing orders | Passed |
| View order details | Passed |
| Edit customer and order information | Passed |
| Recalculate total after editing quantity | Passed |
| Cancel editing without saving | Passed |
| Change order status | Passed |
| Delete order with confirmation | Passed |
| Cancel deletion | Passed |
| Update order summary counts | Passed |
| Display success messages | Passed |
| Display empty state | Previously tested |
| Display API error messages | Partially tested |

Example:

- Product: Vanilla Candle
- Quantity: 4
- Unit price: $12.50
- Calculated total: $50.00

The frontend displayed the updated quantity and total after the server accepted the change.

The order summary cards were also checked after creating, updating, and deleting orders.

### 7. Usability and Accessibility Testing

| Test | Recorded Result |
|---|---|
| Visible labels for form fields | Observed |
| Disabled buttons during submissions | Implemented; further verification recommended |
| Confirmation before deletion | Passed |
| Responsive layout at 375px | Passed |
| Keyboard navigation using Tab and Enter | Passed |
| Loading and error states during simulated network failure | Pending |

**Mobile responsiveness**

The application was tested at a viewport width of 375px.

The order creation form and order management sections remained readable and usable. Action buttons adapted to the available screen width.

**Keyboard navigation**

The application was tested using Tab and Enter.

Form controls and interactive buttons were accessible through keyboard navigation.

### 8. Thunder Client Acceptance Testing

Thunder Client was used to independently verify the REST API endpoints.

A collection named **Assignment 4 - API Tests** was created with these requests:

1. GET - List All Orders
2. POST - Create Order
3. PATCH - Update Order
4. DELETE - Delete Order

The saved requests use the local API at http://localhost:3000/api/orders.

**Recorded HTTP responses**

| HTTP Method | Operation | Status | Result |
|---|---|---|---|
| GET | List all orders | 200 OK | Passed |
| POST | Create a valid order | 201 Created | Passed |
| PATCH | Update an existing order | 200 OK | Passed |
| DELETE | Delete an existing order | 204 No Content | Passed |
| POST | Submit negative quantity | 400 Bad Request | Passed |
| GET | Read a deleted order | 404 Not Found | Passed |



### 9. Screenshot Evidence

The following screenshots were captured during API testing and saved in the `docs/screenshots/` folder.

| Screenshot | Evidence |
|---|---|
| `screenshots/GET_200.png` | Successful GET request returning HTTP 200 |
| `screenshots/POST_201.png` | Successful order creation returning HTTP 201 |
| `screenshots/PATCH_200.png` | Successful order update returning HTTP 200 |
| `screenshots/DELETE_204.png` | Successful deletion returning HTTP 204 |
| `screenshots/INVALID_400.png` | Negative quantity rejected with HTTP 400 |
| `screenshots/NOT_FOUND_404.png` | Deleted order ID returning HTTP 404 |

Additional screenshots were captured during frontend CRUD and responsive-layout testing.

The Thunder Client collection, **Assignment 4 - API Tests**, was exported as `Assignment-4-API-Tests.json` and saved in the `docs/` folder.

The collection contains saved GET, POST, PATCH, and DELETE requests for repeating the main CRUD tests.
### 10. Known Limitations

- Orders are stored in memory and may be lost when the development server restarts.
- The application does not use a database or persistent storage.
- Testing was performed manually in a local development environment.
- Simulated network-failure behavior and disabled-button behavior require additional verification.
- Automated tests have not been documented.

### 11. Testing Conclusion

The main CRUD operations, API validation checks, data integrity tests, and Thunder Client acceptance tests were successful.

The backend returns appropriate HTTP status codes, rejects invalid requests, protects server-owned fields, recalculates order totals, and preserves existing data after failed updates.

The frontend correctly reflects successful server changes. Mobile responsiveness and keyboard navigation were also tested.

The collected screenshots and saved Thunder Client requests provide evidence of the completed tests.

Further verification of network-failure handling and submission-state behavior is recommended before final submission.