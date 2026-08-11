import { api } from '../services/api'

export const fetchVehicles = async () => {
  const res = await api.get('/vehicles')
  return res.data.data || []
}

export const fetchVehicleById = async (id) => {
  const res = await api.get(`/vehicles/${id}`)
  return res.data.data
}

export const createVehicle = async (vehicleData) => {
  const res = await api.post('/vehicles', vehicleData)
  return res.data
}

export default { fetchVehicles, fetchVehicleById, createVehicle }
