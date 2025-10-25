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
  password?: string;
  fullName: string;
  avatar: string | null;
  role: 'user' | 'admin';
  countryId: number; // Added countryId
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
export type VehicleType = 'car' | 'moto' | 'karting' | 'other';
export type MaintenanceRecordTypeType = 'maintenance' | 'repair' | 'modification' | 'other';

export interface TrackDayType {
  id: string;
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
  chronos: { lapTime: string; isBest: boolean }[] | null;
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
  licensePlate?: string | null;
  details?: string | null;
  slug: string;
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
  name: string;
  type: MaintenanceRecordTypeType;
  date: string;
  details?: string | null;
  cost: number | null;
  mileage: number | null;
  nextDueDate: string | null;
  nextDueMileage: number | null;
  createdAt: string;
  updatedAt: string;
  user?: UserType;
  vehicle?: UserVehicleType;
}

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
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  countryId: number;
}

export interface AuthResponse {
  token: string;
  user: UserType;
}