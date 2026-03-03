import { useContext, useState, FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import TrackdayForm from '@/components/TrackdayForm';
import { createTrackday } from '@/lib/api/trackdays';
import { getVehicles } from '@/lib/api/vehicles';
import { UserVehicleType, CreateTrackdayPayload, TrackType } from '@/types';
import { AuthContext } from '@/context/AuthContext';
import { format } from 'date-fns';
import apiClient from '@/lib/apiClient';

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

const TrackdayCreate: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // État pour contrôler l'ouverture du DatePicker

  const auth = useContext(AuthContext);
  const isOwner = auth?.user?.role === 'owner';

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
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
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

  const trackOptions = useMemo(() => {
    return tracks?.map(track => ({
      value: track.id.toString(),
      label: `${track.name} (${track.country?.name || t('unknown_country')})`
    })) || [];
  }, [tracks, t]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">{t('create_new_trackday')}</h1>
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
        isOwner={isOwner}
        submitLabel={t('create_trackday')}
        submitDisabled={createTrackdayMutation.isPending}
        cancelLabel={t('cancel')}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default TrackdayCreate;
