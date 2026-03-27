import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import VehicleForm, { vehicleFormSchema } from '@/components/VehicleForm'
import { getVehicleById, updateVehicle, deleteVehicle } from '@/lib/api/vehicles'
import { UserVehicleType, UpdateVehiclePayload } from '@/types/index'
import { ArrowLeft, Trash2 } from 'lucide-react'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'

const VehicleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const vehicleId = Number(id)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const form = useForm<z.infer<typeof vehicleFormSchema>>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      name: '',
      type: 'car',
      brand: null,
      model: null,
      year: null,
      licensePlate: null,
      details: null,
    },
  })

  const {
    data: vehicle,
    isLoading,
    isError,
  } = useQuery<UserVehicleType>({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => getVehicleById(vehicleId),
    enabled: !!vehicleId && !isNaN(vehicleId),
  })

  useEffect(() => {
    if (vehicle) {
      form.reset({
        name: vehicle.name,
        type: vehicle.type,
        brand: vehicle.brand || null,
        model: vehicle.model || null,
        year: vehicle.year || null,
        licensePlate: vehicle.licensePlate || null,
        details: vehicle.details || null,
      })
    }
  }, [vehicle, form])

  const updateVehicleMutation = useMutation({
    mutationFn: (payload: UpdateVehiclePayload) => updateVehicle(vehicleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success(t('vehicle_updated_successfully'))
      navigate(`/vehicles/${vehicleId}`)
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')) // Generic error message
    },
  })

  const deleteVehicleMutation = useMutation({
    mutationFn: () => deleteVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success(t('vehicle_deleted_successfully'))
      navigate('/vehicles')
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')) // Generic error message
    },
  })

  const onSubmit = (values: z.infer<typeof vehicleFormSchema>) => {
    const payload: UpdateVehiclePayload = {
      ...values,
      name: values.name,
      type: values.type,
      brand: values.brand === '' ? null : values.brand,
      model: values.model === '' ? null : values.model,
      year: values.year === undefined ? null : values.year,
      licensePlate: values.licensePlate === '' ? null : values.licensePlate,
      details: values.details === '' ? null : values.details,
    }
    updateVehicleMutation.mutate(payload)
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteVehicleMutation.mutate()
  }

  if (isLoading) {
    return <div className="mx-auto p-4 text-center">{t('loading_vehicle')}</div>
  }

  if (isError || !vehicle) {
    return <div className="mx-auto p-4 text-center text-red-500">{t('error_loading_vehicle')}</div>
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)} title={t('back')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-3xl font-bold">{vehicle.name}</h1>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDeleteClick}
          disabled={deleteVehicleMutation.isPending}
          className="btn-danger"
          title={deleteVehicleMutation.isPending ? t('deleting') : t('delete_vehicle_button')}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">
            {deleteVehicleMutation.isPending ? t('deleting') : t('delete_vehicle_button')}
          </span>
        </Button>
      </div>

      <VehicleForm
        form={form}
        onSubmit={onSubmit}
        isLoading={updateVehicleMutation.isPending}
        submitLabel={t('save_changes')}
        cancelLabel={t('cancel')}
        onCancel={() => navigate(-1)}
      />

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
  )
}

export default VehicleEdit
