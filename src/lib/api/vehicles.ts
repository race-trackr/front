import apiClient from '../apiClient'
import {
  CreateVehiclePayload,
  UserVehicleType,
  UpdateVehiclePayload,
  PaginatedResponse,
} from '@/types'

export const getVehicles = async ({ limit = 10, offset = 0 } = {}): Promise<
  PaginatedResponse<UserVehicleType>
> => {
  const response = await apiClient.get('/vehicles', {
    params: { limit, offset },
  })
  return response.data
}

export const createVehicle = async (payload: CreateVehiclePayload): Promise<UserVehicleType> => {
  const response = await apiClient.post('/vehicles', payload)
  return response.data
}

export const getVehicleByUUID = async (id: string): Promise<UserVehicleType> => {
  const response = await apiClient.get(`/vehicles/${id}`)
  return response.data
}

export const updateVehicle = async (
  id: string,
  payload: UpdateVehiclePayload
): Promise<UserVehicleType> => {
  const response = await apiClient.put(`/vehicles/${id}`, payload)
  return response.data
}

export const deleteVehicle = async (id: string): Promise<void> => {
  await apiClient.delete(`/vehicles/${id}`)
}
