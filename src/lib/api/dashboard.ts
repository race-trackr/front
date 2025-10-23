import apiClient from '@/lib/apiClient';
import { DashboardSummary } from '@/types';

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  // In a real application, this would fetch data from your backend.
  // For now, we return mock data.
  // const response = await apiClient.get('/dashboard/summary');
  // return response.data;
  return {
    totalTrackdays: 15,
    totalVehicles: 3,
    totalMaintenances: 7,
  };
};