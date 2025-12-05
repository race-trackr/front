"use client";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Car, Wrench, Plus, Edit, Trash2, Cloud, Thermometer, Droplet, Sun, CloudRain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardSummary } from "@/lib/api/dashboard";
import { getTrackdays, deleteTrackday } from "@/lib/api/trackdays";
import { getMaintenances, deleteMaintenance } from "@/lib/api/maintenances";
import { getVehicles } from "@/lib/api/vehicles";
import { getWeatherForecast } from '@/lib/api/weather'; // Import the mock weather API
import { format } from "date-fns";
import { fr, enUS, es, it } from "date-fns/locale";
import { TrackDayType, UserVehicleType, MaintenanceRecordType, PaginatedResponse, WeatherForecast } from '@/types';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isTrackdayDeleteDialogOpen, setIsTrackdayDeleteDialogOpen] = React.useState(false);
  const [trackdayToDelete, setTrackdayToDelete] = React.useState<string | null>(null);

  const [isMaintenanceDeleteDialogOpen, setIsMaintenanceDeleteDialogOpen] = React.useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = React.useState<number | null>(null);

  const {
    data: recentTrackdaysResponse,
    isLoading: isLoadingRecentTrackdays, // Renamed for clarity
    isError: isErrorRecentTrackdays,
  } = useQuery<PaginatedResponse<TrackDayType>>({
    queryKey: ["trackdays", { limit: 3, recent: true }],
    queryFn: () => getTrackdays({ limit: 3 }),
  });

  const {
    data: allTrackdaysResponse,
    isLoading: isLoadingAllTrackdays, // New query for all trackdays
    isError: isErrorAllTrackdays,
  } = useQuery<PaginatedResponse<TrackDayType>>({
    queryKey: ["allTrackdays"],
    queryFn: () => getTrackdays({ limit: 100 }), // Fetch a reasonable number for client-side filtering
  });

  const {
    data: vehicles,
    isLoading: isLoadingVehicles,
    isError: isErrorVehicles,
  } = useQuery<UserVehicleType[]>({
    queryKey: ["vehicles", { limit: 3 }],
    queryFn: () => getVehicles({ limit: 3 }),
  });

  const {
    data: maintenances,
    isLoading: isLoadingMaintenances,
    isError: isErrorMaintenances,
  } = useQuery<MaintenanceRecordType[]>({
    queryKey: ["maintenances", { limit: 3 }],
    queryFn: () => getMaintenances({ limit: 3 }),
  });

  const deleteTrackdayMutation = useMutation({
    mutationFn: (id: string) => deleteTrackday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackdays'] });
      queryClient.invalidateQueries({ queryKey: ['allTrackdays'] }); // Invalidate all trackdays query
      toast.success(t('trackday_deleted_successfully'));
      setIsTrackdayDeleteDialogOpen(false);
      setTrackdayToDelete(null);
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
      setIsTrackdayDeleteDialogOpen(false);
      setTrackdayToDelete(null);
    },
  });

  const deleteMaintenanceMutation = useMutation({
    mutationFn: (id: number) => deleteMaintenance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      toast.success(t('maintenance_deleted_successfully'));
      setIsMaintenanceDeleteDialogOpen(false);
      setMaintenanceToDelete(null);
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
      setIsMaintenanceDeleteDialogOpen(false);
      setMaintenanceToDelete(null);
    },
  });

  const handleDeleteTrackdayClick = (id: string) => {
    setTrackdayToDelete(id);
    setIsTrackdayDeleteDialogOpen(true);
  };

  const handleConfirmTrackdayDelete = () => {
    if (trackdayToDelete !== null) {
      deleteTrackdayMutation.mutate(trackdayToDelete);
    }
  };

  const handleDeleteMaintenanceClick = (id: number) => {
    setMaintenanceToDelete(id);
    setIsMaintenanceDeleteDialogOpen(true);
  };

  const handleConfirmMaintenanceDelete = () => {
    if (maintenanceToDelete !== null) {
      deleteMaintenanceMutation.mutate(maintenanceToDelete);
    }
  };

  const getLocale = () => {
    switch (i18n.language) {
      case "fr":
        return fr;
      case "es":
        return es;
      case "it":
        return it;
      default:
        return enUS;
    }
  };

  // Extract the actual trackday data from the paginated response
  const recentTrackdays = recentTrackdaysResponse?.data || [];
  const totalTrackdaysCount = recentTrackdaysResponse?.meta?.total || 0;

  const upcomingTrackdays = React.useMemo(() => {
    if (!allTrackdaysResponse?.data) return [];
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize 'now' to start of day for comparison
    return allTrackdaysResponse.data
      .filter(td => new Date(td.date) >= now) // Include today's trackdays if they haven't passed
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3); // Take top 3 upcoming
  }, [allTrackdaysResponse]);

  // Component to display weather forecast for a single trackday
  const WeatherForecastDisplay: React.FC<{ trackday: TrackDayType }> = ({ trackday }) => {
    const { t } = useTranslation();
    const { data: forecast, isLoading: isLoadingForecast, isError: isErrorForecast } = useQuery<WeatherForecast | null>({
      queryKey: ['weatherForecast', trackday.trackId, trackday.date],
      queryFn: () => getWeatherForecast(trackday.trackId, trackday.date),
      enabled: !!trackday.trackId && !!trackday.date,
    });

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

    if (isLoadingForecast) {
      return <span className="text-sm text-muted-foreground">{t('loading_forecast')}...</span>;
    }

    if (isErrorForecast || !forecast) {
      return <span className="text-sm text-muted-foreground">{t('no_forecast_available')}</span>;
    }

    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {getWeatherIcon(forecast.weather)}
        <span>{forecast.airTemperature !== null ? `${forecast.airTemperature}°C` : t('not_specified')}</span>
        {forecast.trackCondition && (
          <span className="ml-1">({t(`track_condition_${forecast.trackCondition}`)})</span>
        )}
      </div>
    );
  };

  if (isLoadingMaintenances || isLoadingRecentTrackdays || isLoadingVehicles || isLoadingAllTrackdays) {
    return <div>{t("loading")}...</div>;
  }

  if (isErrorMaintenances || isErrorRecentTrackdays || isErrorVehicles || isErrorAllTrackdays) {
    return <div>{t("error_loading_dashboard_summary")}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">{t("dashboard")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("my_trackdays")}
            </CardTitle>
            <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 rounded-md">
              <CalendarDays className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTrackdaysCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("total_trackdays")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("my_vehicles")}
            </CardTitle>
            <div className="p-2 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 rounded-md">
              <Car className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("total_vehicles")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("my_maintenances")}
            </CardTitle>
            <div className="p-2 bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300 rounded-md">
              <Wrench className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenances?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("total_maintenances")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {/* Changed to 2 columns for better layout with new card */}
        <Card>
          <CardContent className="flex flex-col items-center text-center p-6">
            <h3 className="text-xl font-semibold mb-4">
              {t("recent_trackdays")}
            </h3>
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-6" />
            {isLoadingRecentTrackdays ? (
              <div>{t("loading")}...</div>
            ) : recentTrackdays && recentTrackdays.length > 0 ? (
              <ul className="space-y-4 w-full mb-6">
                {recentTrackdays.map((trackday) => (
                  <li
                    key={trackday.id}
                    className="relative flex items-center justify-between border rounded-md p-3 group hover:bg-accent/50 transition-colors"
                  >
                    <Link
                      to={`/trackdays/${trackday.id}`} className="w-full">
                      <div className="flex-1 text-left z-10">
                        <p className="font-medium">
                          {trackday.vehicle ? `${trackday.vehicle.name}` : trackday.userVehicleId} -
                          {trackday.track?.name || trackday.trackId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(trackday.date), "PPP", {
                            locale: getLocale(),
                          })}
                          - {trackday.bestLapTime || t("no_best_laptime")}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          navigate(`/trackdays/edit/${trackday.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">
                          {t("view_edit_details")}
                        </span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteTrackdayClick(trackday.id);
                        }}
                        className="btn-danger"
                        disabled={deleteTrackdayMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t("delete_trackday")}</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mb-6">
                {t("no_recent_trackdays")}
              </p>
            )}
            <Button asChild className="btn-primary-gradient" size="sm">
              <Link to="/trackdays/create">
                <Plus className="h-4 w-4 mr-2" /> {t("add_trackday")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center text-center p-6">
            <h3 className="text-xl font-semibold mb-4">
              {t("upcoming_trackdays")}
            </h3>
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-6" />
            {isLoadingAllTrackdays ? (
              <div>{t("loading")}...</div>
            ) : upcomingTrackdays && upcomingTrackdays.length > 0 ? (
              <ul className="space-y-4 w-full mb-6">
                {upcomingTrackdays.map((trackday) => (
                  <li
                    key={trackday.id}
                    className="relative flex flex-col items-start justify-between border rounded-md p-3 group hover:bg-accent/50 transition-colors"
                  >
                    <Link
                      to={`/trackdays/${trackday.id}`} className="w-full flex-1">
                      <div className="flex-1 text-left z-10">
                        <p className="font-medium">
                          {trackday.vehicle ? `${trackday.vehicle.name}` : trackday.userVehicleId} -
                          {trackday.track?.name || trackday.trackId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(trackday.date), "PPP", {
                            locale: getLocale(),
                          })}
                        </p>
                        <WeatherForecastDisplay trackday={trackday} />
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 z-10 absolute top-3 right-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          navigate(`/trackdays/edit/${trackday.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">
                          {t("view_edit_details")}
                        </span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteTrackdayClick(trackday.id);
                        }}
                        className="btn-danger"
                        disabled={deleteTrackdayMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t("delete_trackday")}</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mb-6">
                {t("no_upcoming_trackdays")}
              </p>
            )}
            <Button asChild className="btn-primary-gradient" size="sm">
              <Link to="/trackdays/create">
                <Plus className="h-4 w-4 mr-2" /> {t("add_trackday")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2"> {/* This card now spans 2 columns */}
          <CardContent className="flex flex-col items-center text-center p-6">
            <h3 className="text-xl font-semibold mb-4">
              {t("recent_maintenances")}
            </h3>
            <Wrench className="h-12 w-12 text-muted-foreground mb-6" />
            {isLoadingMaintenances ? (
              <div>{t("loading")}...</div>
            ) : maintenances && maintenances.length > 0 ? (
              <ul className="space-y-4 w-full mb-6">
                {maintenances.map((maintenance) => (
                  <li
                    key={maintenance.id}
                    className="relative flex items-center justify-between border rounded-md p-3 group hover:bg-accent/50 transition-colors"
                  >
                    <Link to={`/maintenances/${maintenance.id}`} className="w-full">
                      <div className="flex-1 text-left z-10">
                        <p className="font-medium">
                          {maintenance.name} - {maintenance.vehicle ? `${maintenance.vehicle.name}` : maintenance.userVehicleId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(maintenance.date), "PPP", {
                            locale: getLocale(),
                          })}
                          - {maintenance.cost}€
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          navigate(`/maintenances/edit/${maintenance.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">{t("view_edit_details")}</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteMaintenanceClick(maintenance.id);
                        }}
                        className="btn-danger"
                        disabled={deleteMaintenanceMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t("delete_maintenance_button")}</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mb-6">
                {t("no_recent_maintenances")}
              </p>
            )}
            <Button asChild className="btn-primary-gradient" size="sm">
              <Link to="/maintenances/create">
                <Plus className="h-4 w-4 mr-2" /> {t("add_new_maintenance")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        isOpen={isTrackdayDeleteDialogOpen}
        onClose={() => setIsTrackdayDeleteDialogOpen(false)}
        onConfirm={handleConfirmTrackdayDelete}
        title={t('confirm_delete_trackday_title')}
        description={t('confirm_delete_trackday_description')}
        confirmButtonText={t('delete_trackday_button')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteTrackdayMutation.isPending}
      />

      <ConfirmDeleteDialog
        isOpen={isMaintenanceDeleteDialogOpen}
        onClose={() => setIsMaintenanceDeleteDialogOpen(false)}
        onConfirm={handleConfirmMaintenanceDelete}
        title={t('confirm_delete_maintenance_title')}
        description={t('confirm_delete_maintenance_description')}
        confirmButtonText={t('delete_maintenance_button')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteMaintenanceMutation.isPending}
      />
    </div>
  );
};

export default Dashboard;