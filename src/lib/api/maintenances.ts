import apiClient from '@/lib/apiClient'
import {
  MaintenanceRecordType,
  CreateMaintenancePayload,
  UpdateMaintenancePayload,
  PaginatedResponse,
} from '@/types'

interface GetMaintenancesParams {
  limit?: number
  offset?: number
  userVehicleId?: number
}

export const getMaintenances = async (
  params?: GetMaintenancesParams
): Promise<PaginatedResponse<MaintenanceRecordType>> => {
  const response = await apiClient.get('/maintenances', {
    params: params,
  })
  return response.data
}

export const getMaintenanceById = async (id: number): Promise<MaintenanceRecordType> => {
  const response = await apiClient.get(`/maintenances/${id}`)
  return response.data
}

export const createMaintenance = async (
  payload: CreateMaintenancePayload
): Promise<MaintenanceRecordType> => {
  const response = await apiClient.post('/maintenances', payload)
  return response.data
}

export const updateMaintenance = async (
  id: number,
  payload: UpdateMaintenancePayload
): Promise<MaintenanceRecordType> => {
  const response = await apiClient.put(`/maintenances/${id}`, payload)
  return response.data
}

export const deleteMaintenance = async (id: number): Promise<void> => {
  await apiClient.delete(`/maintenances/${id}`)
}
