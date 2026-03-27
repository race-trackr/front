import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import VehicleForm, { vehicleFormSchema } from '@/components/VehicleForm'
import { createVehicle } from '@/lib/api/vehicles'
import { CreateVehiclePayload } from '@/types'
import { ArrowLeft } from 'lucide-react'

const VehicleCreate: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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

  const createVehicleMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success(t('vehicle_created_successfully'))
      navigate('/vehicles')
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred'))
    },
  })

  const onSubmit = (values: z.infer<typeof vehicleFormSchema>) => {
    const payload: CreateVehiclePayload = {
      ...values,
      name: values.name,
      type: values.type,
      brand: values.brand === '' ? null : values.brand,
      model: values.model === '' ? null : values.model,
      year: values.year === undefined ? null : values.year,
      licensePlate: values.licensePlate === '' ? null : values.licensePlate,
      details: values.details === '' ? null : values.details,
    }
    createVehicleMutation.mutate(payload)
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} title={t('back')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">{t('back')}</span>
        </Button>
        <h1 className="text-3xl font-bold flex-1">{t('create_new_vehicle')}</h1>
      </div>
      <VehicleForm
        form={form}
        onSubmit={onSubmit}
        isLoading={createVehicleMutation.isPending}
        submitLabel={t('create_vehicle')}
        cancelLabel={t('cancel')}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}

export default VehicleCreate
