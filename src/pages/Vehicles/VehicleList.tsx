import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { UserVehicle } from '@/types';
import { useTranslation } from 'react-i18next';

const VehicleList: React.FC = () => {
  const { t } = useTranslation();
  // Placeholder for fetching vehicles
  const vehicles: UserVehicle[] = [
    {
      id: 'v1', userId: 'user1', name: 'My Race Car', slug: 'my-race-car', brand: 'Porsche', model: '911 GT3', year: 2020, licensePlate: 'RACE001', type: 'voiture', details: 'Track-ready beast.', createdAt: '...', updatedAt: '...'
    },
    {
      id: 'v2', userId: 'user1', name: 'My Race Bike', slug: 'my-race-bike', brand: 'Yamaha', model: 'R1', year: 2022, licensePlate: 'BIKE001', type: 'moto', details: 'Superbike for the track.', createdAt: '...', updatedAt: '...'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('your_vehicles')}</h1>
        <Button asChild className="btn-primary-gradient">
          <Link to="/vehicles/create">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('add_new_vehicle')}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length === 0 ? (
          <p className="text-muted-foreground">{t('no_vehicles_added')}</p>
        ) : (
          vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardHeader>
                <CardTitle>{vehicle.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>{t('type')}:</strong> {vehicle.type}</p>
                <p><strong>{t('license_plate')}:</strong> {vehicle.licensePlate}</p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to={`/vehicles/edit/${vehicle.id}`}>{t('view_edit_details')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default VehicleList;