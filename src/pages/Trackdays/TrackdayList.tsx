import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { Trackday } from '@/types';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const TrackdayList: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  // Placeholder for fetching trackdays
  const trackdays: Trackday[] = [
    {
      id: 'td1',
      userId: 'user1',
      vehicleId: 'v1',
      trackId: 't1',
      date: '2023-10-26',
      weather: 'Sunny',
      airTemperature: 25,
      trackTemperature: 35,
      trackCondition: 'Dry',
      note: 'Great day!',
      bestLaptime: '1:30.123',
      totalLaps: 20,
      otherDetails: null,
      createdAt: '2023-10-20T10:00:00Z',
      updatedAt: '2023-10-20T10:00:00Z',
      track: { id: 't1', name: 'Nürburgring Nordschleife', slug: 'nurburgring', city: 'Nürburg', countryId: 'c1', address: '...', width: 10, length: 20.8, turn: 73, maxDb: 100, details: '...', bestLaptime: '...', bestLaptimePilote: '...', createdAt: '...', updatedAt: '...' },
      vehicle: { id: 'v1', userId: 'user1', name: 'My Race Car', slug: 'my-race-car', brand: 'Porsche', model: '911 GT3', year: 2020, licensePlate: 'RACE001', type: 'voiture', details: '...', createdAt: '...', updatedAt: '...' }
    },
    {
      id: 'td2',
      userId: 'user1',
      vehicleId: 'v2',
      trackId: 't2',
      date: '2023-11-15',
      weather: 'Cloudy',
      airTemperature: 18,
      trackTemperature: 22,
      trackCondition: 'Damp',
      note: 'Challenging conditions.',
      bestLaptime: '2:05.456',
      totalLaps: 15,
      otherDetails: null,
      createdAt: '2023-11-10T10:00:00Z',
      updatedAt: '2023-11-10T10:00:00Z',
      track: { id: 't2', name: 'Spa-Francorchamps', slug: 'spa-francorchamps', city: 'Spa', countryId: 'c2', address: '...', width: 12, length: 7.004, turn: 19, maxDb: 100, details: '...', bestLaptime: '...', bestLaptimePilote: '...', createdAt: '...', updatedAt: '...' },
      vehicle: { id: 'v2', userId: 'user1', name: 'My Race Bike', slug: 'my-race-bike', brand: 'Yamaha', model: 'R1', year: 2022, licensePlate: 'BIKE001', type: 'moto', details: '...', createdAt: '...', updatedAt: '...' }
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('your_trackdays')}</h1>
        <Button asChild>
          <Link to="/trackdays/create">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('add_new_trackday')}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trackdays.length === 0 ? (
          <p className="text-muted-foreground">{t('no_trackdays_recorded')}</p>
        ) : (
          trackdays.map((trackday) => (
            <Card key={trackday.id}>
              <CardHeader>
                <CardTitle>{trackday.track?.name || 'Unknown Track'}</CardTitle>
                <p className="text-sm text-muted-foreground">{new Date(trackday.date).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>{t('vehicle')}:</strong> {trackday.vehicle?.name || 'N/A'}</p>
                <p><strong>{t('best_laptime')}:</strong> {trackday.bestLaptime}</p>
                <p><strong>{t('total_laps')}:</strong> {trackday.totalLaps}</p>
                <p><strong>{t('weather')}:</strong> {trackday.weather}</p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to={`/trackdays/edit/${trackday.id}`}>{t('view_edit_details')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TrackdayList;