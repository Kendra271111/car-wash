import { api } from '../api/api'
import type { Vehicle } from '../types'

export const fetchVehicles = async (search: string = ''): Promise<Vehicle[]> => {
  const res = await api.get<{ data: Vehicle[] }>('/vehicles', search ? { params: { search } } : undefined)
  return res.data.data || []
}

export const fetchVehicleById = async (id: number | string): Promise<Vehicle> => {
  const res = await api.get<{ data: Vehicle }>(`/vehicles/${id}`)
  return res.data.data
}

export const createVehicle = async (vehicleData: Partial<Vehicle>): Promise<any> => {
  const res = await api.post('/vehicles', vehicleData)
  return res.data
}

export default { fetchVehicles, fetchVehicleById, createVehicle }
