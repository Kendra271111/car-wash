import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: [],
  serviceOptions: [],

  setServiceOptions: (services) => set({ serviceOptions: services }),

  addEmptyItem: () => {
    set({
      items: [...get().items, { serviceId: null, service: '', duration: '', price: '', quantity: 1, subtotal: 0, empty: true }],
    })
  },

  selectService: (rowIndex, service) => {
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

  updateQuantity: (rowIndex, quantity) => {
    const items = [...get().items]
    if (quantity <= 0) {
      items.splice(rowIndex, 1)
    } else {
      items[rowIndex] = { ...items[rowIndex], quantity, subtotal: quantity * items[rowIndex].price }
    }
    set({ items })
  },

  removeItem: (rowIndex) => {
    const items = [...get().items]
    items.splice(rowIndex, 1)
    set({ items })
  },

  clearCart: () => set({ items: [] }),

  totalAmount: () => (get().items || []).reduce((sum, i) => sum + i.subtotal, 0),
  totalItems: () => (get().items || []).reduce((sum, i) => sum + i.quantity, 0),
  totalDuration: () => (get().items || []).reduce((sum, i) => sum + (Number(i.duration) || 0) * i.quantity, 0),
}))

export default useCartStore
