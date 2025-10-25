import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { TrackType } from '@/types'; // Changed Track to TrackType
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

const AdminTracks: React.FC = () => {
  const { t } = useTranslation();
  const { data: tracks, isLoading, isError } = useQuery<TrackType[]>({
    queryKey: ['tracks'],
    queryFn: async () => {
      const response = await apiClient.get('/tracks');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="space-y-6">{t('loading_tracks')}</div>;
  }

  if (isError) {
    return <div className="space-y-6 text-red-500">{t('error_loading_tracks')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('manage_tracks')}</h1>
        <Button asChild className="btn-primary-gradient">
          <Link to="/admin/tracks/create">
            <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_track')}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks && tracks.length === 0 ? (
          <p className="text-muted-foreground">{t('no_tracks_added')}</p>
        ) : (
          tracks?.map((track) => (
            <Card key={track.id}>
              <CardHeader>
                <CardTitle>{track.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{track.city}, {track.countryId}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>{t('length')}:</strong> {track.length} km</p>
                {/* Removed 'turns' as it's not in the new TrackType */}
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to={`/admin/tracks/edit/${track.id}`}>{t('view_edit_details')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTracks;