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
import { createVehicle } from '@/lib/api/vehicles';
import { CreateVehiclePayload } from '@/types';

const formSchema = z.object({
  name: z.string().min(1, { message: "Le nom du véhicule est requis." }),
  type: z.enum(['car', 'bike', 'karting', 'other'], { message: "Le type de véhicule est requis." }),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  licensePlate: z.string().nullable().optional(),
  year: z.coerce.number().min(1900, { message: "L'année doit être au moins 1900." }).max(new Date().getFullYear() + 1, { message: "L'année ne peut pas être dans le futur." }).nullable().optional(),
  details: z.string().nullable().optional(),
});

const VehicleCreate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<CreateVehiclePayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'car', // Default to 'car' as type is now required
      brand: null,
      model: null,
      licensePlate: null,
      year: null,
      details: null,
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
      // Convert empty strings to null for optional string fields, and ensure year is null if undefined
      brand: values.brand === '' ? null : values.brand,
      model: values.model === '' ? null : values.model,
      licensePlate: values.licensePlate === '' ? null : values.licensePlate,
      details: values.details === '' ? null : values.details,
      year: values.year === undefined ? null : values.year,
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
                      <Input {...field} value={field.value || ''} placeholder={t('enter_brand')} />
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
                      <Input {...field} value={field.value || ''} placeholder={t('enter_model')} />
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
                      <Input {...field} value={field.value || ''} placeholder={t('enter_license_plate')} />
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
                      <Input type="number" {...field} value={field.value === null ? '' : field.value} placeholder={t('enter_year')} />
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
                    <FormLabel>{t('vehicle_details')}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} value={field.value || ''} placeholder={t('enter_any_details')} />
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