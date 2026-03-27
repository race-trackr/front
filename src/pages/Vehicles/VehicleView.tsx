import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { fr, enUS, es, it } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getVehicleByUUID, deleteVehicle } from '@/lib/api/vehicles'
import { getMaintenances } from '@/lib/api/maintenances'
import { ArrowLeft, Edit, Wrench, PlusCircle, Trash2 } from 'lucide-react'
import { UserVehicleType, MaintenanceRecordType, PaginatedResponse } from '@/types'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import { toast } from 'sonner'

const VehicleView: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const {
    data: vehicle,
    isLoading: isLoadingVehicle,
    isError: isErrorVehicle,
  } = useQuery<UserVehicleType, Error, UserVehicleType, ['vehicle', string]>({
    queryKey: ['vehicle', uuid!],
    queryFn: () => getVehicleByUUID(uuid!),
    enabled: !!uuid,
  })

  const {
    data: maintenancesResponse,
    isLoading: isLoadingMaintenances,
    isError: isErrorMaintenances,
    error: maintenancesError,
  } = useQuery<
    PaginatedResponse<MaintenanceRecordType>,
    Error,
    PaginatedResponse<MaintenanceRecordType>,
    ['vehicleMaintenances', string | undefined]
  >({
    queryKey: ['vehicleMaintenances', vehicle?.uuid],
    queryFn: () => getMaintenances({ vehicle_uuid: vehicle?.uuid, limit: 0 }),
    enabled: !!vehicle?.id,
  })
  const maintenances = maintenancesResponse?.data || []

  useEffect(() => {
    if (isErrorMaintenances && maintenancesError && isErrorVehicle) {
      toast.error(t('an_unexpected_error_occurred'))
    }
  }, [isErrorMaintenances, maintenancesError, t])

  const deleteVehicleMutation = useMutation({
    mutationFn: () => deleteVehicle(uuid!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success(t('vehicle_deleted_successfully'))
      navigate('/vehicles')
    },
    onError: (error: Error) => {
      // Corrected onError type
      toast.error(t('an_unexpected_error_occurred'))
    },
  })

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteVehicleMutation.mutate()
  }

  const getLocale = () => {
    switch (i18n.language) {
      case 'fr':
        return fr
      case 'es':
        return es
      case 'it':
        return it
      default:
        return enUS
    }
  }

  if (isLoadingVehicle) {
    return <div className="p-4 text-center">{t('loading_vehicle')}</div>
  }

  if (isErrorVehicle || !vehicle) {
    return <div className="p-4 text-center text-red-500">{t('error_loading_vehicle')}</div>
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-3xl font-bold">{vehicle.name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="icon">
            <Link to={`/vehicles/edit/${vehicle.uuid}`}>
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
            <span className="sr-only">
              {deleteVehicleMutation.isPending ? t('deleting') : t('delete_vehicle_button')}
            </span>
          </Button>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('vehicle_details')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_name')}</p>
            <p className="text-lg">{vehicle.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_type')}</p>
            <p className="text-lg">{t(`type_${vehicle.type.toLowerCase()}`)}</p>
          </div>
          {vehicle.brand && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('vehicle_brand')}</p>
              <p className="text-lg">{vehicle.brand}</p>
            </div>
          )}
          {vehicle.model && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('vehicle_model')}</p>
              <p className="text-lg">{vehicle.model}</p>
            </div>
          )}
          {vehicle.year && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('vehicle_year')}</p>
              <p className="text-lg">{vehicle.year}</p>
            </div>
          )}
          {vehicle.licensePlate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('vehicle_license_plate')}
              </p>
              <p className="text-lg">{vehicle.licensePlate}</p>
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
            <div className="text-center text-red-500">
              {t('error_loading_vehicle_maintenances')}
            </div>
          ) : maintenances && maintenances.length > 0 ? ( // Accessing maintenances safely
            <ul className="space-y-4">
              {maintenances.map(
                (
                  maintenance // Accessing maintenances safely
                ) => (
                  <li
                    key={maintenance.uuid}
                    className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{maintenance.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`maintenance_type_${maintenance.type}`)} -{' '}
                        {format(new Date(maintenance.date), 'PPP', { locale: getLocale() })}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/maintenances/edit/${maintenance.uuid}`}>
                        {t('view_edit_details')}
                      </Link>
                    </Button>
                  </li>
                )
              )}
              <div className="pt-4">
                <Button asChild className="btn-primary-gradient w-full">
                  <Link to={`/maintenances/create?vehicleId=${vehicle.uuid}`}>
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
                <Link to={`/maintenances/create?vehicleId=${vehicle.uuid}`}>
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
  )
}

export default VehicleView
