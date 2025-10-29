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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { createVehicle } from '@/lib/api/vehicles';
import { CreateVehiclePayload, VehicleCategory } from '@/types';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, { message: "Le nom du véhicule est requis." }),
  type: z.enum(['car', 'motorcycle', 'karting', 'other'], { message: "Le type de véhicule est requis." }),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  year: z.coerce.number().min(1900, { message: "L'année doit être au moins 1900." }).max(new Date().getFullYear() + 1, { message: "L'année ne peut pas être dans le futur." }).nullable().optional(),
  licensePlate: z.string().nullable().optional(),
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
      type: 'car',
      brand: null,
      model: null,
      year: null,
      licensePlate: null,
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
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: CreateVehiclePayload = {
      ...values,
      name: values.name,
      type: values.type,
      brand: values.brand === '' ? null : values.brand,
      model: values.model === '' ? null : values.model,
      year: values.year === undefined ? null : values.year,
      licensePlate: values.licensePlate === '' ? null : values.licensePlate,
      details: values.details === '' ? null : values.details,
    };
    createVehicleMutation.mutate(payload);
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">{t('back')}</span>
        </Button>
        <h1 className="text-3xl font-bold flex-1">{t('create_new_vehicle')}</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('vehicle_name')}<span className="text-destructive">*</span></FormLabel>
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
                <FormLabel>{t('vehicle_type')}<span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_vehicle_type')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                        <SelectItem value="car">{t('type_car')}</SelectItem>
                        <SelectItem value="motorcycle">{t('type_motorcycle')}</SelectItem>
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
                  <Input {...field} value={field.value || ''} placeholder={t('enter_brand_optional')} />
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
                  <Input {...field} value={field.value || ''} placeholder={t('enter_model_optional')} />
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
                  <Input type="number" {...field} value={field.value === null ? '' : field.value} placeholder={t('enter_year_optional')} />
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
          <div className="flex justify-between mt-4 md:col-span-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="btn-primary-gradient" disabled={createVehicleMutation.isPending}>
              {createVehicleMutation.isPending ? t('creating') : t('create_vehicle')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default VehicleCreate;