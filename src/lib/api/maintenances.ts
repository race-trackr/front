import apiClient from '@/lib/apiClient';
import { Maintenance } from '@/types';

// Assuming a CreateMaintenancePayload type would be similar to Maintenance but without id, userId, vehicleId, timestamps
// For simplicity, using Omit<Maintenance, ...> for now.
export type CreateMaintenancePayload = Omit<Maintenance, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user' | 'vehicle'>;

export const getMaintenances = async ({ limit = 10, offset = 0 }): Promise<Maintenance[]> => {
  const response = await apiClient.get('/maintenances', {
    params: { limit, offset },
  });
  return response.data;
};

export const getMaintenanceById = async (id: string): Promise<Maintenance> => {
  const response = await apiClient.get(`/maintenances/${id}`);
  return response.data;
};

export const createMaintenance = async (payload: CreateMaintenancePayload): Promise<Maintenance> => {
  const response = await apiClient.post('/maintenances', payload);
  return response.data;
};

export const updateMaintenance = async (id: string, payload: CreateMaintenancePayload): Promise<Maintenance> => {
  const response = await apiClient.put(`/maintenances/${id}`, payload);
  return response.data;
};

export const deleteMaintenance = async (id: string): Promise<void> => {
  await apiClient.delete(`/maintenances/${id}`);
};
