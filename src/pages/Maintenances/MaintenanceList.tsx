import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Wrench, Edit, Trash2, DollarSign, CalendarDays } from 'lucide-react';
import { MaintenanceRecordType } from '@/types';
import { useTranslation } from 'react-i18next';
import { deleteMaintenance, getMaintenances } from '@/lib/api/maintenances';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr, enUS, es, it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import MaintenanceCostChart from '@/components/MaintenanceCostChart';

const MaintenanceList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg font-normal'>{t('total_cost')}</CardTitle>
              <span className='p-2 bg-primary/10 text-red-700 rounded-lg'>
                <DollarSign className='h-6 w-6 text-primary' />
              </span>
            </div>
            <p className="text-2xl font-bold">
              {maintenances?.reduce((sum, m) => sum + (Number(m.cost) || 0), 0).toFixed(2)}€
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg font-normal'>{t('upcoming_maintenances')}</CardTitle>
              <span className='p-2 bg-primary/10 text-red-700 rounded-lg'>
                <CalendarDays className='h-6 w-6 text-primary' />
              </span>
            </div>
            <p className="text-2xl font-bold">
              {maintenances?.filter(m => m.date && new Date(m.date) > new Date()).length || 0}
            </p>
          </CardHeader>
        </Card>
      </div>

      {maintenances && <MaintenanceCostChart maintenances={maintenances} />}

      <div className="grid grid-cols-1 gap-6">
        {maintenances && maintenances.length === 0 ? (
          <Card className="w-full mx-auto text-center p-6 col-span-full">
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <Wrench className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">{t('no_maintenances_recorded')}</p>
              <Button asChild className="btn-primary-gradient">
                <Link to="/maintenances/create">
                  <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_maintenance')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          maintenances?.map((maintenance) => (
            <Card
              key={maintenance.id}
              className="flex flex-col transition-all duration-200 ease-in-out hover:shadow-lg hover:border-primary"
            >
              <Link to={`/maintenances/${maintenance.id}`} className="block h-full p-6">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-4 flex-1 pr-4">
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-md font-bold text-white flex-shrink-0",
                      "bg-gradient-to-r from-red-500 to-orange-500"
                    )}>
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{maintenance.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t(`maintenance_type_${maintenance.type}`)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-medium">{format(new Date(maintenance.date), 'PPP', { locale: getLocale() })}</p>
                    <p className="text-lg font-bold">{maintenance.cost !== null ? `${Number(maintenance.cost).toFixed(2)}€` : t('not_specified')}</p>
                  </div>
                  {/* Removed nested Link, now the button directly navigates */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the outer Link from triggering
                        e.preventDefault(); // Prevent default navigation behavior
                        navigate(`/maintenances/edit/${maintenance.id}`);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{t('edit_maintenance_button')}</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the outer Link from triggering
                        e.preventDefault(); // Prevent default navigation behavior
                        handleDeleteClick(maintenance.id);
                      }}
                      disabled={deleteMaintenanceMutation.isPending}
                      className="btn-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{deleteMaintenanceMutation.isPending ? t('deleting') : t('delete_maintenance_button')}</span>
                    </Button>
                  </div>
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
