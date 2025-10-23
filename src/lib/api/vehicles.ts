import apiClient from '../apiClient';
import { CreateVehiclePayload, UserVehicle } from '@/types';

export const getVehicles = async ({ limit = 10, offset = 0  }): Promise<UserVehicle[]> => {
  const response = await apiClient.get('/vehicles', {
    params: { limit, offset },
  });
  return response.data;
};

export const createVehicle = async (payload: CreateVehiclePayload): Promise<UserVehicle> => {
  const response = await apiClient.post('/vehicles', payload);
  return response.data;
};

export const getVehicleById = async (id: string): Promise<UserVehicle> => {
  const response = await apiClient.get(`/vehicles/${id}`);
  return response.data;
};

export const updateVehicle = async (id: string, payload: Partial<CreateVehiclePayload>): Promise<UserVehicle> => {
  const response = await apiClient.put(`/vehicles/${id}`, payload);
  return response.data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  await apiClient.delete(`/vehicles/${id}`);
};
