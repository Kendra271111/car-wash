import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import orderController from "../../../controllers/orderController.js";

const ViewOrder = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await orderController.fetchOrderById(id);
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Failed to load order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadOrder();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleMarkAsCompleted = async () => {
    setCompleting(true);
    setError(null);
    try {
      await orderController.updateOrderStatus(id, "COMPLETED");
      setSuccess(true);
      setOrder((prev) => (prev ? { ...prev, status: "COMPLETED" } : prev));
      setTimeout(() => {
        setSuccess(false);
        navigate("/orders");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark order as completed.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="">
        <div className="flex flex-row justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              View Order
            </h1>
            <p>Loading order #{id}...</p>
          </div>
          <Link to="/orders" className="btn btn-ghost">
            <span className="material-symbols-outlined mr-1">arrow_back</span>
            Back
          </Link>
        </div>
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <div className="p-8 text-center">
            <span className="loading loading-spinner loading-lg text-indigo-600"></span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="">
        <div className="flex flex-row justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              View Order
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              View the order here
            </p>
          </div>
          {order.status !== "COMPLETED" || !payment ? (
            <Link to="/orders" className="btn btn-ghost">
              <span className="material-symbols-outlined mr-1">arrow_back</span>
              Back to Orders
            </Link>
            ) : (
            <Link to="/history" className="btn btn-ghost">
              <span className="material-symbols-outlined mr-1">arrow_back</span>
              Back to History
            </Link>
            )}
        </div>
        <div className="alert alert-error">
          <span className="material-symbols-outlined">error</span>
          <span>{error || "Order not found."}</span>
        </div>
      </div>
    );
  }

  const statusColors = {
    PENDING: "badge-warning",
    PROCESSING: "badge-info",
    COMPLETED: "badge-success",
    CANCELLED: "badge-error",
  };

  const statusLabels = {
    PENDING: "Waiting",
    PROCESSING: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const status = order.status || "PENDING";
  const createdAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const payment =
    order.payements && order.payements.length > 0 ? order.payements[0] : null;
  const totalAmount = (order.order_items || []).reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            View Order
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View order ID #{order.id}.
          </p>
        </div>
        {order.status !== "COMPLETED" || !payment ? (
          <Link to="/orders" className="btn btn-ghost">
            <span className="material-symbols-outlined mr-1">arrow_back</span>
            Back to Orders
          </Link>
          ) : (
          <Link to="/history" className="btn btn-ghost">
            <span className="material-symbols-outlined mr-1">arrow_back</span>
            Back to History
          </Link>
          )}
      </div>

      <div className="flex-row flex">
        <span className={`badge ${statusColors[status] || "badge-neutral"}`}>
          {statusLabels[status] || status}
        </span>
      </div>

      <div className="justify-between flex flex-row">
        <div className="flex flex-column gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Created at</p>
          <p className="text-gray-900 dark:text-white">{createdAt}</p>
        </div>
      </div>

      <div className="flex-row flex gap-6">
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Customer
          </h2>
          {order.customer ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-gray-900 dark:text-white">
                {order.customer.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Email
              </p>
              <p className="text-gray-900 dark:text-white">
                {order.customer.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Phone
              </p>
              <p className="text-gray-900 dark:text-white">
                {order.customer.phone}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Customer ID: #{order.customerId}
            </p>
          )}
        </div>

        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Vehicle
          </h2>
          {order.vehicle ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-gray-900 dark:text-white">
                {order.vehicle.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Brand / Model
              </p>
              <p className="text-gray-900 dark:text-white">
                {order.vehicle.brand} {order.vehicle.model}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Plate Number
              </p>
              <p className="text-gray-900 dark:text-white">
                {order.vehicle.plateNumber}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Vehicle ID: #{order.vehicleId}
            </p>
          )}
        </div>

        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Staff
          </h2>
          {order.staff ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-gray-900 dark:text-white">
                {order.staff.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Email
              </p>
              <p className="text-gray-900 dark:text-white">
                {order.staff.email}
              </p>
              {order.staff.position && (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Position
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {order.staff.position}
                  </p>
                </>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Staff ID: #{order.staffId}
            </p>
          )}
        </div>
      </div>

      <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Order Items
        </h2>
        <table className="table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Duration (min)</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items || []).length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-500 dark:text-gray-400 py-4"
                >
                  No services in this order.
                </td>
              </tr>
            ) : (
              order.order_items.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">
                    {item.service?.name || `Service #${item.serviceId}`}
                  </td>
                  <td>{item.duration}</td>
                  <td>${Number(item.price).toFixed(2)}</td>
                  <td>{item.qty}</td>
                  <td className="font-medium">
                    ${Number(item.subtotal).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {(order.order_items || []).length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right font-semibold">
                  Total
                </td>
                <td className="font-semibold">${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Notes
          </h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {order.note || "-"}
          </p>
        </div>

        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Service Status
          </h2>
          <span className={`badge ${statusColors[status] || "badge-neutral"}`}>
            {statusLabels[status] || status}
          </span>
        </div>

        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Payment Status
          </h2>
          {payment ? (
            <div className="flex flex-col gap-1">
              <span
                className={`badge ${payment.status === "PAID" ? "badge-success" : "badge-warning"}`}
              >
                {payment.status}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Method: {payment.method}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Amount: ${Number(payment.amount).toFixed(2)}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No payment recorded.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 max-w-full">
        <div className="flex flex-row gap-2 w-full">
          {(order.status === "PENDING" || order.status === "PROCESSING") && (
            <button
              onClick={handleMarkAsCompleted}
              className="btn btn-primary w-[50%]"
              disabled={completing}
            >
              {completing ? "Updating..." : "Mark as Completed"}
            </button>
          )}
          {order.status !== "COMPLETED" || !payment ? (
            <Link
              to={`/payments/${order.id}`}
              className="btn btn-secondary w-[50%]"
            >
              Go to Payment
            </Link>
          ) : (
            <div></div>
          )}
        </div>
        <button className="btn btn-ghost">Print Service Ticket</button>
      </div>
    </div>
  );
};

export default ViewOrder;
