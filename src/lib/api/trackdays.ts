import apiClient from '@/lib/apiClient';
import { TrackDayType, CreateTrackdayPayload, UpdateTrackdayPayload, PaginatedResponse } from '@/types';

interface GetTrackdaysParams {
  limit?: number;
  offset?: number;
  searchTerm?: string;
  vehicleId?: number;
  trackId?: number;
  // Removed startDate and endDate
  // startDate?: string;
  // endDate?: string;
}

export const getTrackdays = async (params?: GetTrackdaysParams): Promise<PaginatedResponse<TrackDayType>> => {
  const response = await apiClient.get('/trackdays', {
    params: params,
  });
  return response.data; // Assuming API returns { data: T[], total: number, limit: number, offset: number }
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