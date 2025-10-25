"use client";

export interface CountryType {
  id: number;
  name: string;
  slug: string;
  iso: string;
  timezone: string;
  capital: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserType {
  id: number;
  email: string;
  password?: string; // Password should not be exposed in client-side UserType, making it optional
  fullName: string;
  avatar: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  trackDays?: TrackDayType[];
  vehicles?: UserVehicleType[];
  maintenances?: MaintenanceRecordType[];
}

export interface TrackType {
  id: number;
  name: string;
  slug: string;
  countryId: number;
  length: number;
  address: string | null;
  city: string;
  website: string | null;
  createdAt: string;
  updatedAt: string;
  country?: CountryType;
  trackDays?: TrackDayType[];
}

export type WeatherCondition = 'clear' | 'cloudy' | 'rainy';
export type TrackCondition = 'wet' | 'dry' | 'moist';
export type VehicleType = 'car' | 'motorcycle' | 'karting' | 'other'; // Added karting and other for consistency
export type MaintenanceRecordTypeType = 'repair' | 'service' | 'modification'; // Renamed to avoid conflict with interface name

export interface TrackDayType {
  id: string; // Keeping as string as per user's definition
  userId: number;
  trackId: number;
  userVehicleId: number | null;
  date: string;
  weather: WeatherCondition;
  airTemperature: number | null;
  trackTemperature: number | null;
  trackCondition: TrackCondition;
  notes: string | null;
  bestLapTime: string | null;
  totalLaps: number | null;
  totalDistance: number | null;
  chronos: string | null;
  createdAt: string;
  updatedAt: string;
  user?: UserType;
  track?: TrackType;
  vehicle?: UserVehicleType;
}

export interface UserVehicleType {
  id: number;
  userId: number;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  image: string | null;
  licensePlate?: string | null; // Added back as it was in previous UserVehicle
  details?: string | null; // Added back as it was in previous UserVehicle
  slug: string; // Added back as it was in previous UserVehicle
  createdAt: string;
  updatedAt: string;
  user?: UserType;
  trackDays?: TrackDayType[];
  maintenances?: MaintenanceRecordType[];
}

export interface MaintenanceRecordType {
  id: number;
  userId: number;
  userVehicleId: number;
  type: MaintenanceRecordTypeType;
  date: string;
  description: string;
  cost: number | null;
  mileage: number | null;
  nextDueDate: string | null;
  nextDueMileage: number | null;
  createdAt: string;
  updatedAt: string;
  user?: UserType;
  vehicle?: UserVehicleType;
}

// Payloads for API requests
export type CreateVehiclePayload = Omit<UserVehicleType, 'id' | 'userId' | 'slug' | 'createdAt' | 'updatedAt' | 'user' | 'trackDays' | 'maintenances'>;
export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

export type CreateTrackdayPayload = Omit<TrackDayType, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user' | 'track' | 'vehicle'>;
export type UpdateTrackdayPayload = Partial<CreateTrackdayPayload>;

export type CreateMaintenancePayload = Omit<MaintenanceRecordType, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user' | 'vehicle'>;
export type UpdateMaintenancePayload = Partial<CreateMaintenancePayload>;

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
  fullName: string; // Changed from username
  email: string;
  password: string;
  countryId: number; // Changed from string
}

export interface AuthResponse {
  token: string;
  user: UserType;
}