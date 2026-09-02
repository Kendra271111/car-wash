import { create } from 'zustand'
import type { Service, CartItem } from '../types'

interface CartState {
  items: CartItem[]
  serviceOptions: Service[]
  setServiceOptions: (services: Service[]) => void
  addEmptyItem: () => void
  selectService: (rowIndex: number, service: Service) => void
  updateQuantity: (rowIndex: number, quantity: number) => void
  removeItem: (rowIndex: number) => void
  clearCart: () => void
  setItems: (items: CartItem[]) => void
  totalAmount: () => number
  totalItems: () => number
  totalDuration: () => number
}

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  serviceOptions: [],

  setServiceOptions: (services: Service[]) => set({ serviceOptions: services }),

  addEmptyItem: () => {
    set({
      items: [
        ...get().items,
        { serviceId: null, service: '', duration: '', price: '', quantity: 1, subtotal: 0, empty: true },
      ],
    })
  },

  selectService: (rowIndex: number, service: Service) => {
    const items = [...get().items]
    items[rowIndex] = {
      serviceId: service.id,
      service: service.name,
      duration: service.duration,
      price: Number(service.price),
      quantity: 1,
      subtotal: Number(service.price),
      empty: false,
    }
    set({ items })
  },

  updateQuantity: (rowIndex: number, quantity: number) => {
    const items = [...get().items]
    if (quantity <= 0) {
      items.splice(rowIndex, 1)
    } else {
      const priceNum = Number(items[rowIndex].price) || 0
      items[rowIndex] = { ...items[rowIndex], quantity, subtotal: quantity * priceNum }
    }
    set({ items })
  },

  removeItem: (rowIndex: number) => {
    const items = [...get().items]
    items.splice(rowIndex, 1)
    set({ items })
  },

  clearCart: () => set({ items: [] }),

  setItems: (items: CartItem[]) => set({ items }),

  totalAmount: () => (get().items || []).reduce((sum, i) => sum + i.subtotal, 0),
  totalItems: () => (get().items || []).reduce((sum, i) => sum + i.quantity, 0),
  totalDuration: () =>
    (get().items || []).reduce((sum, i) => sum + (Number(i.duration) || 0) * i.quantity, 0),
}))

export default useCartStore
