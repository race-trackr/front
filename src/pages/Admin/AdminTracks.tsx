import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { Track } from '@/types';
import { useTranslation } from 'react-i18next';

const AdminTracks: React.FC = () => {
  const { t } = useTranslation();
  // Placeholder for fetching tracks
  const tracks: Track[] = [
    {
      id: 't1', name: 'Nürburgring Nordschleife', slug: 'nurburgring', city: 'Nürburg', countryId: 'c1', address: '...', width: 10, length: 20.8, turn: 73, maxDb: 100, details: '...', bestLaptime: '...', bestLaptimePilote: '...', createdAt: '...', updatedAt: '...'
    },
    {
      id: 't2', name: 'Spa-Francorchamps', slug: 'spa-francorchamps', city: 'Spa', countryId: 'c2', address: '...', width: 12, length: 7.004, turn: 19, maxDb: 100, details: '...', bestLaptime: '...', bestLaptimePilote: '...', createdAt: '...', updatedAt: '...'
    },
  ];

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
        {tracks.length === 0 ? (
          <p className="text-muted-foreground">{t('no_tracks_added')}</p>
        ) : (
          tracks.map((track) => (
            <Card key={track.id}>
              <CardHeader>
                <CardTitle>{track.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{track.city}, {track.countryId}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>{t('length')}:</strong> {track.length} km</p>
                <p><strong>{t('turns')}:</strong> {track.turn}</p>
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