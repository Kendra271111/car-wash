export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'

export interface User {
  id: number
  name: string
  email: string
  password?: string
  pfp?: string | null
  role?: string
  createdAt?: string
  updatedAt?: string
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: number | string
  createdAt?: string
  vehicles?: Vehicle[]
  orders?: Order[]
}

export interface Vehicle {
  id: number
  name: string
  plateNumber: string
  brand: string
  model: string
  image?: string | null
  customerId?: number | null
  customer?: Customer | null
  createdAt?: string
  updatedAt?: string
  orders?: Order[]
}

export interface Staff {
  id: number
  name: string
  email: string
  phone?: string | null
  position?: string | null
  isActive: boolean
  userId?: number | null
  user?: User | null
  createdAt?: string
  updatedAt?: string
  orders?: Order[]
}

export interface Service {
  id: number
  name: string
  duration: number
  price: number
  qty?: number
  createdAt?: string
  updatedAt?: string
}

export interface OrderItem {
  id: number
  orderId: number
  serviceId: number
  duration: number
  amount: number
  price: number
  qty: number
  subtotal: number
  service?: Service
  createdAt?: string
  updatedAt?: string
}

export interface Payment {
  id: number
  orderId: number
  amount: number
  change: number
  method: string
  status: string
  createdAt?: string
  updatedAt?: string
  order?: Order
}

export interface Order {
  id: number
  vehicleId: number
  customerId: number
  staffId: number
  status: OrderStatus
  note?: string | null
  createdAt?: string
  updatedAt?: string
  customer?: Customer
  vehicle?: Vehicle
  staff?: Staff
  order_items?: OrderItem[]
  payements?: Payment[]
}

export interface CartItem {
  serviceId: number | null
  service: string
  duration: number | string
  price: number | string
  quantity: number
  subtotal: number
  empty?: boolean
}

export interface DashboardStats {
  totalOrders: number
  totalUsers: number
  pending: number
  completed: number
}

export interface StatusCounts {
  PENDING: number
  PROCESSING: number
  COMPLETED: number
  CANCELLED: number
  [key: string]: number
}

export interface DateRangeFilter {
  startDate?: string
  endDate?: string
}

export interface RevenueItem {
  date: string
  amount: number
  [key: string]: any
}

export interface OrdersReportItem {
  date: string
  count: number
  [key: string]: any
}

export interface ComparisonReport {
  current?: {
    revenue: number
    orders: number
    completed: number
  }
  previous?: {
    revenue: number
    orders: number
    completed: number
  }
  growth?: {
    revenue: number
    orders: number
    completed: number
  }
  avgOrderValue?: number
  completionRate?: number
  [key: string]: any
}
