import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { Maintenance } from '@/types';
import { useTranslation } from 'react-i18next';

const MaintenanceList: React.FC = () => {
  const { t } = useTranslation();
  // Placeholder for fetching maintenances
  const maintenances: Maintenance[] = [
    {
      id: 'm1', userId: 'user1', vehicleId: 'v1', name: 'Oil Change', type: 'maintenance', date: '2023-09-01', cost: 120.00, mileage: 10000, nextMaintenanceDate: '2024-09-01', nextMaintenanceMileage: 20000, details: 'Standard oil and filter change.', createdAt: '...', updatedAt: '...'
    },
    {
      id: 'm2', userId: 'user1', vehicleId: 'v1', name: 'Brake Pad Replacement', type: 'réparation', date: '2023-08-15', cost: 350.00, mileage: 9500, nextMaintenanceDate: null, nextMaintenanceMileage: null, details: 'Front brake pads replaced.', createdAt: '...', updatedAt: '...'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('your_maintenances')}</h1>
        <Button asChild className="btn-primary-gradient">
          <Link to="/maintenances/create">
            <PlusCircle className="mr-2 h-5 w-5" /> {t('add_new_maintenance')}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maintenances.length === 0 ? (
          <p className="text-muted-foreground">{t('no_maintenances_recorded')}</p>
        ) : (
          maintenances.map((maintenance) => (
            <Card key={maintenance.id}>
              <CardHeader>
                <CardTitle>{maintenance.name}</CardTitle>
                <p className="text-sm text-muted-foreground">For Vehicle ID: {maintenance.vehicleId}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>{t('type')}:</strong> {maintenance.type}</p>
                <p><strong>{t('date')}:</strong> {new Date(maintenance.date).toLocaleDateString()}</p>
                <p><strong>{t('cost')}:</strong> ${maintenance.cost.toFixed(2)}</p>
                <p><strong>{t('mileage')}:</strong> {maintenance.mileage} km</p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to={`/maintenances/edit/${maintenance.id}`}>{t('view_edit_details')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MaintenanceList;