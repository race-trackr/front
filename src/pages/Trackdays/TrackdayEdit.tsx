import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import TrackdayForm from '@/components/TrackdayForm'
import {
  TrackDayType,
  UpdateTrackdayPayload,
  CreateTrackdayPayload,
  UserVehicleType,
  TrackType,
  PaginatedResponse,
} from '@/types'
import apiClient from '@/lib/apiClient'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { fr, enUS, es, it } from 'date-fns/locale'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTrackdayById, updateTrackday, deleteTrackday } from '@/lib/api/trackdays'
import { getVehicles } from '@/lib/api/vehicles'
import { Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'

const TrackdayEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)

  const {
    data: trackday,
    isLoading,
    isError,
  } = useQuery<TrackDayType>({
    queryKey: ['trackday', id],
    queryFn: () => getTrackdayById(id!),
    enabled: !!id,
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

  const {
    data: tracks,
    isLoading: isLoadingTracks,
    isError: isErrorTracks,
  } = useQuery<TrackType[]>({
    queryKey: ['tracks'],
    queryFn: async () => {
      const response = await apiClient.get('/tracks')
      return response.data
    },
  })

  const updateTrackdayMutation = useMutation({
    mutationFn: (payload: UpdateTrackdayPayload) => updateTrackday(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackday', id] })
      queryClient.invalidateQueries({ queryKey: ['trackdays'] })
      toast.success(t('trackday_updated_successfully'))
      navigate(`/trackdays/${id}`)
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred'))
    },
  })

  const deleteTrackdayMutation = useMutation({
    mutationFn: () => deleteTrackday(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackdays'] })
      toast.success(t('trackday_deleted_successfully'))
      navigate('/trackdays')
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred'))
    },
  })

  const onSubmit = (values: CreateTrackdayPayload) => {
    updateTrackdayMutation.mutate(values as UpdateTrackdayPayload)
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteTrackdayMutation.mutate()
  }

  const trackOptions = React.useMemo(() => {
    return (
      tracks?.map((track) => ({
        value: track.id.toString(),
        label: `${track.name} (${track.country?.name || t('unknown_country')})`,
      })) || []
    )
  }, [tracks, t])

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

  const formattedDate = trackday
    ? format(new Date(trackday.date), 'PPP', { locale: getLocale() })
    : ''

  const defaultFormValues = trackday
    ? {
        userVehicleId: trackday.userVehicleId || null,
        trackId: trackday.trackId,
        date: trackday.date,
        weather: trackday.weather || null,
        airTemperature: trackday.airTemperature || null,
        trackTemperature: trackday.trackTemperature || null,
        trackCondition: trackday.trackCondition || null,
        notes: trackday.notes || null,
        bestLapTime: trackday.bestLapTime || null,
        totalLaps: trackday.totalLaps || null,
        totalDistance: trackday.totalDistance || null,
        chronos: trackday.chronos && trackday.chronos.length > 0 ? trackday.chronos : null,
      }
    : undefined

  if (isLoading) {
    return <div className="space-y-6">{t('loading_trackday')}</div>
  }

  if (isError || !trackday) {
    return <div className="space-y-6 text-red-500">{t('error_loading_trackday')}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-3xl font-bold">{t('edit_session_of_date', { date: formattedDate })}</h1>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDeleteClick}
          disabled={deleteTrackdayMutation.isPending}
          className="btn-danger"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">
            {deleteTrackdayMutation.isPending ? t('deleting') : t('delete_trackday_button')}
          </span>
        </Button>
      </div>

      <TrackdayForm
        onSubmit={onSubmit}
        vehicles={vehicles}
        tracks={tracks}
        trackOptions={trackOptions}
        isLoadingVehicles={isLoadingVehicles}
        isErrorVehicles={isErrorVehicles}
        isLoadingTracks={isLoadingTracks}
        isErrorTracks={isErrorTracks}
        isDatePickerOpen={isDatePickerOpen}
        setIsDatePickerOpen={setIsDatePickerOpen}
        isOwner={true}
        submitLabel={t('save_changes')}
        submitDisabled={updateTrackdayMutation.isPending}
        cancelLabel={t('cancel')}
        onCancel={() => navigate(-1)}
        defaultValues={defaultFormValues}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_trackday_title')}
        description={t('confirm_delete_trackday_description')}
        confirmButtonText={t('delete_trackday_button')}
        cancelButtonText={t('cancel')}
        isConfirming={deleteTrackdayMutation.isPending}
      />
    </div>
  )
}

export default TrackdayEdit
