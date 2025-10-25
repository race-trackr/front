"use client";

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS, es, it } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMaintenanceById, deleteMaintenance } from '@/lib/api/maintenances';
import { ArrowLeft, Edit, Trash2, Wrench, CalendarDays, GaugeCircle, DollarSign } from 'lucide-react';
import { MaintenanceRecordType } from '@/types';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const MaintenanceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const maintenanceId = Number(id);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const { data: maintenance, isLoading, isError } = useQuery<MaintenanceRecordType>({
    queryKey: ['maintenance', maintenanceId],
    queryFn: () => getMaintenanceById(maintenanceId),
    enabled: !!maintenanceId && !isNaN(maintenanceId),
  });

  const deleteMaintenanceMutation = useMutation({
    mutationFn: () => deleteMaintenance(maintenanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['vehicleMaintenances'] }); // Invalidate related vehicle maintenances
      toast.success(t('maintenance_deleted_successfully'));
      navigate('/maintenances');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_delete_maintenance'));
    },
  });

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMaintenanceMutation.mutate();
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

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">{t('loading_maintenance')}</div>;
  }

  if (isError || !maintenance) {
    return <div className="container mx-auto p-4 text-center text-red-500">{t('error_loading_maintenance')}</div>;
  }

  const formattedDate = format(new Date(maintenance.date), 'PPP', { locale: getLocale() });
  const formattedNextDueDate = maintenance.nextDueDate ? format(new Date(maintenance.nextDueDate), 'PPP', { locale: getLocale() }) : t('not_specified');

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-3xl font-bold">{maintenance.name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="icon">
            <Link to={`/maintenances/edit/${maintenance.id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">{t('edit_maintenance_button')}</span>
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDeleteClick}
            disabled={deleteMaintenanceMutation.isPending}
            className="btn-danger"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{deleteMaintenanceMutation.isPending ? t('deleting') : t('delete_maintenance_button')}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('maintenance_details')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('maintenance_name')}</p>
              <p className="text-lg">{maintenance.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('vehicle')}</p>
              <p className="text-lg">
                {maintenance.vehicle ? `${maintenance.vehicle.brand} ${maintenance.vehicle.model}` : t('not_specified_vehicle')}
              </p>
              {maintenance.vehicle?.licensePlate && (
                <p className="text-xs text-muted-foreground">{maintenance.vehicle.licensePlate}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('type')}</p>
              <p className="text-lg">{t(`maintenance_type_${maintenance.type}`)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('date')}</p>
              <p className="text-lg">{formattedDate}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">{t('description')}</p>
              <p className="text-lg">{maintenance.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-primary/10 dark:bg-primary/20 text-primary-foreground dark:text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">{t('cost')}</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {maintenance.cost !== null ? `${maintenance.cost.toFixed(2)}€` : t('not_specified')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('mileage')}</CardTitle>
              <GaugeCircle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {maintenance.mileage !== null ? `${maintenance.mileage} km` : t('not_specified')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Due Card (full width) */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('next_due')}</CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('next_due_date')}</p>
              <p className="text-lg">{formattedNextDueDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('next_due_mileage')}</p>
              <p className="text-lg">
                {maintenance.nextDueMileage !== null ? `${maintenance.nextDueMileage} km` : t('not_specified')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_maintenance_title')}
        description={t('confirm_delete_maintenance_description')}
        confirmButtonText={t('delete_maintenance_button')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteMaintenanceMutation.isPending}
      />
    </div>
  );
};

export default MaintenanceView;