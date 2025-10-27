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
import { UserVehicleType, CreateTrackdayPayload, TrackType, WeatherCondition, TrackCondition } from '@/types';
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import apiClient from '@/lib/apiClient';
import MultiLineChronoInput from '@/components/MultiLineChronoInput';

const chronoFormatRegex = /^(\d{1,2})\.(\d{2})\.(\d{3})$/;

const formSchema = z.object({
  userVehicleId: z.coerce.number().min(1, { message: "Le véhicule est requis." }).nullable(),
  trackId: z.coerce.number().min(1, { message: "La piste est requise." }),
  date: z.string().min(1, { message: "La date est requise." }),
  weather: z.enum(['clear', 'cloudy', 'rainy'], { message: "La météo est requise et doit être 'clear', 'cloudy' ou 'rainy'." }).nullable().optional(), // Rendu optionnel
  airTemperature: z.coerce.number().min(-50).max(50, { message: "La température de l'air doit être entre -50 et 50." }).nullable().optional(),
  trackTemperature: z.coerce.number().min(-50).max(100, { message: "La température de la piste doit être entre -50 et 100." }).nullable().optional(),
  trackCondition: z.enum(['wet', 'dry', 'moist'], { message: "La condition de la piste est requise et doit être 'wet', 'dry' ou 'moist'." }).nullable().optional(), // Rendu optionnel
  notes: z.string().nullable().optional(),
  bestLapTime: z.string().optional().refine(
    (val) => !val || chronoFormatRegex.test(val),
    { message: "Le meilleur temps au tour doit être au format MM.SS.mmm (ex: 01.23.456)" }
  ).nullable().optional(),
  totalLaps: z.coerce.number().min(0, { message: "Le nombre total de tours ne peut pas être négatif." }).nullable().optional(),
  totalDistance: z.coerce.number().min(0, { message: "La distance totale ne peut pas être négative." }).nullable().optional(),
  chronos: z.array(z.object({
    lapTime: z.string().refine(
      (val) => val === '' || chronoFormatRegex.test(val), // Allow empty string OR match regex
      { message: "Chaque temps chrono doit être au format MM.SS.mmm (ex: 01.23.456)" }
    ),
    isBest: z.boolean(),
  })).nullable().optional(),
});

const TrackdayCreate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false); // État pour contrôler l'ouverture du DatePicker

  const form = useForm<CreateTrackdayPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userVehicleId: null,
      trackId: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      weather: null, // Défini à null
      airTemperature: null,
      trackTemperature: null,
      trackCondition: null, // Défini à null
      notes: null,
      bestLapTime: null,
      totalLaps: null,
      totalDistance: null,
      chronos: null,
    },
  });

  const { data: vehicles, isLoading: isLoadingVehicles, isError: isErrorVehicles } = useQuery<UserVehicleType[]>({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ limit: 0 }),
  });

  const { data: tracks, isLoading: isLoadingTracks, isError: isErrorTracks } = useQuery<TrackType[]>({
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
    const filteredChronos: ({ lapTime: string; isBest: boolean }[] | null) =
      values.chronos
        ?.filter((c): c is { lapTime: string; isBest: boolean } => c.lapTime !== '')
        .map(c => ({ lapTime: c.lapTime, isBest: c.isBest })) || null;

    const payload: CreateTrackdayPayload = {
      ...values,
      userVehicleId: values.userVehicleId === undefined ? null : values.userVehicleId,
      trackId: values.trackId,
      date: values.date,
      weather: values.weather === undefined ? null : values.weather, // Gère les valeurs undefined
      trackCondition: values.trackCondition === undefined ? null : values.trackCondition, // Gère les valeurs undefined
      airTemperature: values.airTemperature === undefined ? null : values.airTemperature,
      trackTemperature: values.trackTemperature === undefined ? null : values.trackTemperature,
      notes: values.notes === '' ? null : values.notes,
      bestLapTime: values.bestLapTime === '' ? null : values.bestLapTime,
      totalLaps: values.totalLaps === undefined ? null : values.totalLaps,
      totalDistance: values.totalDistance === undefined ? null : values.totalDistance,
      chronos: filteredChronos && filteredChronos.length > 0 ? filteredChronos : null,
    };
    createTrackdayMutation.mutate(payload);
  };

  const trackOptions = React.useMemo(() => {
    return tracks?.map(track => ({
      value: track.id.toString(),
      label: `${track.name} (${track.country?.name || t('unknown_country')})`
    })) || [];
  }, [tracks, t]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">{t('create_new_trackday')}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="userVehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('vehicle')}<span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={(value) => {
                  if (value === "create-new-vehicle") {
                    navigate('/vehicles/create');
                  } else {
                    field.onChange(Number(value));
                  }
                }} value={field.value?.toString() || ''}>
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
                          {vehicle.name} ({vehicle.licensePlate || t('not_specified')})
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
                <FormLabel>{t('track')}<span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Combobox
                    options={trackOptions}
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(Number(value))}
                    placeholder={t('select_a_track')}
                    emptyMessage={t('no_track_found')}
                    disabled={isLoadingTracks}
                    onCreateNew={() => navigate('/admin/tracks/create')}
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
                <FormLabel>{t('date')}<span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                    disabled={field.disabled}
                    placeholder={t('pick_a_date')}
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
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
                <Select onValueChange={(value) => field.onChange(value === 'null-option' ? null : value)} value={field.value || 'null-option'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_weather_condition')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null-option">{t('not_specified')}</SelectItem>
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
                <Select onValueChange={(value) => field.onChange(value === 'null-option' ? null : value)} value={field.value || 'null-option'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_track_condition')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null-option">{t('not_specified')}</SelectItem>
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
                  <Input {...field} value={field.value || ''} placeholder="MM.SS.mmm" />
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
                  <MultiLineChronoInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t('enter_lap_time')}
                    disabled={field.disabled}
                  />
                </FormControl>
                <FormDescription>{t('enter_multiple_lap_times')}</FormDescription>
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
          <div className="flex justify-between mt-4 md:col-span-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="btn-primary-gradient" disabled={createTrackdayMutation.isPending}>
              {createTrackdayMutation.isPending ? t('creating') : t('create_trackday')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TrackdayCreate;