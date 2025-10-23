import apiClient from '@/lib/apiClient';
import { UserVehicle } from '@/types';

export const getVehicles = async (): Promise<UserVehicle[]> => {
  const response = await apiClient.get('/vehicles');
  return response.data;
};

export const getVehicleById = async (id: string): Promise<UserVehicle> => {
  const response = await apiClient.get(`/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (payload: Omit<UserVehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'>): Promise<UserVehicle> => {
  const response = await apiClient.post('/vehicles', payload);
  return response.data;
};

export const updateVehicle = async (id: string, payload: Omit<UserVehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'>): Promise<UserVehicle> => {
  const response = await apiClient.put(`/vehicles/${id}`, payload);
  return response.data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  await apiClient.delete(`/vehicles/${id}`);
};