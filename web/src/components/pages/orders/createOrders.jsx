import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import orderController from "../../../controllers/orderController.js";
import serviceController from "../../../controllers/serviceController.js";
import vehicleController from "../../../controllers/vehicleController.js";
import customerController from "../../../controllers/customerController.js";
import staffController from "../../../controllers/staffController.js";
import useCartStore from "../../../stores/cartStore.js";
import SearchableSelect from "../../../components/ui/searchableSelect.jsx";

const CreateOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [options, setOptions] = useState({ services: [], vehicles: [], customers: [], staff: [] });
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState({
    vehicleId: "",
    customerId: "",
    staffId: "",
    status: "PENDING",
    note: "",
  });

  const cartItems = useCartStore((s) => s.items);
  const setServiceOptions = useCartStore((s) => s.setServiceOptions);
  const addEmptyItem = useCartStore((s) => s.addEmptyItem);
  const selectService = useCartStore((s) => s.selectService);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const totalItems = useCartStore((s) => s.totalItems);
  const totalDuration = useCartStore((s) => s.totalDuration);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      setInitialLoading(true);
      try {
        const [vehicles, customers, staff, services] = await Promise.all([
          vehicleController.fetchVehicles(),
          customerController.fetchCustomers(),
          staffController.getStaff(),
          serviceController.fetchServices(),
        ]);
        if (!cancelled) {
          const activeStaff = staff.filter((s) => s.isActive);
          setOptions({ services, vehicles, customers, staff: activeStaff });
          setServiceOptions(services);
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };
    loadOptions();
    return () => {
      cancelled = true;
    };
  }, [setServiceOptions]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      setSuccess(false);
      setForm({ vehicleId: "", customerId: "", staffId: "", status: "PENDING", note: "" });
    }, 1500);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const validItems = cartItems.filter((item) => !item.empty && item.serviceId);
      if (validItems.length === 0) {
        setError("Please add at least one service.");
        return;
      }
      if (!form.staffId) {
        setError("Please select a staff member.");
        return;
      }
      const orderData = {
        vehicleId: Number(form.vehicleId),
        customerId: Number(form.customerId),
        staffId: Number(form.staffId),
        status: form.status,
        note: form.note,
        items: validItems.map((item) => ({
          serviceId: item.serviceId,
          duration: Number(item.duration),
          amount: item.subtotal,
          price: item.price,
          qty: item.quantity,
          subtotal: item.subtotal,
        })),
      };
      await orderController.createOrder(orderData);
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = cartItems.length === 0;
  const isSubmitting = loading || isEmpty;

  if (initialLoading) {
    return (
      <div className="">
        <div className="flex flex-row justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Create Order
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create a new order for the car wash service.
            </p>
          </div>
          <Link to="/orders" className="btn btn-ghost">
            <span className="material-symbols-outlined mr-1">arrow_back</span>
            Back to Orders
          </Link>
        </div>
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <div className="p-8 text-center">
            <span className="loading loading-spinner loading-lg text-teal-600"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex flex-row justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Create Order
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create a new order for the car wash service.
          </p>
        </div>
        <Link to="/orders" className="btn btn-ghost">
          <span className="material-symbols-outlined mr-1">arrow_back</span>
          Back to Orders
        </Link>
      </div>

      {success && (
        <div className="alert alert-success mb-4">
          <span className="material-symbols-outlined">check_circle</span>
          <span>Order created successfully!</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Details
          </h2>
          <div className="flex-col flex gap-4">
            <div className="w-full flex flex-row gap-5">
              <div className="w-full">
                <SearchableSelect
                  label="Vehicle"
                  options={options.vehicles}
                  value={form.vehicleId}
                  onChange={(value) => updateField("vehicleId", value)}
                  placeholder="Select vehicle"
                  getOptionLabel={(vehicle) =>
                    `${vehicle.name} - ${vehicle.plateNumber}`
                  }
                  required
                />
              </div>
              <div className="w-full">
                <SearchableSelect
                  label="Customer"
                  options={options.customers}
                  value={form.customerId}
                  onChange={(value) => updateField("customerId", value)}
                  placeholder="Select customer"
                  getOptionLabel={(customer) =>
                    `${customer.name} (${customer.email})`
                  }
                  required
                />
              </div>
              <div className="w-full">
                <SearchableSelect
                  label="Staff"
                  options={options.staff}
                  value={form.staffId}
                  onChange={(value) => updateField("staffId", value)}
                  placeholder="Select staff"
                  getOptionLabel={(staff) =>
                    `${staff.name}${staff.position ? ` - ${staff.position}` : ""}`
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="PENDING">Waiting</option>
                <option value="PROCESSING">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <div className="flex flex-row justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Services
            </h2>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => addEmptyItem()}
            >
              <span className="material-symbols-outlined mr-1">add</span>
              Add
            </button>
          </div>

          {initialLoading ? (
            <div className="p-8 text-center">
              <span className="loading loading-spinner loading-lg text-teal-600"></span>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-64 overflow-y-auto border-b border-gray-200 dark:border-gray-700">
              <table className="table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Duration (min)</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center text-gray-500 dark:text-gray-400 py-4"
                      >
                        No services added yet. Click "Add" to add a service.
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((item, index) => {
                      const selectedServiceIds = cartItems
                        .filter((i) => !i.empty && i.serviceId && i !== item)
                        .map((i) => i.serviceId);

                      return (
                        <tr key={index}>
                          <td>
                            {item.empty ? (
                              <select
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
                                value=""
                                onChange={(e) => {
                                  const service = options.services.find(
                                    (s) => s.id === Number(e.target.value),
                                  );
                                  if (service) {
                                    selectService(index, service);
                                  }
                                }}
                                autoFocus
                              >
                                <option value="" disabled>
                                  Select a service...
                                </option>
                                {options.services?.map((service) => {
                                  const isSelected = selectedServiceIds.includes(service.id);
                                  return (
                                    <option key={service.id} value={service.id} disabled={isSelected}>
                                      {service.name} {isSelected ? '(already added)' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                            ) : (
                              <span className="font-medium">{item.service}</span>
                            )}
                          </td>
                        <td>{item.empty ? "-" : item.duration}</td>
                        <td>{item.empty ? "-" : item.price.toFixed(2)}</td>
                        <td>
                          {!item.empty && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm btn-square"
                                onClick={() =>
                                  updateQuantity(index, item.quantity - 1)
                                }
                              >
                                <span className="material-symbols-outlined">
                                  remove
                                </span>
                              </button>
                              <span className="w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm btn-square"
                                onClick={() =>
                                  updateQuantity(index, item.quantity + 1)
                                }
                              >
                                <span className="material-symbols-outlined">
                                  add
                                </span>
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          {item.empty ? (
                            "-"
                          ) : (
                            <span className="font-medium">
                              {item.subtotal.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-square text-error"
                            onClick={() => removeItem(index)}
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>
                        </td>
                      </tr>
                    )}
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-5 ">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
              placeholder="Add any notes for this order..."
            />
          </div>

          <div className="flex gap-10 flex-row justify-end mt-4 pt-4">
            <div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Items
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalItems()}
                </p>
              </div>
            </div>
            <div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Duration
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalDuration()} min
                </p>
              </div>
            </div>
            <div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Price
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalAmount().toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Link to="/orders" className="btn btn-ghost">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrders;
