import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { CreateMaintenancePayload, UserVehicleType, PaginatedResponse } from '@/types'
import { createMaintenance } from '@/lib/api/maintenances'
import { getVehicles } from '@/lib/api/vehicles'
import { ArrowLeft } from 'lucide-react'

import MaintenanceForm, {
  maintenanceFormSchema,
  MaintenanceFormValues,
} from '@/components/MaintenanceForm'

// schema is imported from MaintenanceForm component.

const MaintenanceCreate: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const preselectedVehicleId = searchParams.get('vehicleId')

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      userVehicleId: preselectedVehicleId ? Number(preselectedVehicleId) : 0,
      name: '',
      type: 'maintenance',
      date: format(new Date(), 'yyyy-MM-dd'),
      details: '',
      cost: null,
      mileage: null,
      nextDueMileage: null,
    },
  })

  const {
    data: vehiclesResponse,
    isLoading: isLoadingVehicles,
    isError: isErrorVehicles,
  } = useQuery<PaginatedResponse<UserVehicleType>>({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ limit: 0 }),
  })
  const vehicles = vehiclesResponse?.data || []

  const createMaintenanceMutation = useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] })
      queryClient.invalidateQueries({ queryKey: ['vehicleMaintenances'] })
      toast.success(t('maintenance_created_successfully'))
      navigate('/maintenances')
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')) // Generic error message
    },
  })

  const onSubmit = (values: MaintenanceFormValues) => {
    const payload: CreateMaintenancePayload = {
      ...values,
      userVehicleId: values.userVehicleId,
      name: values.name,
      type: values.type,
      date: values.date,
      details: values.details === '' ? '' : values.details,
      cost: values.cost === undefined ? null : values.cost,
      mileage: values.mileage === undefined ? null : values.mileage,
      nextDueMileage: values.nextDueMileage === undefined ? null : values.nextDueMileage,
    }
    createMaintenanceMutation.mutate(payload)
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">{t('back')}</span>
        </Button>
        <h1 className="text-3xl font-bold flex-1">{t('create_new_maintenance')}</h1>
      </div>
      <MaintenanceForm
        form={form}
        onSubmit={onSubmit}
        submitLabel={t('save_maintenance')}
        cancelLabel={t('cancel')}
        onCancel={() => navigate(-1)}
        vehicles={vehicles}
        isLoadingVehicles={isLoadingVehicles}
        isErrorVehicles={isErrorVehicles}
        onAddVehicle={() => navigate('/vehicles/create')}
        isSubmitting={createMaintenanceMutation.isPending}
      />
    </div>
  )
}

export default MaintenanceCreate
