"use client";

import { supabase } from '@/lib/supabase';

export interface Vehicle {
  id: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  // Add other vehicle properties as needed
}

export const getVehicles = async (): Promise<Vehicle[]> => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*');

  if (error) {
    console.error('Error fetching vehicles:', error);
    throw new Error(error.message);
  }
  return data || [];
};