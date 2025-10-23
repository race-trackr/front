"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } => '@/components/ui/textarea';
import { createVehicle } from '@/lib/api/vehicles';
import { CreateVehiclePayload } from '@/types';

const formSchema = z.object({
  name: z.string().min(1, { message: "Le nom du véhicule est requis." }),
  slug: z.string().min(1, { message: "Le slug du véhicule est requis." }),
  type: z.enum(['car', 'motorcycle', 'other'], { message: "Le type de véhicule est requis et doit être 'car', 'motorcycle' ou 'other'." }).optional().or(z.literal('')), // Rendu optionnel
  brand: z.string().optional().or(z.literal('')), // Rendu optionnel
  model: z.string().optional().or(z.literal('')), // Rendu optionnel
  licensePlate: z.string().optional().or(z.literal('')), // Rendu optionnel
  year: z.coerce.number().min(1900, { message: "L'année doit être au moins 1900." }).max(new Date().getFullYear() + 1, { message: "L'année ne peut pas être dans le futur." }).optional(), // Rendu optionnel
  vin: z.string().max(17, { message: "Le VIN ne peut pas dépasser 17 caractères." }).optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
  weight: z.coerce.number().min(0, { message: "Le poids ne peut pas être négatif." }).optional(),
  power: z.coerce.number().min(0, { message: "La puissance ne peut pas être négative." }).optional(),
  torque: z.coerce.number().min(0, { message: "Le couple ne peut pas être négatif." }).optional(),
  tireSizeFront: z.string().optional().or(z.literal('')),
  tireSizeRear: z.string().optional().or(z.literal('')),
  tirePressureFront: z.coerce.number().min(0, { message: "La pression des pneus avant ne peut pas être négative." }).optional(),
  tirePressureRear: z.coerce.number().min(0, { message: "La pression des pneus arrière ne peut pas être négative." }).optional(),
  fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid', 'other']).optional().or(z.literal('')),
  transmissionType: z.enum(['manual', 'automatic', 'semi-automatic', 'other']).optional().or(z.literal('')),
  details: z.string().optional().or(z.literal('')),
});

const VehicleCreate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<CreateVehiclePayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      type: '', // Valeur par défaut vide pour un champ optionnel
      brand: '',
      model: '',
      licensePlate: '',
      year: undefined, // Valeur par défaut undefined pour un champ numérique optionnel
      vin: '',
      color: '',
      weight: undefined,
      power: undefined,
      torque: undefined,
      tireSizeFront: '',
      tireSizeRear: '',
      tirePressureFront: undefined,
      tirePressureRear: undefined,
      fuelType: '',
      transmissionType: '',
      details: '',
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success(t('vehicle_created_successfully'));
      navigate('/vehicles');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_create_vehicle'));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: CreateVehiclePayload = {
      ...values,
      // Convert empty strings to undefined for optional number fields
      weight: values.weight === null ? undefined : values.weight,
      power: values.power === null ? undefined : values.power,
      torque: values.torque === null ? undefined : values.torque,
      tirePressureFront: values.tirePressureFront === null ? undefined : values.tirePressureFront,
      tirePressureRear: values.tirePressureRear === null ? undefined : values.tirePressureRear,
      // Convert empty strings to undefined for optional enum fields
      fuelType: values.fuelType === '' ? undefined : values.fuelType,
      transmissionType: values.transmissionType === '' ? undefined : values.transmissionType,
      // Convert empty strings to undefined for other optional string fields
      type: values.type === '' ? undefined : values.type,
      brand: values.brand === '' ? undefined : values.brand,
      model: values.model === '' ? undefined : values.model,
      licensePlate: values.licensePlate === '' ? undefined : values.licensePlate,
      details: values.details === '' ? undefined : values.details,
    };
    createVehicleMutation.mutate(payload);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('create_new_vehicle')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('vehicle_details')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_vehicle_name')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_slug')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_vehicle_slug')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select_vehicle_type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">{t('select_option')}</SelectItem> {/* Option vide */}
                        <SelectItem value="car">{t('type_car')}</SelectItem>
                        <SelectItem value="motorcycle">{t('type_motorcycle')}</SelectItem>
                        <SelectItem value="other">{t('type_other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_brand')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_brand')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_model')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_model')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_license_plate')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_license_plate')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_year')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder={t('enter_year')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_vin')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_vin')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_color')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_color')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_weight')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} placeholder={t('enter_weight_kg')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="power"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_power')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} placeholder={t('enter_power_hp')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="torque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_torque')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} placeholder={t('enter_torque_nm')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tireSizeFront"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_tire_size_front')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_tire_size_front')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tireSizeRear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_tire_size_rear')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_tire_size_rear')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tirePressureFront"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_tire_pressure_front')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} placeholder={t('enter_tire_pressure_front_bar')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tirePressureRear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_tire_pressure_rear')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} placeholder={t('enter_tire_pressure_rear_bar')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_fuel_type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select_fuel_type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">{t('select_option')}</SelectItem> {/* Option vide */}
                        <SelectItem value="gasoline">{t('fuel_gasoline')}</SelectItem>
                        <SelectItem value="diesel">{t('fuel_diesel')}</SelectItem>
                        <SelectItem value="electric">{t('fuel_electric')}</SelectItem>
                        <SelectItem value="hybrid">{t('fuel_hybrid')}</SelectItem>
                        <SelectItem value="other">{t('fuel_other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transmissionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_transmission_type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select_transmission_type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">{t('select_option')}</SelectItem> {/* Option vide */}
                        <SelectItem value="manual">{t('transmission_manual')}</SelectItem>
                        <SelectItem value="automatic">{t('transmission_automatic')}</SelectItem>
                        <SelectItem value="semi-automatic">{t('transmission_semi_automatic')}</SelectItem>
                        <SelectItem value="other">{t('transmission_other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('vehicle_details')}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} placeholder={t('enter_any_details')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="btn-primary-gradient md:col-span-2" disabled={createVehicleMutation.isPending}>
                {createVehicleMutation.isPending ? t('creating') : t('create_vehicle')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleCreate;