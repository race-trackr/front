export interface UserVehicle {
  id: string;
  userId: string;
  name: string;
  slug: string;
  type?: 'car' | 'motorcycle' | 'other'; // Rendu optionnel
  brand?: string; // Rendu optionnel
  model?: string; // Rendu optionnel
  year?: number; // Rendu optionnel
  licensePlate?: string; // Rendu optionnel (gardé le nom existant pour la cohérence)
  vin?: string;
  color?: string;
  weight?: number;
  power?: number;
  torque?: number;
  tireSizeFront?: string;
  tireSizeRear?: string;
  tirePressureFront?: number;
  tirePressureRear?: number;
  fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'other';
  transmissionType?: 'manual' | 'automatic' | 'semi-automatic' | 'other';
  details?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateVehiclePayload = Omit<UserVehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

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
}

export type CreateTrackdayPayload = Omit<Trackday, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;