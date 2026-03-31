import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { fr, enUS, es, it } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getMaintenanceById, deleteMaintenance } from '@/lib/api/maintenances'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Wrench,
  CalendarDays,
  GaugeCircle,
  DollarSign,
  Car,
  BookText,
} from 'lucide-react'
import { MaintenanceRecordType } from '@/types'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

const MaintenanceView: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const {
    data: maintenance,
    isLoading,
    isError,
  } = useQuery<MaintenanceRecordType>({
    queryKey: ['maintenance', uuid],
    queryFn: () => getMaintenanceById(uuid!),
    enabled: !!uuid,
  })

  const deleteMaintenanceMutation = useMutation({
    mutationFn: () => deleteMaintenance(uuid!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] })
      queryClient.invalidateQueries({ queryKey: ['vehicleMaintenances'] })
      toast.success(t('maintenance_deleted_successfully'))
      navigate('/maintenances')
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred')) // Generic error message
    },
  })

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteMaintenanceMutation.mutate()
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

  if (isLoading) {
    return <div className="mx-auto p-4 text-center">{t('loading_maintenance')}</div>
  }

  if (isError || !maintenance) {
    return (
      <div className="mx-auto p-4 text-center text-red-500">{t('error_loading_maintenance')}</div>
    )
  }

  const formattedDate = format(new Date(maintenance.date), 'PPP', { locale: getLocale() })

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <div className="flex flex-col items-center flex-grow mx-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">{maintenance.name}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t(`maintenance_type_${maintenance.type}`)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="icon">
            <Link to={`/maintenances/edit/${maintenance.uuid}`}>
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
            <span className="sr-only">
              {deleteMaintenanceMutation.isPending ? t('deleting') : t('delete_maintenance_button')}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 xl:col-span-1">
          <CardHeader>
            <CardTitle>{t('maintenance_details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('date')}</p>
              <p className="text-lg">{formattedDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('cost')}</p>
              <p className="text-lg">
                {maintenance.cost !== null
                  ? `${Number(maintenance.cost).toFixed(2)}€`
                  : t('not_specified')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('mileage')}</p>
              <p className="text-lg">
                {maintenance.mileage !== null ? `${maintenance.mileage} km` : t('not_specified')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 xl:col-span-1">
          <CardHeader>
            <CardTitle>{t('vehicle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('vehicle_brand')}</p>
              <p className="text-lg">
                {maintenance.vehicle
                  ? `${maintenance.vehicle.brand} ${maintenance.vehicle.model}`
                  : t('not_specified_vehicle')}
              </p>
            </div>
            {maintenance.vehicle?.licensePlate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('license_plate')}</p>
                <p className="text-lg">{maintenance.vehicle.licensePlate}</p>
              </div>
            )}
            {maintenance.vehicle?.year && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('vehicle_year')}</p>
                <p className="text-lg">{maintenance.vehicle.year}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 xl:col-span-1">
          <CardHeader>
            <CardTitle>{t('next_due')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('next_due_mileage')}</p>
              <p className="text-lg">
                {maintenance.nextDueMileage
                  ? `${maintenance.nextDueMileage} km`
                  : t('not_specified')}
              </p>
            </div>
          </CardContent>
        </Card>

        {maintenance.details && (
          <Card className="lg:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle>{t('details')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{maintenance.details}</p>
            </CardContent>
          </Card>
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
  )
}

export default MaintenanceView
