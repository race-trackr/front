import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { UserVehicleType, UpdateMaintenancePayload, MaintenanceRecordType } from '@/types';
import { getMaintenanceById, updateMaintenance, deleteMaintenance } from '@/lib/api/maintenances';
import { getVehicles } from '@/lib/api/vehicles';
import { Trash2, ArrowLeft } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { fr, enUS, es, it } from 'date-fns/locale';

// shared form & schema
import MaintenanceForm, {
  maintenanceFormSchema,
  MaintenanceFormValues,
} from '@/components/MaintenanceForm';

// schema pulled from MaintenanceForm component.

const MaintenanceEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const maintenanceId = Number(id);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      userVehicleId: 0,
      name: '',
      type: 'maintenance',
      date: format(new Date(), 'yyyy-MM-dd'),
      details: null,
      cost: null,
      mileage: null,
      nextDueMileage: null,
    },
  });

  const { data: maintenance, isLoading, isError } = useQuery<MaintenanceRecordType>({
    queryKey: ['maintenance', maintenanceId],
    queryFn: () => getMaintenanceById(maintenanceId),
    enabled: !!maintenanceId && !isNaN(maintenanceId),
  });

  const { data: vehicles, isLoading: isLoadingVehicles, isError: isErrorVehicles } = useQuery<UserVehicleType[]>({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ limit: 0 }),
  });

  useEffect(() => {
    if (maintenance) {
      form.reset({
        userVehicleId: maintenance.userVehicleId,
        name: maintenance.name,
        type: maintenance.type,
        date: maintenance.date,
        details: maintenance.details || null,
        cost: maintenance.cost || null,
        mileage: maintenance.mileage || null,
        nextDueMileage: maintenance.nextDueMileage || null,
      });
    }
  }, [maintenance, form]);

  const updateMaintenanceMutation = useMutation({
    mutationFn: (payload: UpdateMaintenancePayload) => updateMaintenance(maintenanceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance', maintenanceId] });
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      toast.success(t('maintenance_updated_successfully'));
      navigate('/maintenances');
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
    },
  });

  const deleteMaintenanceMutation = useMutation({
    mutationFn: () => deleteMaintenance(maintenanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['vehicleMaintenances'] });
      toast.success(t('maintenance_deleted_successfully'));
      navigate('/maintenances');
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')); // Generic error message
    },
  });

  const onSubmit = (values: MaintenanceFormValues) => {
    const payload: UpdateMaintenancePayload = {
      ...values,
      name: values.name,
      details: values.details === '' ? null : values.details,
      cost: values.cost === undefined ? null : values.cost,
      mileage: values.mileage === undefined ? null : values.mileage,
      nextDueMileage: values.nextDueMileage === undefined ? null : values.nextDueMileage,
    };
    updateMaintenanceMutation.mutate(payload);
  };

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
      default:
        return enUS;
    }
  };

  if (isLoading) {
    return <div className="space-y-6">{t('loading_maintenance')}</div>;
  }

  if (isError || !maintenance) {
    return <div className="space-y-6 text-red-500">{t('error_loading_maintenance')}</div>;
  }

  const formattedDate = format(new Date(maintenance.date), 'PPP', { locale: getLocale() });

  return (
    <div className="mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-3xl font-bold">{t('edit_maintenance_name_date', { name: maintenance.name, date: formattedDate })}</h1>
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

      <MaintenanceForm
        form={form}
        onSubmit={onSubmit}
        submitLabel={t('save_changes')}
        cancelLabel={t('cancel')}
        onCancel={() => navigate(-1)}
        vehicles={vehicles}
        isLoadingVehicles={isLoadingVehicles}
        isErrorVehicles={isErrorVehicles}
        onAddVehicle={() => navigate('/vehicles/create')}
        isSubmitting={updateMaintenanceMutation.isPending}
      />

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

export default MaintenanceEdit;
