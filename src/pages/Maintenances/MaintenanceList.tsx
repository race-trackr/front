import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Wrench } from 'lucide-react';
import { Maintenance } from '@/types';
import { useTranslation } from 'react-i18next';
import { getMaintenances } from '@/lib/api/maintenances';
import { useQuery } from '@tanstack/react-query';

const MaintenanceList: React.FC = () => {
  const { t } = useTranslation();
  // Placeholder for fetching maintenances
  const { data: maintenances, isLoading, isError } = useQuery({
    queryKey: ['trackday'],
    queryFn: () => getMaintenances({ limit: 0 }),
  });

  if (isLoading) {
    return <div className="text-center">{t('loading_maintenances')}</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500">{t('error_loading_maintenances')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('your_maintenances')}</h1>
        <Button asChild className="btn-primary-gradient">
          <Link to="/maintenances/create">
            <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_maintenance')}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className=''>
                {t('total_maintenances')}
                <p className="text-2xl font-bold mt-2">{maintenances.length}</p></div>
              <span className='p-2 bg-primary/10 text-red-700 rounded-lg'>
                <Wrench className='h-6 w-6 text-primary' />
              </span>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg font-normal'>{t('total_cost')}</CardTitle>
            <p className="text-2xl font-bold">{maintenances.length}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg font-normal'>{t('upcoming_maintenances')}</CardTitle>
            <p className="text-2xl font-bold">{maintenances.length}</p>
          </CardHeader>
        </Card>
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
