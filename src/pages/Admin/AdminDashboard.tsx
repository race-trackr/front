import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Flag, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const {
    data: tracksCount,
    isLoading: isLoadingTracks,
    isError: isErrorTracks,
    error: tracksError,
  } = useQuery<{ total: number }, Error, { total: number }, ['tracks-count']>({
    queryKey: ['tracks-count'],
    queryFn: async () => {
      const response = await apiClient.get('/tracks', {
        params: { countOnly: true },
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (isErrorTracks && tracksError) {
      toast.error(t('an_unexpected_error_occurred'))
    }
  }, [isErrorTracks, tracksError, t])

  const {
    data: countriesCount,
    isLoading: isLoadingCountries,
    isError: isErrorCountries,
    error: countriesError,
  } = useQuery<{ total: number }, Error, { total: number }, ['countries-count']>({
    queryKey: ['countries-count'],
    queryFn: async () => {
      const response = await apiClient.get('/countries', {
        params: { countOnly: true },
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: usersCount,
    isLoading: isUsersLoading,
    isError: isErrorUsers,
    error: usersError,
  } = useQuery<{ total: number }, Error, { total: number }, ['admin-users-count']>({
    queryKey: ['admin-users-count'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/users', {
        params: { countOnly: true },
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (isErrorCountries && countriesError && isErrorUsers && usersError) {
      toast.error(t('an_unexpected_error_occurred'))
    }
  }, [isErrorCountries, countriesError, usersError, t])

  if (isLoadingTracks || isLoadingCountries || isUsersLoading) {
    return <div className="space-y-6">{t('loading')}...</div>
  }

  if (isErrorTracks || isErrorCountries || isErrorUsers) {
    return <div className="space-y-6 text-red-500">{t('error_loading_admin_dashboard')}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('admin_dashboard')}</h1>
      <p className="text-lg text-muted-foreground">{t('manage_application_data')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('manage_tracks')}</CardTitle>
            <Flag className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracksCount?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">{t('total_tracks_in_system')}</p>
            <Button asChild className="mt-4 btn-primary-gradient">
              <Link to="/admin/tracks">{t('go_to_tracks')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('manage_countries')}</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countriesCount?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">{t('total_countries_in_system')}</p>
            <Button asChild className="mt-4 btn-primary-gradient">
              <Link to="/admin/countries">{t('go_to_countries')}</Link>
            </Button>
          </CardContent>
        </Card>

        {user?.role === 'owner' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('manage_users')}</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usersCount?.total ?? 0}</div>
                <p className="text-xs text-muted-foreground">{t('total_users_in_system')}</p>
                <Button asChild className="mt-4 btn-primary-gradient">
                  <Link to="/admin/users">{t('manage_users')}</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
