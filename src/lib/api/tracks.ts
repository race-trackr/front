import apiClient from '@/lib/apiClient'
import { TrackType } from '@/types'

export const getTracks = async (): Promise<TrackType[]> => {
  const response = await apiClient.get('/tracks')
  return response.data
}
