import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Car, Bike, Edit, Trash2, Eye } from 'lucide-react';
import { UserVehicleType } from '@/types/index';
import { useTranslation } from 'react-i18next';
import { deleteVehicle, getVehicles } from '@/lib/api/vehicles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
// Removed import for dangerButtonClasses

const getVehicleIcon = (type: UserVehicleType['type']) => {
  switch (type) {
    case 'car':
      return <Car className="h-5 w-5 text-muted-foreground" />;
    case 'moto':
      return <Bike className="h-5 w-5 text-muted-foreground" />;
    case 'karting':
      return <Car className="h-5 w-5 text-muted-foreground" />;
    default:
      return <Car className="h-5 w-5 text-muted-foreground" />;
  }
};

const VehicleList: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [vehicleToDelete, setVehicleToDelete] = React.useState<number | null>(null);

  const { data: vehicles, isLoading, isError } = useQuery<UserVehicleType[]>({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ limit: 0 }),
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id: number) => deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success(t('vehicle_deleted_successfully'));
      setIsDeleteDialogOpen(false);
      setVehicleToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_delete_vehicle'));
      setIsDeleteDialogOpen(false);
      setVehicleToDelete(null);
    },
  });

  const handleDeleteClick = (id: number) => {
    setVehicleToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (vehicleToDelete !== null) {
      deleteVehicleMutation.mutate(vehicleToDelete);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">{t('loading_vehicles')}</div>;
  }

  if (isError) {
    return <div className="container mx-auto p-4 text-center text-red-500">{t('error_loading_vehicles')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('your_vehicles')}</h1>
        <Button asChild className="btn-primary-gradient">
          <Link to="/vehicles/create">
            <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_vehicle')}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {vehicles && vehicles.length === 0 ? (
          <p className="text-muted-foreground">{t('no_vehicles_added')}</p>
        ) : (
          vehicles?.map((vehicle) => (
            <Card key={vehicle.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{vehicle.brand} {vehicle.model}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  {getVehicleIcon(vehicle.type)}
                  <span className="ml-2">({vehicle.year}) - {t(`type_${vehicle.type.toLowerCase()}`)}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p><strong>{t('license_plate')}:</strong> {vehicle.licensePlate || t('not_specified')}</p>
                {vehicle.image && (
                  <div className="mt-4">
                    <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} className="max-h-32 w-full object-cover rounded-md" />
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t flex justify-between gap-2">
                <Button asChild variant="outline" size="icon">
                  <Link to={`/vehicles/${vehicle.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">{t('view_details')}</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="icon">
                  <Link to={`/vehicles/edit/${vehicle.id}`}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">{t('edit_vehicle_button')}</span>
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteClick(vehicle.id)}
                  disabled={deleteVehicleMutation.isPending}
                  className="btn-danger"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">{deleteVehicleMutation.isPending ? t('deleting') : t('delete_vehicle_button')}</span>
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

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

export default VehicleList;