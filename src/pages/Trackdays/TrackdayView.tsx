"use client";

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS, es, it } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTrackdayById } from '@/lib/api/trackdays';
import { ArrowLeft, Edit } from 'lucide-react';
import { TrackDayType } from '@/types'; // Changed Trackday to TrackDayType

const TrackdayView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data: trackday, isLoading, isError } = useQuery<TrackDayType>({ // Changed Trackday to TrackDayType
    queryKey: ['trackday', id],
    queryFn: () => getTrackdayById(id!),
    enabled: !!id,
  });

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

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">{t('loading_trackday')}</div>;
  }

  if (isError || !trackday) {
    return <div className="container mx-auto p-4 text-center text-red-500">{t('error_loading_trackday')}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('view_trackday', { id: trackday.id })}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/trackdays')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('back_to_trackdays')}
          </Button>
          <Button asChild className="btn-primary-gradient">
            <Link to={`/trackdays/edit/${trackday.id}`}>
              <Edit className="mr-2 h-4 w-4" /> {t('edit_trackday_button')}
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('trackday_details')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('date')}</p>
            <p className="text-lg">{format(new Date(trackday.date), 'PPP', { locale: getLocale() })}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{trackday.vehicle?.brand ? t('vehicle') : t('vehicle_id_placeholder')}</p>
            <p className="text-lg">{trackday.vehicle ? `${trackday.vehicle.brand} ${trackday.vehicle.model}` : trackday.userVehicleId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{trackday.track?.name ? t('track') : t('track_id_placeholder')}</p>
            <p className="text-lg">{trackday.track?.name || trackday.trackId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('weather')}</p>
            <p className="text-lg">{t(`weather_${trackday.weather}`)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('air_temperature')}</p>
            <p className="text-lg">{trackday.airTemperature !== null ? `${trackday.airTemperature}°C` : t('not_specified')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('track_temperature')}</p>
            <p className="text-lg">{trackday.trackTemperature !== null ? `${trackday.trackTemperature}°C` : t('not_specified')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('track_condition')}</p>
            <p className="text-lg">{t(`track_condition_${trackday.trackCondition}`)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('best_laptime')}</p>
            <p className="text-lg">{trackday.bestLapTime || t('no_best_laptime')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('total_laps')}</p>
            <p className="text-lg">{trackday.totalLaps !== null ? trackday.totalLaps : t('not_specified')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('total_distance')}</p>
            <p className="text-lg">{trackday.totalDistance !== null ? `${trackday.totalDistance} km` : t('not_specified')}</p>
          </div>
          {trackday.chronos && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('chronos')}</p>
              <p className="text-lg">{trackday.chronos}</p>
            </div>
          )}
          {trackday.notes && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">{t('notes')}</p>
              <p className="text-lg">{trackday.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackdayView;