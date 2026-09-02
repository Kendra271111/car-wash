import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import orderController, {
  statusColors,
  statusLabels,
} from '../../../controllers/orderController'
import { pdf, Document, Page, View, StyleSheet, Text } from '@react-pdf/renderer'
import type { Order, OrderItem, Payment, OrderStatus } from '../../../types'

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface DetailCardProps {
  title: string
  fallback?: string
  children?: ReactNode
}

const DetailCard = ({ title, fallback, children }: DetailCardProps) => (
  <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md flex-1">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
      {title}
    </h2>
    {children || (
      <p className="text-gray-500 dark:text-gray-400">{fallback}</p>
    )}
  </div>
)

interface DetailFieldProps {
  label: string
  value: ReactNode
}

const DetailField = ({ label, value }: DetailFieldProps) => (
  <div className="flex flex-col gap-1">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-gray-900 dark:text-white">{value}</p>
  </div>
)

interface OrderHeaderProps {
  title: string
  subtitle: string
  backHref: string
}

const OrderHeader = ({ title, subtitle, backHref }: OrderHeaderProps) => (
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
)

interface OrderMetaProps {
  order: Order | null
  payment?: Payment | null
}

const OrderMeta = ({ order }: OrderMetaProps) => {
  const status = (order?.status || 'PENDING') as OrderStatus

  return (
    <>
      <div className="flex-row flex">
        <span className={`badge ${statusColors[status] || 'badge-neutral'}`}>
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
  )
}

interface OrderItemsTableProps {
  items: OrderItem[]
}

const OrderItemsTable = ({ items }: OrderItemsTableProps) => {
  const totalAmount = (items || []).reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  )

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
  )
}

interface OrderInfoCardsProps {
  order: Order | null
  payment: Payment | null
  status: OrderStatus
}

const OrderInfoCards = ({ order, payment, status }: OrderInfoCardsProps) => (
  <div className="flex flex-col md:flex-row gap-4">
    <DetailCard title="Notes">
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {order?.note || '-'}
      </p>
    </DetailCard>

    <DetailCard title="Service Status">
      <span className={`badge ${statusColors[status] || 'badge-neutral'}`}>
        {statusLabels[status] || status}
      </span>
    </DetailCard>

    <DetailCard title="Payment Status">
      {payment ? (
        <div className="flex flex-col gap-1">
          <span
            className={`badge ${payment.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}
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
)

interface OrderActionsProps {
  order: Order | null
  payment: Payment | null
  onComplete: () => void
  completing: boolean
  onPrint: () => void
}

const OrderActions = ({ order, payment, onComplete, completing, onPrint }: OrderActionsProps) => {
  const status = (order?.status || 'PENDING') as OrderStatus
  const isPaid = payment?.status === 'PAID'
  const showPaymentBtn = status !== 'COMPLETED' || !isPaid

  return (
    <div className="flex flex-col gap-2 max-w-full">
      <div className="flex flex-row gap-2 w-full">
        {(status === 'PENDING' || status === 'PROCESSING') && (
          <button
            onClick={onComplete}
            className="btn btn-primary w-[50%]"
            disabled={completing}
          >
            {completing ? 'Updating...' : 'Mark as Completed'}
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
  )
}

const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  orderInfo: {
    alignItems: 'flex-end',
  },
  orderId: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  orderDate: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
    marginRight: 12,
  },
  colRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  fieldValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  fieldText: {
    fontSize: 9,
    color: '#4b5563',
    marginTop: 1,
  },
  fieldMuted: {
    fontSize: 9,
    color: '#9ca3af',
  },
  table: {
    width: '100%',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 4,
    alignItems: 'center',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 9,
    color: '#4b5563',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  totals: {
    width: '100%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 6,
  },
  totalLabelFinal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValueFinal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
  paymentBlock: {
    alignItems: 'flex-end',
  },
  footer: {
    marginTop: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af',
  },
})

interface InvoiceModalProps {
  order: Order
  payment: Payment | null
  onClose: () => void
}

const InvoiceModal = ({ order, payment, onClose }: InvoiceModalProps) => {
  const [downloading, setDownloading] = useState(false)
  if (!order || !onClose) return null
  const status = (order.status || 'PENDING') as OrderStatus
  const totalAmount = (order.order_items || []).reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
  const isPaid = payment?.status === 'PAID'
  const serviceCount = (order.order_items || []).reduce((sum, item) => sum + (item.qty || 0), 0)
  const totalDuration = (order.order_items || []).reduce((sum, item) => sum + (item.duration || 0), 0)

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'PAID': return '#16a34a'
      case 'PENDING': return '#d97706'
      case 'FAILED': return '#dc2626'
      case 'COMPLETED': return '#2563eb'
      case 'CANCELLED': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const InvoicePDF = () => (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View>
            <Text style={pdfStyles.companyName}>WASHINGTON</Text>
            <Text style={pdfStyles.subtitle}>Service Ticket</Text>
          </View>
          <View style={pdfStyles.orderInfo}>
            <Text style={pdfStyles.orderId}>Order #{order.id}</Text>
            <Text style={pdfStyles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <View style={pdfStyles.twoCol}>
            <View style={pdfStyles.col}>
              <Text style={pdfStyles.sectionLabel}>Customer</Text>
              {order.customer ? (
                <View>
                  <Text style={pdfStyles.fieldValue}>{order.customer.name}</Text>
                  <Text style={pdfStyles.fieldText}>{order.customer.email}</Text>
                  <Text style={pdfStyles.fieldText}>{String(order.customer.phone)}</Text>
                </View>
              ) : (
                <Text style={pdfStyles.fieldMuted}>Customer #{order.customerId}</Text>
              )}
            </View>
            <View style={pdfStyles.col}>
              <Text style={pdfStyles.sectionLabel}>Vehicle</Text>
              {order.vehicle ? (
                <View>
                  <Text style={pdfStyles.fieldValue}>{order.vehicle.brand} {order.vehicle.model}</Text>
                  <Text style={pdfStyles.fieldText}>{order.vehicle.name}</Text>
                  <Text style={pdfStyles.fieldText}>{order.vehicle.plateNumber}</Text>
                </View>
              ) : (
                <Text style={pdfStyles.fieldMuted}>Vehicle #{order.vehicleId}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionLabel}>Service Details</Text>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellHeader, { flex: 3 }]}>Service</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellHeader, { flex: 1, textAlign: 'center' }]}>Qty</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellHeader, { flex: 1, textAlign: 'center' }]}>Duration</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellHeader, { flex: 1, textAlign: 'right' }]}>Price</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellHeader, { flex: 1, textAlign: 'right' }]}>Subtotal</Text>
            </View>
            {(order.order_items || []).map((item, idx) => (
              <View key={item.id} style={[pdfStyles.tableRow, idx === (order.order_items || []).length - 1 && pdfStyles.tableRowLast]}>
                <Text style={[pdfStyles.tableCell, { flex: 3 }]}>{item.service?.name || `Service #${item.serviceId}`}</Text>
                <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.qty}</Text>
                <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.duration} min</Text>
                <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: 'right' }]}>${Number(item.price).toFixed(2)}</Text>
                <Text style={[pdfStyles.tableCellBold, { flex: 1, textAlign: 'right' }]}>${Number(item.subtotal).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={pdfStyles.section}>
          <View style={pdfStyles.totals}>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Total Services</Text>
              <Text style={pdfStyles.totalValue}>{serviceCount} service(s)</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Total Duration</Text>
              <Text style={pdfStyles.totalValue}>{totalDuration} min</Text>
            </View>
            <View style={pdfStyles.totalRowFinal}>
              <Text style={pdfStyles.totalLabelFinal}>Total</Text>
              <Text style={pdfStyles.totalValueFinal}>${totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <View style={pdfStyles.twoCol}>
            <View>
              <Text style={pdfStyles.sectionLabel}>Status</Text>
              <View style={[pdfStyles.badge, { backgroundColor: getStatusColor(status) }]}>
                <Text style={pdfStyles.badgeText}>{statusLabels[status] || status}</Text>
              </View>
            </View>
            <View style={pdfStyles.colRight}>
              <Text style={pdfStyles.sectionLabel}>Payment</Text>
              {payment ? (
                <View style={pdfStyles.paymentBlock}>
                  <View style={[pdfStyles.badge, { backgroundColor: isPaid ? '#16a34a' : '#d97706' }]}>
                    <Text style={pdfStyles.badgeText}>{payment.status}</Text>
                  </View>
                  <Text style={pdfStyles.fieldText}>{payment.method}</Text>
                  {isPaid && (
                    <View>
                      <Text style={pdfStyles.fieldText}>Paid: ${Number(payment.amount).toFixed(2)}</Text>
                      <Text style={pdfStyles.fieldText}>Change: ${Number(payment.change).toFixed(2)}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text style={pdfStyles.fieldMuted}>Unpaid</Text>
              )}
            </View>
          </View>
        </View>

        {order.note && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionLabel}>Notes</Text>
            <Text style={pdfStyles.fieldText}>{order.note}</Text>
          </View>
        )}

        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>Staff: {order.staff?.name || `Staff #${order.staffId}`}</Text>
        </View>
      </Page>
    </Document>
  )

  const handleDownloadPDF = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const blob = await pdf(<InvoicePDF />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-order-${order.id}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">WASHINGTON</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Service Ticket</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.id}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Customer</p>
                {order.customer ? (
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium text-gray-900 dark:text-white">{order.customer.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{String(order.customer.phone)}</p>
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
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
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
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Services</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{serviceCount} service(s)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Duration</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{totalDuration} min</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Status</p>
                <span className={`badge ${statusColors[status] || 'badge-neutral'}`}>
                  {statusLabels[status] || status}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Payment</p>
                {payment ? (
                  <div className="flex flex-col gap-1 items-start sm:items-end">
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

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">Staff: {order.staff?.name || `Staff #${order.staffId}`}</p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button className="btn btn-ghost btn-sm flex-1 sm:flex-none" onClick={onClose}>Close</button>
              <button className="btn btn-primary btn-sm flex-1 sm:flex-none" onClick={handleDownloadPDF} disabled={downloading}>
                {downloading ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ViewOrder = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [completing, setCompleting] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [showInvoice, setShowInvoice] = useState<boolean>(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    const loadOrder = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await orderController.fetchOrderById(id)
        if (!cancelled) setOrder(data)
      } catch (err: any) {
        if (!cancelled)
          setError(err.response?.data?.message || 'Failed to load order.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadOrder()
    return () => {
      cancelled = true
    }
  }, [id])

  const handleMarkAsCompleted = async () => {
    if (!id) return
    setCompleting(true)
    setError(null)
    try {
      await orderController.updateOrderStatus(id, 'COMPLETED')
      setSuccess(true)
      setOrder((prev) => (prev ? { ...prev, status: 'COMPLETED' } : prev))
      setTimeout(() => {
        setSuccess(false)
        navigate('/orders')
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark order as completed.')
    } finally {
      setCompleting(false)
    }
  }

  const payment =
    order?.payements && order.payements.length > 0
      ? order.payements[0]
      : null
  const status = (order?.status || 'PENDING') as OrderStatus
  const backHref = status === 'COMPLETED' && payment?.status === 'PAID' ? '/history' : '/orders'

  if (loading) {
    return (
      <div className="">
        <OrderHeader title="View Order" subtitle={`Loading order #${id}...`} backHref="/orders" />
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <div className="p-8 text-center">
            <span className="loading loading-spinner loading-lg text-teal-600"></span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="">
        <OrderHeader title="View Order" subtitle="View the order here" backHref={backHref} />
        <div className="alert alert-error">
          <span className="material-symbols-outlined">error</span>
          <span>{error || 'Order not found.'}</span>
        </div>
      </div>
    )
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
  )
}

export default ViewOrder
