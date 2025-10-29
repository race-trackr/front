import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flag, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { TrackType, CountryType } from '@/types';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();

  const { data: tracks, isLoading: isLoadingTracks, isError: isErrorTracks, error: tracksError } = useQuery<
    TrackType[], // TQueryFnData
    Error, // TError
    TrackType[], // TData
    ['tracks'] // TQueryKey
  >({
    queryKey: ['tracks'],
    queryFn: async () => {
      const response = await apiClient.get('/tracks');
      return response.data;
    },
  });

  useEffect(() => {
    if (isErrorTracks && tracksError) {
      toast.error(t('an_unexpected_error_occurred'));
    }
  }, [isErrorTracks, tracksError, t]);

  const { data: countries, isLoading: isLoadingCountries, isError: isErrorCountries, error: countriesError } = useQuery<
    CountryType[], // TQueryFnData
    Error, // TError
    CountryType[], // TData
    ['countries'] // TQueryKey
  >({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await apiClient.get('/countries');
      return response.data;
    },
  });

  useEffect(() => {
    if (isErrorCountries && countriesError) {
      toast.error(t('an_unexpected_error_occurred'));
    }
  }, [isErrorCountries, countriesError, t]);

  if (isLoadingTracks || isLoadingCountries) {
    return <div className="space-y-6">{t('loading')}...</div>;
  }

  if (isErrorTracks || isErrorCountries) {
    return <div className="space-y-6 text-red-500">{t('error_loading_admin_dashboard')}</div>;
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
            <div className="text-2xl font-bold">{tracks?.length || 0}</div> {/* Accessing tracks safely */}
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
            <div className="text-2xl font-bold">{countries?.length || 0}</div> {/* Accessing countries safely */}
            <p className="text-xs text-muted-foreground">{t('total_countries_in_system')}</p>
            <Button asChild className="mt-4 btn-primary-gradient">
              <Link to="/admin/countries">{t('go_to_countries')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;