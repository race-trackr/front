"use client";

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Car, Wrench, Plus, Edit, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardSummary } from "@/lib/api/dashboard";
import { getTrackdays, deleteTrackday } from "@/lib/api/trackdays";
import { getVehicles } from "@/lib/api/vehicles";
import { getMaintenances } from "@/lib/api/maintenances";
import { format } from "date-fns";
import { fr, enUS, es, it } from "date-fns/locale";
import { TrackDayType, UserVehicleType, MaintenanceRecordType } from '@/types';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [trackdayToDelete, setTrackdayToDelete] = React.useState<string | null>(null);

  const {
    data: recentTrackdays,
    isLoading: isLoadingTrackdays,
    isError: isErrorTrackdays,
  } = useQuery<TrackDayType[]>({
    queryKey: ["trackdays", { limit: 3 }],
    queryFn: () => getTrackdays({ limit: 3 }),
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
      toast.success(t('trackday_deleted_successfully'));
      setIsDeleteDialogOpen(false);
      setTrackdayToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_delete_trackday'));
      setIsDeleteDialogOpen(false);
      setTrackdayToDelete(null);
    },
  });

  const handleDeleteClick = (id: string) => {
    setTrackdayToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (trackdayToDelete !== null) {
      deleteTrackdayMutation.mutate(trackdayToDelete);
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

  if (isLoadingMaintenances || isLoadingTrackdays || isLoadingVehicles) {
    return <div>{t("loading")}...</div>;
  }

  if (isErrorMaintenances || isErrorTrackdays || isErrorVehicles) {
    return <div>{t("error_loading_dashboard_summary")}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t("dashboard")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("my_trackdays")}
            </CardTitle>
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-md">
              <CalendarDays className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentTrackdays?.length || 0}
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
            <div className="p-2 bg-green-100 text-green-600 rounded-md">
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
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-md">
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

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center text-center p-6">
            <h3 className="text-xl font-semibold mb-4">
              {t("recent_trackdays")}
            </h3>
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-6" />
            {isLoadingTrackdays ? (
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
                          {trackday.vehicle ? `${trackday.vehicle.brand} ${trackday.vehicle.model}` : trackday.userVehicleId} -
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

                      {/* Ensure buttons are above the full-area link */}
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link to={`/trackdays/edit/${trackday.id}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">
                            {t("view_edit_details")}
                          </span>
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(trackday.id);
                        }}
                        className="btn-danger"
                        disabled={deleteTrackdayMutation.isPending}
                      >
                        <Trash className="h-4 w-4" />
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
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {maintenance.type} - {maintenance.userVehicleId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(maintenance.date), "PPP", {
                          locale: getLocale(),
                        })}
                        - {maintenance.cost}€
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/maintenances/edit/${maintenance.id}`}>
                        {t("view_edit_details")}
                      </Link>
                    </Button>
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

export default Dashboard;