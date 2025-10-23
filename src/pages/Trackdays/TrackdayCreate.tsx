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
  FormDescription,
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
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { PlusCircle } from 'lucide-react';
import { getVehicles } from '@/lib/api/vehicles';
import { UserVehicle, CreateTrackdayPayload } from '@/types'; // Import UserVehicle and CreateTrackdayPayload

const formSchema = z.object({
  vehicleId: z.string().min(1, { message: "Le véhicule est requis." }),
  trackId: z.string().min(1, { message: "La piste est requise." }),
  date: z.string().min(1, { message: "La date est requise." }),
  weather: z.string().min(1, { message: "La météo est requise." }),
  airTemperature: z.coerce.number().min(-50).max(50, { message: "La température de l'air doit être entre -50 et 50." }),
  trackTemperature: z.coerce.number().min(-50).max(100, { message: "La température de la piste doit être entre -50 et 100." }),
  trackCondition: z.string().min(1, { message: "La condition de la piste est requise." }),
  note: z.string().optional(),
  bestLaptime: z.string().optional(), // Renamed from best_laptime
  totalLaps: z.coerce.number().min(0, { message: "Le nombre total de tours ne peut pas être négatif." }),
  otherDetails: z.string().optional(), // Will be parsed as JSON
});

const TrackdayCreate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<CreateTrackdayPayload>({ // Use CreateTrackdayPayload
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: '',
      trackId: '',
      date: '',
      weather: '',
      airTemperature: 0,
      trackTemperature: 0,
      trackCondition: '',
      note: '',
      bestLaptime: '', // Renamed from best_laptime
      totalLaps: 0,
      otherDetails: '',
    },
  });

  const { data: vehicles, isLoading: isLoadingVehicles, isError: isErrorVehicles } = useQuery<UserVehicle[]>({
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
    onError: (error: any) => { // Explicitly type error as any for now
      toast.error(error.response?.data?.message || t('failed_to_create_trackday'));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: CreateTrackdayPayload = {
      ...values,
      otherDetails: values.otherDetails ? JSON.parse(values.otherDetails) : null,
    };
    createTrackdayMutation.mutate(payload);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('create_new_trackday')}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
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
            name="weather"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('weather')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="airTemperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('air_temperature')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trackTemperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('track_temperature')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trackCondition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('track_condition')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bestLaptime" // Renamed field
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
          <FormField
            control={form.control}
            name="totalLaps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('total_laps')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t('notes')}</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="otherDetails"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t('other_details_json')}</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder='{"tirePressure": "2.0 bar"}' {...field} />
                </FormControl>
                <FormDescription>{t('enter_additional_details_json')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="btn-primary-gradient md:col-span-2" disabled={createTrackdayMutation.isPending}>
            {createTrackdayMutation.isPending ? t('creating') : t('create_trackday')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default TrackdayCreate;