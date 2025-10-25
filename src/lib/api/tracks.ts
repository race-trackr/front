"use client";

import apiClient from '@/lib/apiClient';
import { TrackType } from '@/types';

export const getTracks = async (): Promise<TrackType[]> => {
  const response = await apiClient.get('/tracks');
  return response.data;
};

// You can add other CRUD operations for tracks here if needed, e.g.:
// export const getTrackById = async (id: string): Promise<TrackType> => {
//   const response = await apiClient.get(`/tracks/${id}`);
//   return response.data;
// };

// export const createTrack = async (payload: Omit<TrackType, 'id' | 'createdAt' | 'updatedAt' | 'country'>): Promise<TrackType> => {
//   const response = await apiClient.post('/tracks', payload);
//   return response.data;
// };

// export const updateTrack = async (id: string, payload: Omit<TrackType, 'id' | 'createdAt' | 'updatedAt' | 'country'>): Promise<TrackType> => {
//   const response = await apiClient.put(`/tracks/${id}`, payload);
//   return response.data;
// };

// export const deleteTrack = async (id: string): Promise<void> => {
//   await apiClient.delete(`/tracks/${id}`);
// };