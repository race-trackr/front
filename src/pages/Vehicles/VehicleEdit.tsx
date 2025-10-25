"use client";

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Textarea } from '@/components/ui/textarea';
import { getVehicleById, updateVehicle, deleteVehicle } from '@/lib/api/vehicles';
import { CreateVehiclePayload, UserVehicle } from '@/types/index';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

const formSchema = z.object({
  name: z.string().min(1, { message: "Le nom du véhicule est requis." }),
  type: z.enum(['car', 'bike', 'karting', 'other']).optional().or(z.literal('')),
  brand: z.string().optional().or(z.literal('')),
  model: z.string().optional().or(z.literal('')),
  licensePlate: z.string().optional().or(z.literal('')),
  year: z.coerce.number().min(1900, { message: "L'année doit être au moins 1900." }).max(new Date().getFullYear() + 1, { message: "L'année ne peut pas être dans le futur." }).optional(),
  vin: z.string().optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
  engineType: z.string().optional().or(z.literal('')),
  transmissionType: z.string().optional().or(z.literal('')),
  mileage: z.coerce.number().min(0, { message: "Le kilométrage ne peut pas être négatif." }).optional(),
  lastServiceMileage: z.coerce.number().min(0, { message: "Le kilométrage du dernier service ne peut pas être négatif." }).optional(),
  purchaseDate: z.string().optional().or(z.literal('')),
  purchasePrice: z.coerce.number().min(0, { message: "Le prix d'achat ne peut pas être négatif." }).optional(),
  details: z.string().optional().or(z.literal('')),
  otherDetails: z.record(z.string(), z.any()).optional().nullable(),
});

const VehicleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<CreateVehiclePayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: '',
      brand: '',
      model: '',
      licensePlate: '',
      year: undefined,
      vin: '',
      color: '',
      engineType: '',
      transmissionType: '',
      mileage: undefined,
      lastServiceMileage: undefined,
      purchaseDate: '',
      purchasePrice: undefined,
      details: '',
      otherDetails: null,
    },
  });

  const { data: vehicle, isLoading, isError } = useQuery<UserVehicle>({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicleById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (vehicle) {
      form.reset({
        ...vehicle,
        year: vehicle.year || undefined,
        mileage: vehicle.mileage || undefined,
        lastServiceMileage: vehicle.lastServiceMileage || undefined,
        purchasePrice: vehicle.purchasePrice || undefined,
        purchaseDate: vehicle.purchaseDate ? format(new Date(vehicle.purchaseDate), 'yyyy-MM-dd') : '',
        otherDetails: vehicle.otherDetails || null,
      });
    }
  }, [vehicle, form]);

  const updateVehicleMutation = useMutation({
    mutationFn: (payload: Partial<CreateVehiclePayload>) => updateVehicle(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success(t('vehicle_updated_successfully'));
      navigate(`/vehicles/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_update_vehicle'));
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: () => deleteVehicle(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success(t('vehicle_deleted_successfully'));
      navigate('/vehicles');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_delete_vehicle'));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: Partial<CreateVehiclePayload> = {
      ...values,
      type: values.type === '' ? undefined : values.type,
      brand: values.brand === '' ? undefined : values.brand,
      model: values.model === '' ? undefined : values.model,
      licensePlate: values.licensePlate === '' ? undefined : values.licensePlate,
      vin: values.vin === '' ? undefined : values.vin,
      color: values.color === '' ? undefined : values.color,
      engineType: values.engineType === '' ? undefined : values.engineType,
      transmissionType: values.transmissionType === '' ? undefined : values.transmissionType,
      details: values.details === '' ? undefined : values.details,
      purchaseDate: values.purchaseDate === '' ? undefined : values.purchaseDate,
      otherDetails: values.otherDetails || null,
    };
    updateVehicleMutation.mutate(payload);
  };

  const handleDelete = () => {
    if (window.confirm(t('confirm_delete_vehicle'))) {
      deleteVehicleMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">{t('loading_vehicle')}</div>;
  }

  if (isError || !vehicle) {
    return <div className="container mx-auto p-4 text-center text-red-500">{t('error_loading_vehicle')}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('edit_vehicle', { id: vehicle.name })}</h1>
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
                        <SelectItem value="car">{t('type_car')}</SelectItem>
                        <SelectItem value="bike">{t('type_bike')}</SelectItem>
                        <SelectItem value="karting">{t('type_karting')}</SelectItem>
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
                    <FormLabel>{t('vin')}</FormLabel>
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
                    <FormLabel>{t('color')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_color')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="engineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('engine_type')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_engine_type')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transmissionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('transmission_type')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_transmission_type')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('mileage')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder={t('enter_mileage')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastServiceMileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('last_service_mileage')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder={t('enter_last_service_mileage')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('purchase_date')}</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        disabled={field.disabled}
                        placeholder={t('pick_a_date')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('purchase_price')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} placeholder={t('enter_purchase_price')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('details')}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} placeholder={t('enter_any_details')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* You might want a dedicated component for otherDetails if it gets complex */}
              <div className="flex justify-between w-full md:col-span-2 mt-4">
                <Button type="submit" className="btn-primary-gradient" disabled={updateVehicleMutation.isPending}>
                  {updateVehicleMutation.isPending ? t('saving') : t('save_changes')}
                </Button>
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteVehicleMutation.isPending}>
                  {deleteVehicleMutation.isPending ? t('deleting') : t('delete_vehicle')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleEdit;