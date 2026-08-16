import { useEffect, useState, useMemo, useRef } from "react";
import { toPng } from "html-to-image";
import { Link, useParams, useNavigate } from "react-router";
import orderController, {
  statusColors,
  statusLabels,
} from "../../../controllers/orderController.js";
import { pdf, Document, Page, View, Image, StyleSheet } from "@react-pdf/renderer";

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

const OrderMeta = ({ order }) => {
  const status = order?.status || "PENDING";

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

const OrderActions = ({ order, payment, onComplete, completing, onPrint }) => {
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
      <button className="btn btn-ghost" onClick={onPrint}>Print Service Ticket</button>
    </div>
  );
};

const InvoiceModal = ({ order, payment, onClose }) => {
  const invoiceRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  if (!order || !onClose) return null;
  const status = order.status || "PENDING";
  const totalAmount = (order.order_items || []).reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const isPaid = payment?.status === "PAID";
  const serviceCount = (order.order_items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalDuration = (order.order_items || []).reduce((sum, item) => sum + (item.duration || 0), 0);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const InvoicePDFDocument = () => (
        <Document>
          <Page size="A4" style={pdfStyles.page}>
            <Image src={dataUrl} style={pdfStyles.image} />
          </Page>
        </Document>
      );

      const blob = await pdf(<InvoicePDFDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-order-${order.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  const pdfStyles = StyleSheet.create({
    page: {
      padding: 0,
      flexDirection: "row",
      backgroundColor: "#ffffff",
    },
    image: {
      width: "100%",
      height: "auto",
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div ref={invoiceRef} className="relative bg-white dark:bg-gray-900 w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">WASHINGTON</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Service Ticket</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.id}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Customer</p>
                {order.customer ? (
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium text-gray-900 dark:text-white">{order.customer.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.phone}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">Customer #{order.customerId}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Vehicle</p>
                {order.vehicle ? (
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium text-gray-900 dark:text-white">{order.vehicle.brand} {order.vehicle.model}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.vehicle.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.vehicle.plateNumber}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">Vehicle #{order.vehicleId}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Service Details</p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.order_items || []).map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <td className="py-3 text-sm text-gray-900 dark:text-white">{item.service?.name || `Service #${item.serviceId}`}</td>
                    <td className="py-3 text-sm text-center text-gray-600 dark:text-gray-300">{item.qty}</td>
                    <td className="py-3 text-sm text-center text-gray-600 dark:text-gray-300">{item.duration} min</td>
                    <td className="py-3 text-sm text-right text-gray-600 dark:text-gray-300">${Number(item.price).toFixed(2)}</td>
                    <td className="py-3 text-sm text-right font-medium text-gray-900 dark:text-white">${Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Services</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{serviceCount} service(s)</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Duration</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{totalDuration} min</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Status</p>
                <span className={`badge ${statusColors[status] || 'badge-neutral'}`}>
                  {statusLabels[status] || status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Payment</p>
                {payment ? (
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>{payment.status}</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{payment.method}</p>
                    {isPaid && (
                      <>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Paid: ${Number(payment.amount).toFixed(2)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Change: ${Number(payment.change).toFixed(2)}</p>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Unpaid</p>
                )}
              </div>
            </div>
          </div>

          {order.note && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{order.note}</p>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">Staff: {order.staff?.name || `Staff #${order.staffId}`}</p>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
              <button className="btn btn-primary btn-sm" onClick={handleDownloadPDF} disabled={downloading}>
                {downloading ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
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
  const [showInvoice, setShowInvoice] = useState(false);

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
        onPrint={() => setShowInvoice(true)}
      />
      {showInvoice && order && (
        <InvoiceModal
          key="invoice-modal"
          order={order}
          payment={payment}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};

export default ViewOrder;
