"use client";

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS, es, it } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTrackdayById, deleteTrackday } from '@/lib/api/trackdays';
import { ArrowLeft, Edit, Trash2, Clock, Gauge, Car, Flag, Cloud, Thermometer, Droplet, BookText, ListOrdered, CalendarDays } from 'lucide-react';
import { TrackDayType } from '@/types';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const TrackdayView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const { data: trackday, isLoading, isError } = useQuery<TrackDayType>({
    queryKey: ['trackday', id],
    queryFn: () => getTrackdayById(id!),
    enabled: !!id,
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

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteTrackdayMutation.mutate();
  };

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

  const calculateAverageLapTime = (chronos: string[] | null): string | null => {
    if (!chronos || chronos.length === 0) return null;

    let totalMilliseconds = 0;
    let validChronosCount = 0;

    chronos.forEach(chrono => {
      const parts = chrono.split('.');
      if (parts.length === 3) {
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        const milliseconds = parseInt(parts[2], 10);

        if (!isNaN(minutes) && !isNaN(seconds) && !isNaN(milliseconds)) {
          totalMilliseconds += (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
          validChronosCount++;
        }
      }
    });

    if (validChronosCount === 0) return null;

    const averageMilliseconds = totalMilliseconds / validChronosCount;

    const avgMinutes = Math.floor(averageMilliseconds / (60 * 1000));
    const remainingMillisecondsAfterMinutes = averageMilliseconds % (60 * 1000);
    const avgSeconds = Math.floor(remainingMillisecondsAfterMinutes / 1000);
    const avgMilliseconds = Math.floor(remainingMillisecondsAfterMinutes % 1000);

    return `${String(avgMinutes).padStart(2, '0')}.${String(avgSeconds).padStart(2, '0')}.${String(avgMilliseconds).padStart(3, '0')}`;
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">{t('loading_trackday')}</div>;
  }

  if (isError || !trackday) {
    return <div className="container mx-auto p-4 text-center text-red-500">{t('error_loading_trackday')}</div>;
  }

  const formattedDate = format(new Date(trackday.date), 'PPP', { locale: getLocale() });
  const averageLapTime = calculateAverageLapTime(trackday.chronos);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('session_of_date', { date: formattedDate })}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/trackdays')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('back_to_trackdays')}
          </Button>
          <Button asChild variant="outline" size="icon">
            <Link to={`/trackdays/edit/${trackday.id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">{t('edit_trackday_button')}</span>
            </Link>
          </Button>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Informations Card (full width on small screens, 2/3 on large) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('trackday_details')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('date')}</p>
              <p className="text-lg">{formattedDate}</p>
            </div>
            {/* Vehicle */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('vehicle')}</p>
              <p className="text-lg">
                {trackday.vehicle ? `${trackday.vehicle.brand} ${trackday.vehicle.model}` : t('not_specified_vehicle')}
              </p>
              {trackday.vehicle?.licensePlate && (
                <p className="text-xs text-muted-foreground">{trackday.vehicle.licensePlate}</p>
              )}
            </div>
            {/* Track */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('track')}</p>
              <p className="text-lg">{trackday.track?.name || trackday.trackId}</p>
              {trackday.track?.city && (
                <p className="text-xs text-muted-foreground">{trackday.track.city}, {trackday.track.country?.name || t('unknown_country')}</p>
              )}
            </div>
            {/* Weather */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('weather')}</p>
              <p className="text-lg">{t(`weather_${trackday.weather}`)}</p>
            </div>
            {/* Air Temperature */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('air_temperature')}</p>
              <p className="text-lg">
                {trackday.airTemperature !== null ? `${trackday.airTemperature}°C` : t('not_specified')}
              </p>
            </div>
            {/* Track Temperature */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('track_temperature')}</p>
              <p className="text-lg">
                {trackday.trackTemperature !== null ? `${trackday.trackTemperature}°C` : t('not_specified')}
              </p>
            </div>
            {/* Track Condition */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('track_condition')}</p>
              <p className="text-lg">{t(`track_condition_${trackday.trackCondition}`)}</p>
            </div>
            {/* Total Laps */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('total_laps')}</p>
              <p className="text-lg">{trackday.totalLaps !== null ? trackday.totalLaps : t('not_specified')}</p>
            </div>
            {/* Total Distance */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('total_distance')}</p>
              <p className="text-lg">{trackday.totalDistance ? `${trackday.totalDistance} km` : t('not_specified')}</p>
            </div>
            {/* Average Laptime */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('average_laptime')}</p>
              <p className="text-lg">{averageLapTime || t('not_available')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Best Lap Time Card (1/3 width on large screens) */}
        <Card className="bg-primary/10 dark:bg-primary/20 text-primary-foreground dark:text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">{t('best_laptime')}</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {trackday.bestLapTime || t('no_best_laptime')}
            </div>
          </CardContent>
        </Card>

        {/* Notes Card (full width) */}
        {trackday.notes && (
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('notes')}</CardTitle>
              <BookText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-lg">{trackday.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* All Chronos Card (full width) */}
        {trackday.chronos && trackday.chronos.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('chronos')}</CardTitle>
              <ListOrdered className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {trackday.chronos.map((chrono, index) => (
                  <li key={index} className="flex items-center justify-between text-lg">
                    <span>{chrono}</span>
                    {chrono === trackday.bestLapTime && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        {t('best_lap')}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

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

export default TrackdayView;