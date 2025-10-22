export type Role = 'super_admin' | 'admin' | 'user' | 'owner';
export type VehicleType = 'moto' | 'voiture' | 'karting' | 'autre';
export type MaintenanceType = 'réparation' | 'maintenance' | 'modification' | 'autre';

export interface Country {
  id: string;
  name: string;
  slug: string;
  iso: string;
  timezone: string;
  capital: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  countryId: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  country?: Country; // Relationship
}

export interface Track {
  id: string;
  name: string;
  slug: string;
  city: string;
  countryId: string;
  address: string;
  width: number;
  length: number;
  turn: number;
  maxDb: number;
  details: string;
  bestLaptime: string;
  bestLaptimePilote: string;
  createdAt: string;
  updatedAt: string;
  country?: Country; // Relationship
}

export interface UserVehicle {
  id: string;
  userId: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  type: VehicleType;
  details: string;
  createdAt: string;
  updatedAt: string;
  user?: User; // Relationship
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  userId: string;
  name: string;
  type: MaintenanceType;
  date: string;
  cost: number;
  mileage: number;
  nextMaintenanceDate: string | null;
  nextMaintenanceMileage: number | null;
  details: string;
  createdAt: string;
  updatedAt: string;
  user?: User; // Relationship
  vehicle?: UserVehicle; // Relationship
}

export interface Trackday {
  id: string;
  userId: string;
  vehicleId: string;
  trackId: string;
  date: string;
  weather: string;
  airTemperature: number;
  trackTemperature: number;
  trackCondition: string;
  note: string;
  bestLaptime: string;
  totalLaps: number;
  otherDetails: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  user?: User; // Relationship
  vehicle?: UserVehicle; // Relationship
  track?: Track; // Relationship
}

// API Payloads
export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  countryId: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  type: string;
  token: string;
  refreshToken?: string;
}

export interface CreateTrackdayPayload {
  vehicleId: string;
  trackId: string;
  date: string;
  weather: string;
  airTemperature: number;
  trackTemperature: number;
  trackCondition: string;
  note: string;
  bestLaptime: string;
  totalLaps: number;
  otherDetails?: Record<string, any>;
}