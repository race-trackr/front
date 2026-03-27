import { useContext, useState, FC, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import TrackdayForm from '@/components/TrackdayForm'
import { createTrackday } from '@/lib/api/trackdays'
import { getVehicles } from '@/lib/api/vehicles'
import { UserVehicleType, CreateTrackdayPayload, TrackType, PaginatedResponse } from '@/types'
import { AuthContext } from '@/context/AuthContext'
import apiClient from '@/lib/apiClient'

const TrackdayCreate: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const auth = useContext(AuthContext)
  const isOwner = auth?.user?.role === 'owner'

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

  const createTrackdayMutation = useMutation({
    mutationFn: createTrackday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackdays'] })
      toast.success(t('trackday_created_successfully'))
      navigate('/trackdays')
    },
    onError: (error: any) => {
      toast.error(t('an_unexpected_error_occurred'))
    },
  })

  const onSubmit = (values: CreateTrackdayPayload) => {
    createTrackdayMutation.mutate(values)
  }

  const trackOptions = useMemo(() => {
    return (
      tracks?.map((track) => ({
        value: track.id.toString(),
        label: `${track.name} (${track.country?.name || t('unknown_country')})`,
      })) || []
    )
  }, [tracks, t])

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">{t('create_new_trackday')}</h1>
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
        isOwner={isOwner}
        submitLabel={t('create_trackday')}
        submitDisabled={createTrackdayMutation.isPending}
        cancelLabel={t('cancel')}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}

export default TrackdayCreate
