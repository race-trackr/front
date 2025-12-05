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
import { ArrowLeft, Edit, Trash2, Clock, Gauge, Car, Flag, Cloud, Thermometer, Droplet, BookText, ListOrdered, CalendarDays, Sun, CloudRain } from 'lucide-react';
import { TrackDayType, WeatherForecast } from '@/types';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getWeatherForecast } from '@/lib/api/weather'; // Import the mock weather API

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

  const { data: forecast, isLoading: isLoadingForecast, isError: isErrorForecast } = useQuery<WeatherForecast | null>({
    queryKey: ['weatherForecast', trackday?.trackId, trackday?.date],
    queryFn: () => getWeatherForecast(trackday!.trackId, trackday!.date),
    enabled: !!trackday?.trackId && !!trackday?.date,
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

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    const currentLang = i18n.language;
    let formatString = 'dd/MM/yyyy';

    if (currentLang === 'en') {
      formatString = 'yyyy-MM-dd';
    }

    return format(date, formatString, { locale: getLocale() });
  };

  const calculateAverageLapTime = (chronos: { lapTime: string; isBest: boolean }[] | null): string | null => {
    if (!chronos || chronos.length === 0) return null;

    let totalMilliseconds = 0;
    let validChronosCount = 0;

    chronos.forEach(chronoEntry => {
      if (typeof chronoEntry.lapTime === 'string') {
        const parts = chronoEntry.lapTime.split('.');
        if (parts.length === 3) {
          const minutes = parseInt(parts[0], 10);
          const seconds = parseInt(parts[1], 10);
          const milliseconds = parseInt(parts[2], 10);

          if (!isNaN(minutes) && !isNaN(seconds) && !isNaN(milliseconds)) {
            totalMilliseconds += (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
            validChronosCount++;
          }
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

  const getWeatherIcon = (condition: string | null) => {
    switch (condition) {
      case 'clear':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="h-5 w-5 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      default:
        return <Cloud className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">{t('loading_trackday')}</div>;
  }

  if (isError || !trackday) {
    return <div className="p-4 text-center text-red-500">{t('error_loading_trackday')}</div>;
  }

  const formattedDate = getFormattedDate(trackday.date);
  const averageLapTime = calculateAverageLapTime(trackday.chronos) || trackday.bestLapTime;

  const isUpcoming = new Date(trackday.date) > new Date();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-3xl font-bold">{t('session_of_date', { date: formattedDate })}</h1>
        <div className="flex gap-2">
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('trackday_details')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('date')}</p>
              <p className="text-lg">{formattedDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('vehicle')}</p>
              <p className="text-lg">
                {trackday.vehicle ? `${trackday.vehicle.brand} ${trackday.vehicle.model}` : t('not_specified_vehicle')}
              </p>
              {trackday.vehicle?.licensePlate && (
                <p className="text-xs text-muted-foreground">{trackday.vehicle.licensePlate}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('track')}</p>
              <p className="text-lg">{trackday.track?.name || trackday.trackId}</p>
              {trackday.track?.city && (
                <p className="text-xs text-muted-foreground">{trackday.track.city}, {trackday.track.country?.name || t('unknown_country')}</p>
              )}
            </div>
            {isUpcoming && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('weather')} ({t('forecast')})</p>
                  {isLoadingForecast ? (
                    <p className="text-lg">{t('loading_forecast')}...</p>
                  ) : isErrorForecast || !forecast ? (
                    <p className="text-lg">{t('no_forecast_available')}</p>
                  ) : (
                    <div className="flex items-center gap-2 text-lg">
                      {getWeatherIcon(forecast.weather)}
                      <span>{forecast.weather ? t(`weather_${forecast.weather}`) : t('not_specified')}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('air_temperature')} ({t('forecast')})</p>
                  {isLoadingForecast ? (
                    <p className="text-lg">{t('loading_forecast')}...</p>
                  ) : isErrorForecast || !forecast ? (
                    <p className="text-lg">{t('no_forecast_available')}</p>
                  ) : (
                    <p className="text-lg">
                      {forecast.airTemperature !== null ? `${forecast.airTemperature}°C` : t('not_specified')}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('track_temperature')} ({t('forecast')})</p>
                  {isLoadingForecast ? (
                    <p className="text-lg">{t('loading_forecast')}...</p>
                  ) : isErrorForecast || !forecast ? (
                    <p className="text-lg">{t('no_forecast_available')}</p>
                  ) : (
                    <p className="text-lg">
                      {forecast.trackTemperature !== null ? `${forecast.trackTemperature}°C` : t('not_specified')}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('track_condition')} ({t('forecast')})</p>
                  {isLoadingForecast ? (
                    <p className="text-lg">{t('loading_forecast')}...</p>
                  ) : isErrorForecast || !forecast ? (
                    <p className="text-lg">{t('no_forecast_available')}</p>
                  ) : (
                    <p className="text-lg">{forecast.trackCondition ? t(`track_condition_${forecast.trackCondition}`) : t('not_specified')}</p>
                  )}
                </div>
              </>
            )}
            {!isUpcoming && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('weather')}</p>
                  <p className="text-lg">{trackday.weather ? t(`weather_${trackday.weather}`) : t('not_specified')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('air_temperature')}</p>
                  <p className="text-lg">
                    {trackday.airTemperature !== null ? `${trackday.airTemperature}°C` : t('not_specified')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('track_temperature')}</p>
                  <p className="text-lg">
                    {trackday.trackTemperature !== null ? `${trackday.trackTemperature}°C` : t('not_specified')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('track_condition')}</p>
                  <p className="text-lg">{trackday.trackCondition ? t(`track_condition_${trackday.trackCondition}`) : t('not_specified')}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('total_laps')}</p>
              <p className="text-lg">{trackday.totalLaps !== null ? trackday.totalLaps : t('not_specified')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('total_distance')}</p>
              <p className="text-lg">{trackday.totalDistance ? `${trackday.totalDistance} km` : t('not_specified')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('average_laptime')}</p>
              <p className="text-lg">{averageLapTime || t('not_available')}</p>
            </div>
          </CardContent>
        </Card>

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

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('chronos')}</CardTitle>
            <ListOrdered className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {trackday.chronos && trackday.chronos.length > 0 ? (
              <ul className="space-y-2">
                {trackday.chronos.map((chronoEntry, index) => (
                  <li key={index} className="flex items-center justify-between text-lg">
                    <span>{chronoEntry.lapTime}</span>
                    {chronoEntry.isBest && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        {t('best_lap')}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">{t('no_chronos_recorded')}</p>
            )}
          </CardContent>
        </Card>
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