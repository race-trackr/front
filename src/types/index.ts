"use client";

export interface User {
  id: string;
  username: string;
  email: string;
  countryId?: string;
  country?: Country;
  createdAt: string;
  updatedAt: string;
}

export interface Country {
  id: string;
  name: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserVehicle {
  id: number;
  userId: number;
  name: string;
  slug: string;
  type: 'bike' | 'car' | 'karting' | 'other';
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  licensePlate?: string | null;
  details?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateVehiclePayload = Omit<UserVehicle, 'id' | 'userId' | 'slug' | 'createdAt' | 'updatedAt'>;

export interface Track {
  id: string;
  name: string;
  countryId: string;
  country?: Country;
  length: number; // in meters
  turns: number;
  layoutImageUrl?: string;
  websiteUrl?: string;
  timezone: string;
  otherDetails: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Trackday {
  id: string;
  userId: string;
  user?: User;
  vehicleId: number; // Updated to number
  vehicle?: UserVehicle;
  trackId: string;
  track?: Track;
  date: string;
  weather: string;
  airTemperature: number;
  trackTemperature: number;
  trackCondition: string;
  note?: string;
  bestLaptime?: string;
  totalLaps: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackdayPayload {
  vehicleId: number; // Updated to number
  trackId: string;
  date: string;
  weather: string;
  airTemperature: number;
  trackTemperature: number;
  trackCondition: string;
  note?: string;
  bestLaptime?: string;
  totalLaps: number;
}

export interface Maintenance {
  id: string;
  userId: string;
  user?: User;
  vehicleId: number; // Updated to number
  vehicle?: UserVehicle;
  type: string;
  date: string;
  mileage: number;
  cost: number;
  notes?: string;
  otherDetails: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalTrackdays: number;
  totalVehicles: number;
  totalMaintenances: number;
  // Add other summary fields as needed
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  countryId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}