import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { TrackDayType, UpdateTrackdayPayload, WeatherCondition, TrackCondition, UserVehicleType, TrackType } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import apiClient from '@/lib/apiClient';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTrackdayById, updateTrackday, deleteTrackday } from '@/lib/api/trackdays';
import { getVehicles } from '@/lib/api/vehicles';
import { getTracks } from '@/lib/api/tracks';
import { Combobox } from '@/components/ui/combobox';
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import MultiLineChronoInput from '@/components/MultiLineChronoInput';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'; // Import the dialog

const chronoFormatRegex = /^(\d{1,2})\.(\d{2})\.(\d{3})$/; // MM.SS.mmm format

const formSchema = z.object({
  userVehicleId: z.coerce.number().min(1, { message: "Le véhicule est requis." }).nullable(),
  trackId: z.coerce.number().min(1, { message: "La piste est requise." }),
  date: z.string().min(1, { message: "La date est requise." }),
  weather: z.enum(['clear', 'cloudy', 'rainy'], { message: "La météo est requise et doit être 'clear', 'cloudy' ou 'rainy'." }),
  airTemperature: z.coerce.number().min(-50).max(50, { message: "La température de l'air doit être entre -50 et 50." }).nullable().optional(),
  trackTemperature: z.coerce.number().min(-50).max(100, { message: "La température de la piste doit être entre -50 et 100." }).nullable().optional(),
  trackCondition: z.enum(['wet', 'dry', 'moist'], { message: "La condition de la piste est requise et doit être 'wet', 'dry' ou 'moist'." }),
  notes: z.string().nullable().optional(),
  bestLapTime: z.string().optional().refine(
    (val) => !val || chronoFormatRegex.test(val),
    { message: "Le meilleur temps au tour doit être au format MM.SS.mmm (ex: 01.23.456)" }
  ).nullable().optional(),
  totalLaps: z.coerce.number().min(0, { message: "Le nombre total de tours ne peut pas être négatif." }).nullable().optional(),
  totalDistance: z.coerce.number().min(0, { message: "La distance totale ne peut pas être négative." }).nullable().optional(),
  chronos: z.array(z.string().refine(
    (val) => chronoFormatRegex.test(val),
    { message: "Chaque temps chrono doit être au format MM.SS.mmm (ex: 01.23.456)" }
  )).nullable().optional(),
});

const TrackdayEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const form = useForm<UpdateTrackdayPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userVehicleId: null,
      trackId: 0,
      date: '',
      weather: 'clear',
      airTemperature: null,
      trackTemperature: null,
      trackCondition: 'dry',
      notes: null,
      bestLapTime: null,
      totalLaps: null,
      totalDistance: null,
      chronos: null,
    },
  });

  const { data: trackday, isLoading, isError } = useQuery<TrackDayType>({
    queryKey: ['trackday', id],
    queryFn: () => getTrackdayById(id!),
    enabled: !!id,
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

  useEffect(() => {
    if (trackday) {
      form.reset({
        userVehicleId: trackday.userVehicleId || null,
        trackId: trackday.trackId,
        date: trackday.date,
        weather: trackday.weather,
        airTemperature: trackday.airTemperature || null,
        trackTemperature: trackday.trackTemperature || null,
        trackCondition: trackday.trackCondition,
        notes: trackday.notes || null,
        bestLapTime: trackday.bestLapTime || null,
        totalLaps: trackday.totalLaps || null,
        totalDistance: trackday.totalDistance || null,
        chronos: trackday.chronos && trackday.chronos.length > 0 ? trackday.chronos : null,
      });
    }
  }, [trackday, form]);

  const updateTrackdayMutation = useMutation({
    mutationFn: (payload: UpdateTrackdayPayload) => updateTrackday(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackday', id] });
      queryClient.invalidateQueries({ queryKey: ['trackdays'] });
      toast.success(t('trackday_updated_successfully'));
      navigate(`/trackdays/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_update_trackday'));
    },
  });

  const deleteTrackdayMutation = useMutation({
    mutationFn: () => deleteTrackday(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackdays'] });
      toast.success(t('trackday_deleted_successfully'));
      navigate('/trackdays');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_delete_trackday'));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: UpdateTrackdayPayload = {
      ...values,
      userVehicleId: values.userVehicleId === undefined ? null : values.userVehicleId,
      trackId: values.trackId,
      date: values.date,
      weather: values.weather,
      trackCondition: values.trackCondition,
      airTemperature: values.airTemperature === undefined ? null : values.airTemperature,
      trackTemperature: values.trackTemperature === undefined ? null : values.trackTemperature,
      notes: values.notes === '' ? null : values.notes,
      bestLapTime: values.bestLapTime === '' ? null : values.bestLapTime,
      totalLaps: values.totalLaps === undefined ? null : values.totalLaps,
      totalDistance: values.totalDistance === undefined ? null : values.totalDistance,
      chronos: values.chronos && values.chronos.length > 0 ? values.chronos.filter(c => c !== '') : null,
    };
    updateTrackdayMutation.mutate(payload);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteTrackdayMutation.mutate();
  };

  const trackOptions = React.useMemo(() => {
    return tracks?.map(track => ({
      value: track.id.toString(),
      label: `${track.name} (${track.country?.name || t('unknown_country')})`
    })) || [];
  }, [tracks, t]);

  if (isLoading) {
    return <div className="space-y-6">{t('loading_trackday')}</div>;
  }

  if (isError || !trackday) {
    return <div className="space-y-6 text-red-500">{t('error_loading_trackday')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('edit_trackday', { id: trackday.id })}</h1>
        <Button
          variant="destructive"
          onClick={handleDeleteClick}
          disabled={deleteTrackdayMutation.isPending}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleteTrackdayMutation.isPending ? t('deleting') : t('delete_trackday')}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="userVehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('vehicle')}</FormLabel>
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
                  <Input placeholder="MM.SS.mmm" {...field} value={field.value || ''} />
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
          <div className="flex justify-between w-full md:col-span-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="btn-primary-gradient" disabled={updateTrackdayMutation.isPending}>
              {updateTrackdayMutation.isPending ? t('saving') : t('save_changes')}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_trackday_title')}
        description={t('confirm_delete_trackday_description')}
        confirmButtonText={t('delete_trackday_button')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteTrackdayMutation.isPending}
      />
    </div>
  );
};

export default TrackdayEdit;