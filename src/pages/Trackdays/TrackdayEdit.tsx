import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import TrackdayForm from '@/components/TrackdayForm';
import { TrackDayType, UpdateTrackdayPayload, UserVehicleType, TrackType } from '@/types';
import apiClient from '@/lib/apiClient';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS, es, it } from 'date-fns/locale';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTrackdayById, updateTrackday, deleteTrackday } from '@/lib/api/trackdays';
import { getVehicles } from '@/lib/api/vehicles';
import { Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

const chronoFormatRegex = /^(\d{1,2})\.(\d{2})\.(\d{3})$/;

const formSchema = z.object({
  userVehicleId: z.coerce.number().min(1, { message: "Le véhicule est requis." }).nullable(),
  trackId: z.coerce.number().min(1, { message: "La piste est requise." }).nullable(),
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

const TrackdayEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Destructure i18n
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false); // État pour contrôler l'ouverture du DatePicker

  const form = useForm<UpdateTrackdayPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userVehicleId: null,
      trackId: 0,
      date: '',
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
        weather: trackday.weather || null, // Gère les valeurs null
        airTemperature: trackday.airTemperature || null,
        trackTemperature: trackday.trackTemperature || null,
        trackCondition: trackday.trackCondition || null, // Gère les valeurs null
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
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
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
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const filteredChronos: ({ lapTime: string; isBest: boolean }[] | null) =
      values.chronos
        ?.filter((c): c is { lapTime: string; isBest: boolean } => c.lapTime !== '')
        .map(c => ({ lapTime: c.lapTime, isBest: c.isBest })) || null;

    const payload: UpdateTrackdayPayload = {
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

  const getLocale = () => {
    switch (i18n.language) {
      case 'fr':
        return fr;
      case 'es':
        return es;
      case 'it':
        return it;
      default:
        return enUS;
    }
  };

  const formattedDate = trackday ? format(new Date(trackday.date), 'PPP', { locale: getLocale() }) : '';

  if (isLoading) {
    return <div className="space-y-6">{t('loading_trackday')}</div>;
  }

  if (isError || !trackday) {
    return <div className="space-y-6 text-red-500">{t('error_loading_trackday')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-3xl font-bold">{t('edit_session_of_date', { date: formattedDate })}</h1>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDeleteClick}
          disabled={deleteTrackdayMutation.isPending}
          className="btn-danger"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{deleteTrackdayMutation.isPending ? t('deleting') : t('delete_trackday_button')}</span>
        </Button>
      </div>

      <TrackdayForm
        form={form}
        onSubmit={onSubmit}
        vehicles={vehicles}
        tracks={tracks}
        trackOptions={trackOptions}
        isLoadingVehicles={isLoadingVehicles}
        isErrorVehicles={isErrorVehicles}
        isLoadingTracks={isLoadingTracks}
        isErrorTracks={isErrorTracks}
        isDatePickerOpen={isDatePickerOpen}
        setIsDatePickerOpen={setIsDatePickerOpen}
        isOwner={true}
        submitLabel={t('save_changes')}
        submitDisabled={updateTrackdayMutation.isPending}
        cancelLabel={t('cancel')}
        onCancel={() => navigate(-1)}
      />

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
