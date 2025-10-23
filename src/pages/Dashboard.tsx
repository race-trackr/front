"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Car, Wrench, Plus, Edit } from 'lucide-react'; // Import Edit icon
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { getDashboardSummary } from '@/lib/api/dashboard';
import { getTrackdays } from '@/lib/api/trackdays';
import { getVehicles } from '@/lib/api/vehicles';
import { getMaintenances } from '@/lib/api/maintenances';
import { format } from 'date-fns';
import { fr, enUS, es, it } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();

  const { data: summary, isLoading: isLoadingSummary, isError: isErrorSummary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
  });

  const { data: recentTrackdays, isLoading: isLoadingTrackdays } = useQuery({
    queryKey: ['trackdays', { limit: 3 }],
    queryFn: () => getTrackdays({ limit: 3 }),
  });

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles', { limit: 3 }],
    queryFn: () => getVehicles({ limit: 3 }),
  });

  const { data: maintenances, isLoading: isLoadingMaintenances } = useQuery({
    queryKey: ['maintenances', { limit: 3 }],
    queryFn: () => getMaintenances({ limit: 3 }),
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

  if (isLoadingSummary) {
    return <div>{t('loading')}...</div>;
  }

  if (isErrorSummary) {
    return <div>{t('error_loading_dashboard_summary')}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_trackdays')}</CardTitle>
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-md">
              <CalendarDays className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalTrackdays || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_trackdays')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_vehicles')}</CardTitle>
            <div className="p-2 bg-green-100 text-green-600 rounded-md">
              <Car className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalVehicles || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_vehicles')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_maintenances')}</CardTitle>
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-md">
              <Wrench className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalMaintenances || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_maintenances')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center text-center p-6">
            <h3 className="text-xl font-semibold mb-4">{t('recent_trackdays')}</h3>
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-6" />
            {isLoadingTrackdays ? (
              <div>{t('loading')}...</div>
            ) : recentTrackdays && recentTrackdays.length > 0 ? (
              <ul className="space-y-4 w-full mb-6">
                {recentTrackdays.map((trackday) => (
                  <li key={trackday.id} className="flex items-center justify-between border rounded-md p-3"> {/* Added border, rounded-md, p-3 */}
                    <div className="text-left"> {/* Added text-left for content alignment */}
                      <p className="font-medium">{trackday.vehicleId} - {trackday.trackId}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(trackday.date), 'PPP', { locale: getLocale() })} - {trackday.bestLaptime || t('no_best_laptime')}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="icon"> {/* Changed size to icon and removed text */}
                      <Link to={`/trackdays/edit/${trackday.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">{t('view_edit_details')}</span> {/* Added screen reader text */}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mb-6">{t('no_recent_trackdays')}</p>
            )}
            <Button asChild className="btn-primary-gradient" size="sm">
              <Link to="/trackdays">
                <Plus className="h-4 w-4 mr-2" /> {t('add_trackday')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center text-center p-6">
            <h3 className="text-xl font-semibold mb-4">{t('recent_maintenances')}</h3>
            <Wrench className="h-12 w-12 text-muted-foreground mb-6" />
            {isLoadingMaintenances ? (
              <div>{t('loading')}...</div>
            ) : maintenances && maintenances.length > 0 ? (
              <ul className="space-y-4 w-full mb-6">
                {maintenances.map((maintenance) => (
                  <li key={maintenance.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{maintenance.type} - {maintenance.vehicleId}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(maintenance.date), 'PPP', { locale: getLocale() })} - {maintenance.cost}€
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/maintenances/${maintenance.id}`}>{t('view_edit_details')}</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mb-6">{t('no_recent_maintenances')}</p>
            )}
            <Button asChild className="btn-primary-gradient" size="sm">
              <Link to="/maintenances">
                <Plus className="h-4 w-4 mr-2" /> {t('add_new_maintenance')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;