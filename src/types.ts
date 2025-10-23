export interface UserVehicle {
  id: string;
  userId: string;
  name: string;
  slug: string;
  type?: string; // Rendu optionnel et de type string
  brand?: string; // Rendu optionnel
  model?: string; // Rendu optionnel
  year?: number; // Rendu optionnel
  licensePlate?: string; // Rendu optionnel (conservé licensePlate pour la cohérence)
  details?: string; // Rendu optionnel
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateVehiclePayload = Omit<UserVehicle, 'id' | 'userId' | 'slug' | 'createdAt' | 'updatedAt'>;

export interface Track {
  id: string;
  name: string;
  countryId: string;
  country?: {
    id: string;
    name: string;
  };
  length?: number;
  numberOfCorners?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTrackPayload = Omit<Track, 'id' | 'country' | 'createdAt' | 'updatedAt'>;

export interface Trackday {
  id: string;
  userId: string;
  vehicleId: string;
  trackId: string;
  date: string;
  weather: 'clear' | 'cloudy' | 'rainy';
  airTemperature: number;
  trackTemperature: number;
  trackCondition: string;
  note?: string;
  bestLaptime?: string;
  totalLaps: number;
  createdAt: string;
  updatedAt: string;
  vehicle?: UserVehicle;
  track?: Track;
}

export type CreateTrackdayPayload = Omit<Trackday, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export type MaintenanceType = 'maintenance' | 'repair' | 'modification' | 'other';

export interface Maintenance {
  id: string;
  userId: string;
  vehicleId: string;
  type: MaintenanceType;
  name: string;
  details?: string;
  date: string;
  mileage: number;
  cost: number;
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
  createdAt: string;
  updatedAt: string;
  vehicle?: UserVehicle;
}
