import apiClient from '@/lib/apiClient';
import { MaintenanceRecordType, CreateMaintenancePayload, UpdateMaintenancePayload } from '@/types';

export const getMaintenances = async ({ limit = 10, offset = 0 }): Promise<MaintenanceRecordType[]> => {
  const response = await apiClient.get('/maintenances', {
    params: { limit, offset },
  });
  return response.data;
};

export const getMaintenanceById = async (id: number): Promise<MaintenanceRecordType> => {
  const response = await apiClient.get(`/maintenances/${id}`);
  return response.data;
};

export const createMaintenance = async (payload: CreateMaintenancePayload): Promise<MaintenanceRecordType> => {
  const response = await apiClient.post('/maintenances', payload);
  return response.data;
};

export const updateMaintenance = async (id: number, payload: UpdateMaintenancePayload): Promise<MaintenanceRecordType> => {
  const response = await apiClient.put(`/maintenances/${id}`, payload);
  return response.data;
};

export const deleteMaintenance = async (id: number): Promise<void> => {
  await apiClient.delete(`/maintenances/${id}`);
};