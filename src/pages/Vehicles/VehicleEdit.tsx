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
import { CreateVehiclePayload, UserVehicleType, VehicleType, UpdateVehiclePayload } from '@/types/index';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

const formSchema = z.object({
  brand: z.string().min(1, { message: "La marque du véhicule est requise." }),
  model: z.string().min(1, { message: "Le modèle du véhicule est requis." }),
  year: z.coerce.number().min(1900, { message: "L'année doit être au moins 1900." }).max(new Date().getFullYear() + 1, { message: "L'année ne peut pas être dans le futur." }),
  type: z.enum(['car', 'moto', 'karting', 'other'], { message: "Le type de véhicule est requis." }), // Updated enum
  image: z.string().url({ message: "L'URL de l'image est invalide." }).nullable().optional(),
  licensePlate: z.string().nullable().optional(),
  details: z.string().nullable().optional(),
});

const VehicleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number(id); // Convert id to number
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<CreateVehiclePayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      type: 'car',
      image: null,
      licensePlate: null,
      details: null,
    },
  });

  const { data: vehicle, isLoading, isError } = useQuery<UserVehicleType>({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => getVehicleById(vehicleId),
    enabled: !!vehicleId && !isNaN(vehicleId),
  });

  useEffect(() => {
    if (vehicle) {
      form.reset({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        type: vehicle.type,
        image: vehicle.image || null,
        licensePlate: vehicle.licensePlate || null,
        details: vehicle.details || null,
      });
    }
  }, [vehicle, form]);

  const updateVehicleMutation = useMutation({
    mutationFn: (payload: UpdateVehiclePayload) => updateVehicle(vehicleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success(t('vehicle_updated_successfully'));
      navigate(`/vehicles/${vehicleId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_update_vehicle'));
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: () => deleteVehicle(vehicleId),
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
    const payload: UpdateVehiclePayload = {
      ...values,
      image: values.image === '' ? null : values.image,
      licensePlate: values.licensePlate === '' ? null : values.licensePlate,
      details: values.details === '' ? null : values.details,
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
      <h1 className="text-3xl font-bold mb-6">{t('edit_vehicle', { name: `${vehicle.brand} ${vehicle.model}` })}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('vehicle_details')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_year')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                        <SelectItem value="moto">{t('type_moto')}</SelectItem> {/* Changed to type_moto */}
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
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_license_plate')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder={t('enter_license_plate')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_image_url')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder={t('enter_image_url')} />
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
                      <Textarea rows={3} {...field} value={field.value || ''} placeholder={t('enter_any_details')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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