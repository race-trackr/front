import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const VehicleCreate: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleSubmit = () => {
    // Simulate API call
    console.log('Creating vehicle...');
    navigate('/vehicles');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('create_new_vehicle')}</h1>
      <Card>
        <CardHeader><CardTitle>{t('vehicle_details')}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder for the Vehicle creation form.
            It would use `react-hook-form` and shadcn/ui components similar to TrackdayCreate.
          </p>
          <Button onClick={handleSubmit} className="mt-4 btn-primary-gradient">{t('save_vehicle')}</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleCreate;