"use client";

import apiClient from '@/lib/apiClient';
import { Track } from '@/types';

export const getTracks = async (): Promise<Track[]> => {
  const response = await apiClient.get('/tracks');
  return response.data;
};

// You can add other CRUD operations for tracks here if needed, e.g.:
// export const getTrackById = async (id: string): Promise<Track> => {
//   const response = await apiClient.get(`/tracks/${id}`);
//   return response.data;
// };

// export const createTrack = async (payload: Omit<Track, 'id' | 'createdAt' | 'updatedAt' | 'country'>): Promise<Track> => {
//   const response = await apiClient.post('/tracks', payload);
//   return response.data;
// };

// export const updateTrack = async (id: string, payload: Omit<Track, 'id' | 'createdAt' | 'updatedAt' | 'country'>): Promise<Track> => {
//   const response = await apiClient.put(`/tracks/${id}`, payload);
//   return response.data;
// };

// export const deleteTrack = async (id: string): Promise<void> => {
//   await apiClient.delete(`/tracks/${id}`);
// };