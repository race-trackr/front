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
  user?: User;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  engineType: string;
  transmissionType: string;
  mileage: number;
  lastServiceMileage: number;
  purchaseDate: string;
  purchasePrice: number;
  otherDetails: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

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
