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
import { UserVehicleType, CreateTrackdayPayload, TrackType, WeatherCondition, TrackCondition } from '@/types'; // Updated types
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

const formSchema = z.object({
  userVehicleId: z.coerce.number().min(1, { message: "Le véhicule est requis." }).nullable(), // Changed to userVehicleId and nullable
  trackId: z.coerce.number().min(1, { message: "La piste est requise." }), // Changed to number
  date: z.string().min(1, { message: "La date est requise." }),
  weather: z.enum(['clear', 'cloudy', 'rainy'], { message: "La météo est requise et doit être 'clear', 'cloudy' ou 'rainy'." }),
  airTemperature: z.coerce.number().min(-50).max(50, { message: "La température de l'air doit être entre -50 et 50." }).nullable().optional(),
  trackTemperature: z.coerce.number().min(-50).max(100, { message: "La température de la piste doit être entre -50 et 100." }).nullable().optional(),
  trackCondition: z.enum(['wet', 'dry', 'moist'], { message: "La condition de la piste est requise et doit être 'wet', 'dry' ou 'moist'." }), // Changed to enum
  notes: z.string().nullable().optional(), // Changed to notes and nullable
  bestLapTime: z.string().optional().refine( // Changed to bestLapTime
    (val) => !val || /^(\d{1,2}):([0-5][0-9])\.(\d{3})$/.test(val),
    { message: "Le meilleur temps au tour doit être au format MM:SS.mmm (ex: 01:23.456)" }
  ).nullable().optional(),
  totalLaps: z.coerce.number().min(0, { message: "Le nombre total de tours ne peut pas être négatif." }).nullable().optional(),
  totalDistance: z.coerce.number().min(0, { message: "La distance totale ne peut pas être négative." }).nullable().optional(), // New field
  chronos: z.string().nullable().optional(), // New field
});

const TrackdayCreate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<CreateTrackdayPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userVehicleId: null, // Default to null
      trackId: 0, // Default to 0 for number type
      date: format(new Date(), 'yyyy-MM-dd'),
      weather: 'clear',
      airTemperature: null,
      trackTemperature: null,
      trackCondition: 'dry', // Default to 'dry'
      notes: null,
      bestLapTime: null,
      totalLaps: null,
      totalDistance: null,
      chronos: null,
    },
  });

  const { data: vehicles, isLoading: isLoadingVehicles, isError: isErrorVehicles } = useQuery<UserVehicleType[]>({ // Changed UserVehicle to UserVehicleType
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ limit: 0 }),
  });

  const { data: tracks, isLoading: isLoadingTracks, isError: isErrorTracks } = useQuery<TrackType[]>({ // Changed Track to TrackType
    queryKey: ['tracks'],
    queryFn: async () => {
      const response = await apiClient.get('/tracks');
      return response.data;
    },
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
      airTemperature: values.airTemperature === undefined ? null : values.airTemperature,
      trackTemperature: values.trackTemperature === undefined ? null : values.trackTemperature,
      notes: values.notes === '' ? null : values.notes,
      bestLapTime: values.bestLapTime === '' ? null : values.bestLapTime,
      totalLaps: values.totalLaps === undefined ? null : values.totalLaps,
      totalDistance: values.totalDistance === undefined ? null : values.totalDistance,
      chronos: values.chronos === '' ? null : values.chronos,
    };
    createTrackdayMutation.mutate(payload);
  };

  const trackOptions = React.useMemo(() => {
    return tracks?.map(track => ({
      value: track.id.toString(), // Convert to string for Combobox
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
            name="userVehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('vehicles')}</FormLabel>
                <Select onValueChange={(value) => {
                  if (value === "create-new-vehicle") {
                    navigate('/vehicles/create');
                  } else {
                    field.onChange(Number(value)); // Convert to number
                  }
                }} value={field.value?.toString() || ''}> {/* Handle null and convert to string */}
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
                          {vehicle.brand} {vehicle.model} ({vehicle.licensePlate || t('not_specified')})
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
                    value={field.value.toString()} // Convert to string for Combobox
                    onValueChange={(value) => field.onChange(Number(value))} // Convert back to number
                    placeholder={t('select_a_track')}
                    emptyMessage={t('no_track_found')}
                    disabled={isLoadingTracks}
                    onCreateNew={() => navigate('/admin/tracks/create')} // Changed to admin/tracks/create
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
                  <Input type="number" step="0.1" {...field} value={field.value === null ? '' : field.value} />
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
                  <Input type="number" step="0.1" {...field} value={field.value === null ? '' : field.value} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_track_condition')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="wet">{t('track_condition_wet')}</SelectItem>
                    <SelectItem value="dry">{t('track_condition_dry')}</SelectItem>
                    <SelectItem value="moist">{t('track_condition_moist')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bestLapTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('best_laptime')}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="MM:SS.mmm" />
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
                  <Input type="number" {...field} value={field.value === null ? '' : field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalDistance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('total_distance')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} value={field.value === null ? '' : field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chronos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('chronos')}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder={t('enter_chronos_data')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t('notes')}</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} value={field.value || ''} />
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