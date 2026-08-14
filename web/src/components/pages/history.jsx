import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import orderController from "../../controllers/orderController.js";

const { statusColors, statusLabels } = orderController;

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [refetchKey, setRefetchKey] = useState(0);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    let cancelled = false;
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await orderController.fetchOrders(search, {
          startDate,
          endDate,
        });
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Failed to load orders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [refetchKey, search, startDate, endDate]);

  const completedOrders = orders.filter((o) => {
    const isCompleted = (o.status || "PENDING") === "COMPLETED";
    const isPaid = o.payements?.some((p) => p.status === "PAID");
    if (!isCompleted || !isPaid) return false;
    if (startDate && o.createdAt) {
      const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
      if (orderDate < startDate) return false;
    }
    if (endDate && o.createdAt) {
      const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
      if (orderDate > endDate) return false;
    }
    return true;
  });

  const filtered = useMemo(() => {
    let result = completedOrders;
    if (filter !== "all") {
      result = result.filter((o) => (o.status || "PENDING") === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          (o.customer?.name || "").toLowerCase().includes(q) ||
          (o.vehicle?.name || "").toLowerCase().includes(q) ||
          (o.vehicle?.plateNumber || "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [completedOrders, filter, search]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortKey === key && sortDirection === "asc") {
      direction = "desc";
    }
    setSortKey(key);
    setSortDirection(direction);
  };

  const getSortValue = (order, key) => {
    switch (key) {
      case "id":
        return order.id;
      case "vehicle":
        return order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model}`.toLowerCase() : "";
      case "customer":
        return order.customer ? order.customer.name.toLowerCase() : "";
      case "staff":
        return order.staff ? order.staff.name.toLowerCase() : "";
      case "services":
        return order.order_items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;
      case "status":
        return order.status || "PENDING";
      case "created":
        return order.createdAt ? new Date(order.createdAt).getTime() : 0;
      default:
        return "";
    }
  };

  const sorted = useMemo(() => {
    const data = [...filtered];
    data.sort((a, b) => {
      const aValue = getSortValue(a, sortKey);
      const bValue = getSortValue(b, sortKey);
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [filtered, sortKey, sortDirection]);

  const dateRangeLabel = useMemo(() => {
    if (!startDate && !endDate) return "";
    if (startDate && endDate) return `${startDate} → ${endDate}`;
    if (startDate) return `From ${startDate}`;
    return `Until ${endDate}`;
  }, [startDate, endDate]);

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const totalCount = filtered.length;

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Order History
          </h1>
          <div className="flex flex-row gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setRefetchKey((k) => k + 1)}
            >
              <span className="material-symbols-outlined mr-1">refresh</span>
              Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-2">
          <div className="flex flex-row gap-2 items-center flex-wrap">
            <span className="text-sm text-gray-500 dark:text-gray-400">Date range:</span>
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => applyPreset(0)}>Today</button>
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => applyPreset(7)}>Last 7 days</button>
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => applyPreset(30)}>Last 30 days</button>
            {dateRangeLabel && (
              <span className="badge badge-primary badge-outline ml-2">
                {dateRangeLabel}
              </span>
            )}
            {dateRangeLabel && (
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={clearDates}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-row">
          <div className="flex flex-row justify-between w-full">
            <div className='flex flex-row gap-2 items-center'>
              <div className="flex flex-row gap-2 items-center">
                <label className="text-sm text-gray-600 dark:text-gray-300">From:</label>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex flex-row gap-2 items-center">
                <label className="text-sm text-gray-600 dark:text-gray-300">To:</label>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <input
              type="text"
              className="input input-bordered input-sm w-64"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-row gap-2 overflow-x-auto pb-1">
          <button
            className={`btn btn-ghost btn-sm ${filter === "all" ? "btn-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({totalCount})
          </button>
          <button
            className={`btn btn-ghost btn-sm ${filter === "COMPLETED" ? "btn-active" : ""}`}
            onClick={() => setFilter("COMPLETED")}
          >
            Completed ({completedOrders.length})
          </button>
        </div>

        <div className="card bg-white dark:bg-gray-950 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <span className="loading loading-spinner loading-lg text-indigo-600"></span>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-error">{error}</p>
                <button
                  className="btn btn-ghost btn-sm mt-2"
                  onClick={() => setRefetchKey((k) => k + 1)}
                >
                  Retry
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No completed orders found.
                </p>
              </div>
            ) : (
              <table className="table">
                <thead>
                <tr>
                  <th className="cursor-pointer" onClick={() => requestSort('id')}>
                    ID {sortKey === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="cursor-pointer" onClick={() => requestSort('vehicle')}>
                      Vehicle {sortKey === 'vehicle' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('customer')}>
                      Customer {sortKey === 'customer' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('staff')}>
                      Staff {sortKey === 'staff' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('services')}>
                      Services {sortKey === 'services' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('status')}>
                      Status {sortKey === 'status' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('created')}>
                      Created {sortKey === 'created' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((order) => {
                    const status = order.status || "PENDING";
                    return (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>
                          {order.vehicle ? (
                            <div>
                              <p className="font-medium">
                                {order.vehicle.brand} {order.vehicle.model}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {order.vehicle.name}
                              </p>
                              {order.vehicle.plateNumber && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {order.vehicle.plateNumber}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              #{order.vehicleId}
                            </span>
                          )}
                        </td>
                        <td>
                          {order.customer ? (
                            <div>
                              <p className="font-medium">
                                {order.customer.name}
                              </p>
                              {order.customer.phone && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {order.customer.phone}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              #{order.customerId}
                            </span>
                          )}
                        </td>
                        <td>
                          {order.staff ? (
                            <p className="font-medium">{order.staff.name}</p>
                          ) : (
                            <span className="text-gray-400">
                              #{order.staffId}
                            </span>
                          )}
                        </td>
                        <td>
                          {order.order_items && order.order_items.length > 0
                            ? order.order_items.reduce(
                                (sum, item) => sum + (item.qty || 0),
                                0,
                              )
                            : "-"}
                        </td>
                        <td>
                          <span
                            className={`badge ${statusColors[status] || "badge-neutral"}`}
                          >
                            {statusLabels[status] || status}
                          </span>
                        </td>
                        <td>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "-"}
                        </td>
                        <td className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Link
                              to={`/orders/${order.id}`}
                              className="btn btn-ghost btn-sm btn-square"
                              title="View"
                            >
                              <span className="material-symbols-outlined">
                                visibility
                              </span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
