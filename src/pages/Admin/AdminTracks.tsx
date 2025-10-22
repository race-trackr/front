import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { Track } from '@/types';

const AdminTracks: React.FC = () => {
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
        <h1 className="text-3xl font-bold">Manage Tracks</h1>
        <Button asChild>
          <Link to="/admin/tracks/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Track
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.length === 0 ? (
          <p className="text-muted-foreground">No tracks added yet.</p>
        ) : (
          tracks.map((track) => (
            <Card key={track.id}>
              <CardHeader>
                <CardTitle>{track.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{track.city}, {track.countryId}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Length:</strong> {track.length} km</p>
                <p><strong>Turns:</strong> {track.turn}</p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to={`/admin/tracks/edit/${track.id}`}>View/Edit Details</Link>
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