import apiClient from '@/lib/apiClient';
import { TrackDayType, CreateTrackdayPayload, UpdateTrackdayPayload } from '@/types';

interface GetTrackdaysParams {
  limit?: number;
  offset?: number;
  searchTerm?: string;
  vehicleId?: number;
  trackId?: number;
  startDate?: string; // New parameter for start date
  endDate?: string;   // New parameter for end date
}

export const getTrackdays = async (params?: GetTrackdaysParams): Promise<TrackDayType[]> => {
  const response = await apiClient.get('/trackdays', {
    params: params,
  });
  return response.data;
};

export const getTrackdayById = async (id: string): Promise<TrackDayType> => {
  const response = await apiClient.get(`/trackdays/${id}`);
  return response.data;
};

export const createTrackday = async (payload: CreateTrackdayPayload): Promise<TrackDayType> => {
  const response = await apiClient.post('/trackdays', payload);
  return response.data;
};

export const updateTrackday = async (id: string, payload: UpdateTrackdayPayload): Promise<TrackDayType> => {
  const response = await apiClient.put(`/trackdays/${id}`, payload);
  return response.data;
};

export const deleteTrackday = async (id: string): Promise<void> => {
  await apiClient.delete(`/trackdays/${id}`);
};