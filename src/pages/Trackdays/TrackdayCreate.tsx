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
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { getVehicles } from '@/lib/api/vehicles';
import { getTracks } from '@/lib/api/tracks';
import { UserVehicle, CreateTrackdayPayload, Track } from '@/types';
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

const formSchema = z.object({
  vehicleId: z.coerce.number().min(1, { message: "Le véhicule est requis." }),
  trackId: z.string().min(1, { message: "La piste est requise." }),
  date: z.string().min(1, { message: "La date est requise." }),
  weather: z.enum(['clear', 'cloudy', 'rainy'], { message: "La météo est requise et doit être 'clear', 'cloudy' ou 'rainy'." }),
  airTemperature: z.coerce.number().min(-50).max(50, { message: "La température de l'air doit être entre -50 et 50." }),
  trackTemperature: z.coerce.number().min(-50).max(100, { message: "La température de la piste doit être entre -50 et 100." }),
  trackCondition: z.string().min(1, { message: "La condition de la piste est requise." }),
  note: z.string().optional(),
  bestLaptime: z.string().optional().refine(
    (val) => !val || /^(\d{1,2}):([0-5][0-9])\.(\d{3})$/.test(val),
    { message: "Le meilleur temps au tour doit être au format MM:SS.mmm (ex: 01:23.456)" }
  ),
  totalLaps: z.coerce.number().min(0, { message: "Le nombre total de tours ne peut pas être négatif." }),
});

const TrackdayCreate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<CreateTrackdayPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: 0, // Default to 0 or a suitable placeholder for number
      trackId: '',
      date: '',
      weather: 'clear', // Valeur par défaut pour le sélecteur
      airTemperature: 0,
      trackTemperature: 0,
      trackCondition: '',
      note: '',
      bestLaptime: '',
      totalLaps: 0,
    },
  });

  const { data: vehicles, isLoading: isLoadingVehicles, isError: isErrorVehicles } = useQuery<UserVehicle[]>({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  });

  const { data: tracks, isLoading: isLoadingTracks, isError: isErrorTracks } = useQuery<Track[]>({
    queryKey: ['tracks'],
    queryFn: getTracks,
  });

  const createTrackdayMutation = useMutation({
    mutationFn: createTrackday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackdays'] });
      toast.success(t('trackday_created_successfully'));
      navigate('/trackdays');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_create_trackday'));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: CreateTrackdayPayload = {
      ...values,
    };
    createTrackdayMutation.mutate(payload);
  };

  const trackOptions = React.useMemo(() => {
    return tracks?.map(track => ({
      value: track.id,
      label: `${track.name} (${track.country?.name || t('unknown_country')})`
    })) || [];
  }, [tracks, t]);

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
                    field.onChange(Number(value)); // Convert to number
                  }
                }} value={field.value.toString()}> {/* Convert to string for Select */}
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
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
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
                  <Combobox
                    options={trackOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('select_a_track')}
                    emptyMessage={t('no_track_found')}
                    disabled={isLoadingTracks}
                    onCreateNew={() => navigate('/tracks/create')}
                    createNewLabel={t('create_track')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('date')}</FormLabel>
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
            name="weather"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('weather')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_weather_condition')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="clear">{t('weather_clear')}</SelectItem>
                    <SelectItem value="cloudy">{t('weather_cloudy')}</SelectItem>
                    <SelectItem value="rainy">{t('weather_rainy')}</SelectItem>
                  </SelectContent>
                </Select>
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
            name="bestLaptime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('best_laptime')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="MM:SS.mmm" />
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
          <Button type="submit" className="btn-primary-gradient md:col-span-2" disabled={createTrackdayMutation.isPending}>
            {createTrackdayMutation.isPending ? t('creating') : t('create_trackday')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default TrackdayCreate;