
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Order, OrderStatus } from "@/types/order";

type EditForm = {
  customerName: string;
  phone: string;
  productName: string;
  quantity: string;
  unitPrice: string;
};

export default function Home() {
  // Orders list.
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  // Create order form.
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Update status.
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, OrderStatus>
  >({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  // Delete order.
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // View order details.
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState("");

  // Edit order.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // Summary counts derived from actual order data.
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  // GET /api/orders
  async function loadOrders() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const data: Order[] = await response.json();

      setOrders(data);
      setHasLoaded(true);
      setDetailsOrder(null);
      setDetailsError("");
      setEditingId(null);
      setEditForm(null);
    } catch {
      setError("Unable to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // POST /api/orders
  async function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (creating) return;

    setCreating(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          phone,
          productName,
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      const newOrder = data as Order;

      setOrders((previous) => [...previous, newOrder]);
      setHasLoaded(true);
      setError("");
      setSuccessMessage("Order created successfully!");

      setCustomerName("");
      setPhone("");
      setProductName("");
      setQuantity("1");
      setUnitPrice("");
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to create order. Please try again."
      );
    } finally {
      setCreating(false);
    }
  }

  // PATCH /api/orders/:id — update status.
  async function handleUpdateStatus(order: Order) {
    if (updatingId !== null || deletingId !== null || savingEdit) {
      return;
    }

    const newStatus = selectedStatuses[order.id] ?? order.status;

    setUpdatingId(order.id);
    setUpdateError("");
    setUpdateMessage("");

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order");
      }

      const updatedOrder = data as Order;

      setOrders((previous) =>
        previous.map((existing) =>
          existing.id === updatedOrder.id
            ? updatedOrder
            : existing
        )
      );

      setDetailsOrder((previous) =>
        previous?.id === updatedOrder.id
          ? updatedOrder
          : previous
      );

      setSelectedStatuses((previous) => ({
        ...previous,
        [updatedOrder.id]: updatedOrder.status,
      }));

      setUpdateMessage("Order status updated successfully!");
    } catch (err) {
      setUpdateError(
        err instanceof Error
          ? err.message
          : "Unable to update order. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // DELETE /api/orders/:id
  async function handleDeleteOrder(order: Order) {
    if (
      deletingId !== null ||
      updatingId !== null ||
      savingEdit
    ) {
      return;
    }

    setDeletingId(order.id);
    setDeleteError("");
    setDeleteMessage("");

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });

      // Successful DELETE returns HTTP 204 with no body.
      // Only read JSON when the server returns an error.
      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.error || "Failed to delete order"
        );
      }

      // Remove the order from the frontend list.
      setOrders((previous) =>
        previous.filter(
          (existing) => existing.id !== order.id
        )
      );

      // Remove the saved status selection.
      setSelectedStatuses((previous) => {
        const updated = { ...previous };
        delete updated[order.id];
        return updated;
      });

      // Close the details panel if necessary.
      setDetailsOrder((previous) =>
        previous?.id === order.id ? null : previous
      );

      // Close the edit form if necessary.
      if (editingId === order.id) {
        setEditingId(null);
        setEditForm(null);
      }

      setHasLoaded(true);
      setDeleteMessage("Order deleted successfully!");
      setOrderToDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Unable to delete order. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // GET /api/orders/:id — view details.
  async function handleViewDetails(order: Order) {
    if (detailsOrder?.id === order.id) {
      setDetailsOrder(null);
      setDetailsError("");
      return;
    }

    if (detailsLoadingId !== null) return;

    setDetailsLoadingId(order.id);
    setDetailsError("");
    setDetailsOrder(null);

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load order details"
        );
      }

      setDetailsOrder(data as Order);
    } catch (err) {
      setDetailsError(
        err instanceof Error
          ? err.message
          : "Unable to load order details. Please try again."
      );
    } finally {
      setDetailsLoadingId(null);
    }
  }

  // Open the edit form with the order's current values.
  function handleStartEdit(order: Order) {
    setEditingId(order.id);
    setEditError("");
    setEditMessage("");
    setOrderToDelete(null);

    setEditForm({
      customerName: order.customerName,
      phone: order.phone,
      productName: order.productName,
      quantity: String(order.quantity),
      unitPrice: String(order.unitPrice),
    });
  }

  // Cancel editing without sending an API request.
  function handleCancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setEditError("");
  }

  // PATCH /api/orders/:id — edit order information.
  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId || !editForm || savingEdit) {
      return;
    }

    setSavingEdit(true);
    setEditError("");
    setEditMessage("");

    try {
      const response = await fetch(
        `/api/orders/${editingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName: editForm.customerName,
            phone: editForm.phone,
            productName: editForm.productName,
            quantity: Number(editForm.quantity),
            unitPrice: Number(editForm.unitPrice),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to edit order"
        );
      }

      const updatedOrder = data as Order;

      // Update the list using the server response.
      setOrders((previous) =>
        previous.map((existing) =>
          existing.id === updatedOrder.id
            ? updatedOrder
            : existing
        )
      );

      // Keep the details panel synchronized.
      setDetailsOrder((previous) =>
        previous?.id === updatedOrder.id
          ? updatedOrder
          : previous
      );

      setEditMessage("Order updated successfully!");
      setEditingId(null);
      setEditForm(null);
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Unable to edit order. Please try again."
      );
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1>Nour&apos;s Order Desk</h1>
      <p>Welcome to the order management dashboard.</p>

      {/* Order summary */}
      <section aria-label="Order summary">
        <h2>Order Summary</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              flex: "1 1 150px",
            }}
          >
            <h3>Total Orders</h3>
            <p>{totalOrders}</p>
          </div>

          <div
            style={{
              padding: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              flex: "1 1 150px",
            }}
          >
            <h3>Pending Orders</h3>
            <p>{pendingOrders}</p>
          </div>

          <div
            style={{
              padding: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              flex: "1 1 150px",
            }}
          >
            <h3>Delivered Orders</h3>
            <p>{deliveredOrders}</p>
          </div>
        </div>
      </section>

      <h2>Create New Order</h2>

      <form onSubmit={handleCreateOrder}>
        <div>
          <label htmlFor="customerName">
            Customer Name
          </label>
          <br />
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(event) =>
              setCustomerName(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="phone">
            Phone Number
          </label>
          <br />
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="productName">
            Product Name
          </label>
          <br />
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(event) =>
              setProductName(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="quantity">
            Quantity
          </label>
          <br />
          <input
            id="quantity"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) =>
              setQuantity(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="unitPrice">
            Unit Price ($)
          </label>
          <br />
          <input
            id="unitPrice"
            type="number"
            min="0"
            step="0.01"
            value={unitPrice}
            onChange={(event) =>
              setUnitPrice(event.target.value)
            }
            required
          />
        </div>

        <br />

        <button
          type="submit"
          disabled={creating}
        >
          {creating
            ? "Creating Order..."
            : "Create Order"}
        </button>
      </form>

      {formError && (
        <p role="alert">{formError}</p>
      )}

      {successMessage && (
        <p role="status">{successMessage}</p>
      )}

      <hr />

      <h2>Order Management</h2>
      <p>View and manage customer orders below.</p>

      <button
        type="button"
        onClick={loadOrders}
        disabled={loading}
      >
        {loading
          ? "Loading orders..."
          :error
          ? "Retry Loading Orders"
          : "Load Orders"}
      </button>

      {error && (
        <p role="alert">{error}</p>
      )}

      {updateError && (
        <p role="alert">{updateError}</p>
      )}

      {updateMessage && (
        <p role="status">{updateMessage}</p>
      )}

      {deleteError && (
        <p role="alert">{deleteError}</p>
      )}

      {deleteMessage && (
        <p role="status">{deleteMessage}</p>
      )}

      {detailsError && (
        <p role="alert">{detailsError}</p>
      )}

      {editMessage && (
        <p role="status">{editMessage}</p>
      )}

      {hasLoaded &&
        !loading &&
        !error &&
        orders.length === 0 && (
          <p>No orders found.</p>
        )}

      {orders.length > 0 && (
        <section aria-label="Customer orders">
          <h3>Customer Orders</h3>

          <ul>
            {orders.map((order) => (
              <li
                key={order.id}
                style={{
                  marginBottom: "24px",
                }}
              >
                <strong>
                  {order.customerName}
                </strong>

                {" — "}
                {order.productName}

                {" — Quantity: "}
                {order.quantity}

                {" — Total: $"}
                {order.total.toFixed(2)}

                {" — Status: "}
                {order.status}

                <div
                  style={{
                    marginTop: "8px",
                  }}
                >
                  <label
                    htmlFor={`status-${order.id}`}
                  >
                    Change Status:{" "}
                  </label>

                  <select
                    id={`status-${order.id}`}
                    value={
                      selectedStatuses[order.id] ??
                      order.status
                    }
                    onChange={(event) =>
                      setSelectedStatuses(
                        (previous) => ({
                          ...previous,
                          [order.id]:
                            event.target
                              .value as OrderStatus,
                        })
                      )
                    }
                    disabled={
                      updatingId !== null ||
                      deletingId !== null ||
                      savingEdit
                    }
                  >
                    <option value="Pending">
                      Pending
                    </option>
                    <option value="Preparing">
                      Preparing
                    </option>
                    <option value="Delivered">
                      Delivered
                    </option>
                  </select>

                  {" "}

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(order)
                    }
                    disabled={
                      updatingId !== null ||
                      deletingId !== null ||
                      savingEdit
                    }
                  >
                    {updatingId === order.id
                      ? "Updating..."
                      : "Update Status"}
                  </button>

                  {" "}

                  <button
                    type="button"
                    onClick={() =>
                      handleViewDetails(order)
                    }
                    disabled={
                      detailsLoadingId !== null
                    }
                    aria-expanded={
                      detailsOrder?.id ===
                      order.id
                    }
                  >
                    {detailsLoadingId ===
                    order.id
                      ? "Loading Details..."
                      : detailsOrder?.id ===
                        order.id
                      ? "Hide Details"
                      : "View Details"}
                  </button>

                  {" "}

                  <button
                    type="button"
                    onClick={() =>
                      handleStartEdit(order)
                    }
                    disabled={
                      savingEdit ||
                      updatingId !== null ||
                      deletingId !== null
                    }
                    aria-expanded={
                      editingId === order.id
                    }
                  >
                    {editingId === order.id
                      ? "Editing..."
                      : "Edit Order"}
                  </button>

                  {" "}

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError("");
                      setOrderToDelete(order);
                    }}
                    disabled={
                      updatingId !== null ||
                      deletingId !== null ||
                      savingEdit
                    }
                  >
                    Delete Order
                  </button>
                </div>

                {/* Order details */}
                {detailsOrder?.id ===
                  order.id && (
                  <section
                    aria-label={`Details for ${order.customerName}`}
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      border:
                        "1px solid #999",
                    }}
                  >
                    <h4>Order Details</h4>

                    <p>
                      <strong>
                        Order ID:
                      </strong>{" "}
                      {detailsOrder.id}
                    </p>

                    <p>
                      <strong>
                        Customer:
                      </strong>{" "}
                      {detailsOrder.customerName}
                    </p>

                    <p>
                      <strong>
                        Phone:
                      </strong>{" "}
                      {detailsOrder.phone}
                    </p>

                    <p>
                      <strong>
                        Product:
                      </strong>{" "}
                      {detailsOrder.productName}
                    </p>

                    <p>
                      <strong>
                        Quantity:
                      </strong>{" "}
                      {detailsOrder.quantity}
                    </p>

                    <p>
                      <strong>
                        Unit Price:
                      </strong>{" "}
                      $
                      {detailsOrder.unitPrice.toFixed(
                        2
                      )}
                    </p>

                    <p>
                      <strong>
                        Total:
                      </strong>{" "}
                      $
                      {detailsOrder.total.toFixed(
                        2
                      )}
                    </p>

                    <p>
                      <strong>
                        Status:
                      </strong>{" "}
                      {detailsOrder.status}
                    </p>
                  </section>
                )}

                {/* Edit order */}
                {editingId === order.id &&
                  editForm && (
                    <section
                      aria-label={`Edit order for ${order.customerName}`}
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        border:
                          "1px solid #999",
                      }}
                    >
                      <h4>Edit Order</h4>

                      <form
                        onSubmit={
                          handleSaveEdit
                        }
                      >
                        <div>
                          <label htmlFor="editCustomerName">
                            Customer Name
                          </label>
                          <br />
                          <input
                            id="editCustomerName"
                            type="text"
                            value={
                              editForm.customerName
                            }
                            onChange={(
                              event
                            ) =>
                              setEditForm({
                                ...editForm,
                                customerName:
                                  event.target
                                    .value,
                              })
                            }
                            disabled={
                              savingEdit
                            }
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="editPhone">
                            Phone Number
                          </label>
                          <br />
                          <input
                            id="editPhone"
                            type="tel"
                            value={
                              editForm.phone
                            }
                            onChange={(
                              event
                            ) =>
                              setEditForm({
                                ...editForm,
                                phone:
                                  event.target
                                    .value,
                              })
                            }
                            disabled={
                              savingEdit
                            }
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="editProductName">
                            Product Name
                          </label>
                          <br />
                          <input
                            id="editProductName"
                            type="text"
                            value={
                              editForm.productName
                            }
                            onChange={(
                              event
                            ) =>
                              setEditForm({
                                ...editForm,
                                productName:
                                  event.target
                                    .value,
                              })
                            }
                            disabled={
                              savingEdit
                            }
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="editQuantity">
                            Quantity
                          </label>
                          <br />
                          <input
                            id="editQuantity"
                            type="number"
                            min="1"
                            step="1"
                            value={
                              editForm.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              setEditForm({
                                ...editForm,
                                quantity:
                                  event.target
                                    .value,
                              })
                            }
                            disabled={
                              savingEdit
                            }
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="editUnitPrice">
                            Unit Price ($)
                          </label>
                          <br />
                          <input
                            id="editUnitPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              editForm.unitPrice
                            }
                            onChange={(
                              event
                            ) =>
                              setEditForm({
                                ...editForm,
                                unitPrice:
                                  event.target
                                    .value,
                              })
                            }
                            disabled={
                              savingEdit
                            }
                            required
                          />
                        </div>

                        <br />

                        <button
                          type="submit"
                          disabled={
                            savingEdit
                          }
                        >
                          {savingEdit
                            ? "Saving..."
                            : "Save Changes"}
                        </button>

                        {" "}

                        <button
                          type="button"
                          onClick={
                            handleCancelEdit
                          }
                          disabled={
                            savingEdit
                          }
                        >
                          Cancel
                        </button>
                      </form>

                      {editError && (
                        <p role="alert">
                          {editError}
                        </p>
                      )}
                    </section>
                  )}

                {/* Delete confirmation */}
                {orderToDelete?.id ===
                  order.id && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "12px",
                      border:
                        "1px solid #999",
                    }}
                  >
                    <p>
                      Are you sure you want
                      to delete the order
                      for{" "}
                      <strong>
                        {order.customerName}
                      </strong>
                      ?
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteOrder(
                          order
                        )
                      }
                      disabled={
                        deletingId !== null
                      }
                    >
                      {deletingId ===
                      order.id
                        ? "Deleting..."
                        : "Yes, Delete"}
                    </button>

                    {" "}

                    <button
                      type="button"
                      onClick={() =>
                        setOrderToDelete(
                          null
                        )
                      }
                      disabled={
                        deletingId !== null
                      }
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
