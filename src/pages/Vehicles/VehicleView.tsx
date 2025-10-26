"use client";

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS, es, it } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getVehicleById, deleteVehicle } from '@/lib/api/vehicles';
import { getMaintenances } from '@/lib/api/maintenances';
import { ArrowLeft, Edit, Wrench, PlusCircle, Trash2 } from 'lucide-react';
import { UserVehicleType, MaintenanceRecordType } from '@/types';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { toast } from 'sonner';

const VehicleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number(id);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const { data: vehicle, isLoading, isError } = useQuery<UserVehicleType>({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => getVehicleById(vehicleId),
    enabled: !!vehicleId && !isNaN(vehicleId),
  });

  const { data: maintenances, isLoading: isLoadingMaintenances, isError: isErrorMaintenances } = useQuery<MaintenanceRecordType[]>({
    queryKey: ['vehicleMaintenances', vehicleId],
    queryFn: () => getMaintenances({ userVehicleId: vehicleId, limit: 0 }),
    enabled: !!vehicleId && !isNaN(vehicleId),
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: () => deleteVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success(t('vehicle_deleted_successfully'));
      navigate('/vehicles');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_delete_vehicle'));
    },
  });

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteVehicleMutation.mutate();
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
    return <div className="mx-auto p-4 text-center">{t('loading_vehicle')}</div>;
  }

  if (isError || !vehicle) {
    return <div className="mx-auto p-4 text-center text-red-500">{t('error_loading_vehicle')}</div>;
  }

  return (
    <div className="mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-3xl font-bold">{`${vehicle.brand} ${vehicle.model}`}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="icon">
            <Link to={`/vehicles/edit/${vehicle.id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">{t('edit_vehicle_button')}</span>
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDeleteClick}
            disabled={deleteVehicleMutation.isPending}
            className="btn-danger"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{deleteVehicleMutation.isPending ? t('deleting') : t('delete_vehicle_button')}</span>
          </Button>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('vehicle_details')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_brand')}</p>
            <p className="text-lg">{vehicle.brand}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_model')}</p>
            <p className="text-lg">{vehicle.model}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_year')}</p>
            <p className="text-lg">{vehicle.year}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_type')}</p>
            <p className="text-lg">{t(`type_${vehicle.type.toLowerCase()}`)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_license_plate')}</p>
            <p className="text-lg">{vehicle.licensePlate || t('not_specified')}</p>
          </div>
          {vehicle.image && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('vehicle_image')}</p>
              <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} className="mt-2 max-h-32 object-cover rounded-md" />
            </div>
          )}
          {vehicle.details && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">{t('details')}</p>
              <p className="text-lg">{vehicle.details}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('maintenance_history')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingMaintenances ? (
            <div className="text-center">{t('loading_vehicle_maintenances')}</div>
          ) : isErrorMaintenances ? (
            <div className="text-center text-red-500">{t('error_loading_vehicle_maintenances')}</div>
          ) : maintenances && maintenances.length > 0 ? (
            <ul className="space-y-4">
              {maintenances.map((maintenance) => (
                <li key={maintenance.id} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-medium">{maintenance.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t(`maintenance_type_${maintenance.type}`)} - {format(new Date(maintenance.date), 'PPP', { locale: getLocale() })}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/maintenances/edit/${maintenance.id}`}>
                      {t('view_edit_details')}
                    </Link>
                  </Button>
                </li>
              ))}
              <div className="pt-4">
                <Button asChild className="btn-primary-gradient w-full">
                  <Link to={`/maintenances/create?vehicleId=${vehicle.id}`}>
                    <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_maintenance')}
                  </Link>
                </Button>
              </div>
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{t('no_maintenance_records')}</p>
              <Button asChild className="btn-primary-gradient">
                <Link to={`/maintenances/create?vehicleId=${vehicle.id}`}>
                  <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_maintenance')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_vehicle_title')}
        description={t('confirm_delete_vehicle_description')}
        confirmButtonText={t('delete_vehicle_button')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteVehicleMutation.isPending}
      />
    </div>
  );
};

export default VehicleView;