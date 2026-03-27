import apiClient from '@/lib/apiClient'
import {
  MaintenanceRecordType,
  CreateMaintenancePayload,
  UpdateMaintenancePayload,
  PaginatedResponse,
} from '@/types'

export interface GetMaintenancesParams {
  page?: number
  limit?: number
  vehicle_uuid?: string
  type?: string
  search?: string
}

export const getMaintenances = async (
  params?: GetMaintenancesParams
): Promise<PaginatedResponse<MaintenanceRecordType>> => {
  const response = await apiClient.get('/maintenances', {
    params: params,
  })
  return response.data
}

export const getMaintenanceById = async (id: string): Promise<MaintenanceRecordType> => {
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
  id: string,
  payload: UpdateMaintenancePayload
): Promise<MaintenanceRecordType> => {
  const response = await apiClient.put(`/maintenances/${id}`, payload)
  return response.data
}

export const deleteMaintenance = async (uuid: string): Promise<void> => {
  await apiClient.delete(`/maintenances/${uuid}`)
}
