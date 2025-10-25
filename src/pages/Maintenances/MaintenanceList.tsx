import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Wrench, Edit, Trash2 } from 'lucide-react';
import { MaintenanceRecordType } from '@/types';
import { useTranslation } from 'react-i18next';
import { deleteMaintenance, getMaintenances } from '@/lib/api/maintenances';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr, enUS, es, it } from 'date-fns/locale';

const MaintenanceList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = React.useState<number | null>(null);

  const { data: maintenances, isLoading, isError } = useQuery<MaintenanceRecordType[]>({
    queryKey: ['maintenances'],
    queryFn: () => getMaintenances({ limit: 0 }),
  });

  const deleteMaintenanceMutation = useMutation({
    mutationFn: (id: number) => deleteMaintenance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      toast.success(t('maintenance_deleted_successfully'));
      setIsDeleteDialogOpen(false);
      setMaintenanceToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_delete_maintenance'));
      setIsDeleteDialogOpen(false);
      setMaintenanceToDelete(null);
    },
  });

  const handleDeleteClick = (id: number) => {
    setMaintenanceToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (maintenanceToDelete !== null) {
      deleteMaintenanceMutation.mutate(maintenanceToDelete);
    }
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
    return <div className="text-center">{t('loading_maintenances')}</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500">{t('error_loading_maintenances')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('your_maintenances')}</h1>
        <Button asChild className="btn-primary-gradient">
          <Link to="/maintenances/create">
            <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_maintenance')}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className=''>
                {t('total_maintenances')}
                <p className="text-2xl font-bold mt-2">{maintenances?.length || 0}</p></div>
              <span className='p-2 bg-primary/10 text-red-700 rounded-lg'>
                <Wrench className='h-6 w-6 text-primary' />
              </span>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg font-normal'>{t('total_cost')}</CardTitle>
            <p className="text-2xl font-bold">
              {maintenances?.reduce((sum, m) => sum + (m.cost || 0), 0).toFixed(2)}€
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg font-normal'>{t('upcoming_maintenances')}</CardTitle>
            <p className="text-2xl font-bold">
              {maintenances?.filter(m => m.nextDueDate && new Date(m.nextDueDate) > new Date()).length || 0}
            </p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {maintenances && maintenances.length === 0 ? (
          <p className="text-muted-foreground">{t('no_maintenances_recorded')}</p>
        ) : (
          maintenances?.map((maintenance) => (
            <Card key={maintenance.id} className="flex flex-col">
              {/* The entire card is now a link to the view page */}
              <Link to={`/maintenances/${maintenance.id}`} className="block h-full p-6">
                <CardTitle className="text-lg mb-2">{maintenance.name}</CardTitle>
                <p className="text-sm text-muted-foreground mb-4">For Vehicle ID: {maintenance.userVehicleId}</p>
                <div className="space-y-2">
                  <p><strong>{t('type')}:</strong> {t(`maintenance_type_${maintenance.type}`)}</p>
                  <p><strong>{t('date')}:</strong> {format(new Date(maintenance.date), 'PPP', { locale: getLocale() })}</p>
                  <p><strong>{t('cost')}:</strong> ${maintenance.cost?.toFixed(2) || '0.00'}</p>
                  <p><strong>{t('mileage')}:</strong> {maintenance.mileage || t('not_specified')} km</p>
                  {maintenance.nextDueDate && <p><strong>{t('next_due_date')}:</strong> {format(new Date(maintenance.nextDueDate), 'PPP', { locale: getLocale() })}</p>}
                  {maintenance.nextDueMileage && <p><strong>{t('next_due_mileage')}:</strong> {maintenance.nextDueMileage} km</p>}
                </div>
                {/* Buttons moved inside CardContent, aligned right */}
                <div className="flex justify-end items-center gap-2 pt-4">
                  <Button asChild variant="outline" size="icon" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/maintenances/edit/${maintenance.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{t('edit_maintenance_button')}</span>
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigation when deleting
                      handleDeleteClick(maintenance.id);
                    }}
                    disabled={deleteMaintenanceMutation.isPending}
                    className="btn-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{deleteMaintenanceMutation.isPending ? t('deleting') : t('delete_maintenance_button')}</span>
                  </Button>
                </div>
              </Link>
            </Card>
          ))
        )}
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

export default MaintenanceList;