import apiClient from '@/lib/apiClient';
import { UserType, CreateUserPayload, UpdateUserPayload } from '@/types';

export const getUsers = async (): Promise<UserType[]> => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const getUserById = async (id: number): Promise<UserType> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (payload: CreateUserPayload): Promise<UserType> => {
  const response = await apiClient.post('/users', payload);
  return response.data;
};

export const updateUser = async (id: number, payload: UpdateUserPayload): Promise<UserType> => {
  const response = await apiClient.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};