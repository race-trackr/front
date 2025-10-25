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
  id: string;
  userId: string;
  name: string; // Added from src/types.ts
  type?: 'car' | 'bike' | 'karting' | 'other'; // Added from src/types.ts
  brand?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  vin?: string; // Made optional
  color?: string; // Made optional
  engineType?: string; // Made optional
  transmissionType?: string; // Made optional
  mileage?: number; // Made optional
  lastServiceMileage?: number; // Made optional
  purchaseDate?: string; // Made optional
  purchasePrice?: number; // Made optional
  details?: string; // Added from src/types.ts
  otherDetails?: Record<string, any> | null; // Made optional
  createdAt: string;
  updatedAt: string;
}

export type CreateVehiclePayload = Omit<UserVehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

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
  vehicleId: string;
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
  vehicleId: string;
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
  vehicleId: string;
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