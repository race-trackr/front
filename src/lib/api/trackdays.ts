import apiClient from '@/lib/apiClient';
import { Trackday, CreateTrackdayPayload } from '@/types';

export const getTrackdays = async (): Promise<Trackday[]> => {
  const response = await apiClient.get('/trackdays');
  return response.data;
};

export const getTrackdayById = async (id: string): Promise<Trackday> => {
  const response = await apiClient.get(`/trackdays/${id}`);
  return response.data;
};

export const createTrackday = async (payload: CreateTrackdayPayload): Promise<Trackday> => {
  const response = await apiClient.post('/trackdays', payload);
  return response.data;
};

export const updateTrackday = async (id: string, payload: CreateTrackdayPayload): Promise<Trackday> => {
  const response = await apiClient.put(`/trackdays/${id}`, payload);
  return response.data;
};

export const deleteTrackday = async (id: string): Promise<void> => {
  await apiClient.delete(`/trackdays/${id}`);
};