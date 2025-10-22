import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VehicleCreate: React.FC = () => {
  const navigate = useNavigate();
  const handleSubmit = () => {
    // Simulate API call
    console.log('Creating vehicle...');
    navigate('/vehicles');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create New Vehicle</h1>
      <Card>
        <CardHeader><CardTitle>Vehicle Details</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder for the Vehicle creation form.
            It would use `react-hook-form` and shadcn/ui components similar to TrackdayCreate.
          </p>
          <Button onClick={handleSubmit} className="mt-4">Save Vehicle</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleCreate;