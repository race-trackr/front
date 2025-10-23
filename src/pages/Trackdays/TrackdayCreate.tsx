"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
import { createTrackday } from '@/lib/api/trackdays';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from 'lucide-react';
import { getVehicles } from '@/lib/api/vehicles';
import { UserVehicle } from '@/types'; // Import UserVehicle type

const formSchema = z.object({
  date: z.string().min(1, { message: "La date est requise." }),
  trackId: z.string().min(1, { message: "La piste est requise." }),
  vehicleId: z.string().min(1, { message: "Le véhicule est requis." }),
  best_laptime: z.string().optional(),
});

const TrackdayCreate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: '',
      trackId: '', // Placeholder, will be replaced by actual track selection
      vehicleId: '',
      best_laptime: '',
    },
  });

  const { data: vehicles, isLoading: isLoadingVehicles, isError: isErrorVehicles } = useQuery<UserVehicle[]>({ // Use UserVehicle
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  });

  const createTrackdayMutation = useMutation({
    mutationFn: createTrackday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackdays'] });
      toast.success(t('trackday_created_successfully'));
      navigate('/trackdays');
    },
    onError: (error) => {
      toast.error(t('error_creating_trackday', { message: error.message }));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createTrackdayMutation.mutate(values);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('create_new_trackday')}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('date')}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trackId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('track')}</FormLabel>
                <FormControl>
                  {/* This will be replaced with a Select for tracks later */}
                  <Input {...field} placeholder={t('track_id_placeholder')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('vehicles')}</FormLabel>
                <Select onValueChange={(value) => {
                  if (value === "create-new-vehicle") {
                    navigate('/vehicles/create');
                  } else {
                    field.onChange(value);
                  }
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_a_vehicle')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingVehicles ? (
                      <SelectItem value="loading" disabled>{t('loading_vehicles')}</SelectItem>
                    ) : isErrorVehicles || !vehicles || vehicles.length === 0 ? (
                      <SelectItem value="create-new-vehicle" className="text-blue-600 cursor-pointer hover:bg-accent">
                        <div className="flex items-center">
                          <PlusCircle className="mr-2 h-4 w-4" /> {t('create_vehicle')}
                        </div>
                      </SelectItem>
                    ) : (
                      vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} ({vehicle.licensePlate}) {/* Use brand, model, licensePlate */}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="best_laptime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('best_laptime')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="HH:MM:SS.mmm" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="btn-primary-gradient" disabled={createTrackdayMutation.isPending}>
            {createTrackdayMutation.isPending ? t('creating') : t('create_trackday')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default TrackdayCreate;