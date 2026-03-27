import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Car, Bike, Edit, Trash2, Eye } from 'lucide-react'
import { UserVehicleType, PaginatedResponse } from '@/types/index'
import { useTranslation } from 'react-i18next'
import { deleteVehicle, getVehicles } from '@/lib/api/vehicles'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'

const getVehicleIcon = (type: UserVehicleType['type']) => {
  switch (type) {
    case 'car':
      return <Car className="h-5 w-5 text-muted-foreground" />
    case 'motorcycle':
      return <Bike className="h-5 w-5 text-muted-foreground" />
    case 'karting':
      return <Car className="h-5 w-5 text-muted-foreground" />
    default:
      return <Car className="h-5 w-5 text-muted-foreground" />
  }
}

const VehicleList: React.FC = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [vehicleToDelete, setVehicleToDelete] = React.useState<number | null>(null)

  const {
    data: vehiclesResponse,
    isLoading,
    isError: isErrorVehicles,
    error: vehiclesError,
  } = useQuery<
    PaginatedResponse<UserVehicleType>,
    Error,
    PaginatedResponse<UserVehicleType>,
    ['vehicles']
  >({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ limit: 0 }),
  })
  const vehicles = vehiclesResponse?.data || []

  useEffect(() => {
    if (isErrorVehicles && vehiclesError) {
      toast.error(t('an_unexpected_error_occurred'))
    }
  }, [isErrorVehicles, vehiclesError, t])

  const deleteVehicleMutation = useMutation({
    mutationFn: (id: number) => deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success(t('vehicle_deleted_successfully'))
      setIsDeleteDialogOpen(false)
      setVehicleToDelete(null)
    },
    onError: (error: Error) => {
      // Corrected onError type
      toast.error(t('an_unexpected_error_occurred'))
      setIsDeleteDialogOpen(false)
      setVehicleToDelete(null)
    },
  })

  const handleDeleteClick = (id: number) => {
    setVehicleToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (vehicleToDelete !== null) {
      deleteVehicleMutation.mutate(vehicleToDelete)
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center">{t('loading_vehicles')}</div>
  }

  if (isErrorVehicles) {
    // Use specific error flag
    return <div className="p-4 text-center text-red-500">{t('error_loading_vehicles')}</div>
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
        {vehicles && vehicles.length === 0 ? ( // Accessing vehicles safely
          <Card className="w-full mx-auto text-center p-6 col-span-full">
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <Car className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">{t('no_vehicles_added')}</p>
              <Button asChild className="btn-primary-gradient">
                <Link to="/vehicles/create">
                  <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_vehicle')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          vehicles?.map(
            (
              vehicle // Accessing vehicles safely
            ) => (
              <Card key={vehicle.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{vehicle.name}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    {getVehicleIcon(vehicle.type)}
                    <span className="ml-2">
                      {vehicle.brand && vehicle.model && `(${vehicle.brand} ${vehicle.model})`}
                      {vehicle.year && ` (${vehicle.year})`}
                      {` - ${t(`type_${vehicle.type.toLowerCase()}`)}`}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <p>
                    <strong>{t('license_plate')}:</strong>{' '}
                    {vehicle.licensePlate || t('not_specified')}
                  </p>
                </CardContent>
                <div className="p-4 border-t flex justify-between items-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteClick(vehicle.id)}
                    disabled={deleteVehicleMutation.isPending}
                    className="btn-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">
                      {deleteVehicleMutation.isPending ? t('deleting') : t('delete_vehicle_button')}
                    </span>
                  </Button>
                  <div className="flex gap-2">
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
                  </div>
                </div>
              </Card>
            )
          )
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
  )
}

export default VehicleList
