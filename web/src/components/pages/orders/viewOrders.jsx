import { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router";
import orderController, {
  statusColors,
  statusLabels,
} from "../../../controllers/orderController.js";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DetailCard = ({ title, fallback, children }) => (
  <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md flex-1">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
      {title}
    </h2>
    {children || (
      <p className="text-gray-500 dark:text-gray-400">{fallback}</p>
    )}
  </div>
);

const DetailField = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-gray-900 dark:text-white">{value}</p>
  </div>
);

const OrderHeader = ({ title, subtitle, backHref }) => (
  <div className="flex flex-row justify-between items-center mb-4">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">{subtitle}</p>
    </div>
    <Link to={backHref} className="btn btn-ghost">
      <span className="material-symbols-outlined mr-1">arrow_back</span>
      Back
    </Link>
  </div>
);

const OrderMeta = ({ order, payment }) => {
  const status = order?.status || "PENDING";
  const totalAmount = (order?.order_items || []).reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );
  const isPaid = payment?.status === "PAID";

  return (
    <>
      <div className="flex-row flex">
        <span className={`badge ${statusColors[status] || "badge-neutral"}`}>
          {statusLabels[status] || status}
        </span>
      </div>

      <div className="justify-between flex flex-row">
        <div className="flex flex-column gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Created at</p>
          <p className="text-gray-900 dark:text-white">
            {formatDate(order?.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex-row flex gap-6">
        <DetailCard title="Customer" fallback={`Customer ID: #${order?.customerId}`}>
          {order?.customer && (
            <>
              <DetailField label="Name" value={order.customer.name} />
              <DetailField label="Email" value={order.customer.email} />
              <DetailField label="Phone" value={order.customer.phone} />
            </>
          )}
        </DetailCard>

        <DetailCard title="Vehicle" fallback={`Vehicle ID: #${order?.vehicleId}`}>
          {order?.vehicle && (
            <>
              <DetailField label="Name" value={order.vehicle.name} />
              <DetailField
                label="Brand / Model"
                value={`${order.vehicle.brand} ${order.vehicle.model}`}
              />
              <DetailField label="Plate Number" value={order.vehicle.plateNumber} />
            </>
          )}
        </DetailCard>

        <DetailCard title="Staff" fallback={`Staff ID: #${order?.staffId}`}>
          {order?.staff && (
            <>
              <DetailField label="Name" value={order.staff.name} />
              <DetailField label="Email" value={order.staff.email} />
              {order.staff.position && (
                <DetailField label="Position" value={order.staff.position} />
              )}
            </>
          )}
        </DetailCard>
      </div>
    </>
  );
};

const OrderItemsTable = ({ items }) => {
  const totalAmount = (items || []).reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );

  return (
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
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="text-center text-gray-500 dark:text-gray-400 py-4"
              >
                No services in this order.
              </td>
            </tr>
          ) : (
            items.map((item) => (
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
        {items.length > 0 && (
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
  );
};

const OrderInfoCards = ({ order, payment, status }) => (
  <div className="flex flex-col md:flex-row gap-4">
    <DetailCard title="Notes">
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {order?.note || "-"}
      </p>
    </DetailCard>

    <DetailCard title="Service Status">
      <span className={`badge ${statusColors[status] || "badge-neutral"}`}>
        {statusLabels[status] || status}
      </span>
    </DetailCard>

    <DetailCard title="Payment Status">
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
    </DetailCard>
  </div>
);

const OrderActions = ({ order, payment, onComplete, completing }) => {
  const status = order?.status || "PENDING";
  const isPaid = payment?.status === "PAID";
  const showPaymentBtn = status !== "COMPLETED" || !isPaid;

  return (
    <div className="flex flex-col gap-2 max-w-full">
      <div className="flex flex-row gap-2 w-full">
        {(status === "PENDING" || status === "PROCESSING") && (
          <button
            onClick={onComplete}
            className="btn btn-primary w-[50%]"
            disabled={completing}
          >
            {completing ? "Updating..." : "Mark as Completed"}
          </button>
        )}
        {showPaymentBtn && (
          <Link
            to={`/payments/${order?.id}`}
            className="btn btn-secondary w-[50%]"
          >
            Go to Payment
          </Link>
        )}
      </div>
      <button className="btn btn-ghost">Print Service Ticket</button>
    </div>
  );
};

const ViewOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const payment =
    order?.payements && order.payements.length > 0
      ? order.payements[0]
      : null;
  const status = order?.status || "PENDING";
  const backHref = status === "COMPLETED" && payment?.status === "PAID" ? "/history" : "/orders";

  if (loading) {
    return (
      <div className="">
        <OrderHeader title="View Order" subtitle={`Loading order #${id}...`} backHref="/orders" />
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
        <OrderHeader title="View Order" subtitle="View the order here" backHref={backHref} />
        <div className="alert alert-error">
          <span className="material-symbols-outlined">error</span>
          <span>{error || "Order not found."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <OrderHeader title="View Order" subtitle={`View order ID #${order.id}.`} backHref={backHref} />

      {success && (
        <div className="alert alert-success mb-4">
          <span className="material-symbols-outlined">check_circle</span>
          <span>Order marked as completed!</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      <OrderMeta order={order} payment={payment} />

      <OrderItemsTable items={order?.order_items || []} />

      <OrderInfoCards order={order} payment={payment} status={status} />

      <OrderActions
        order={order}
        payment={payment}
        onComplete={handleMarkAsCompleted}
        completing={completing}
      />
    </div>
  );
};

export default ViewOrder;
