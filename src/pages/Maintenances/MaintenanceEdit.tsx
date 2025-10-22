import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const MaintenanceEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize useTranslation
  const handleSubmit = () => {
    // Simulate API call
    console.log(`Updating maintenance ${id}...`);
    navigate('/maintenances');
  };
  const handleDelete = () => {
    // Simulate API call
    console.log(`Deleting maintenance ${id}...`);
    navigate('/maintenances');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('edit_maintenance', { id })}</h1>
      <Card>
        <CardHeader><CardTitle>{t('maintenance_details')}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder for the Maintenance edit form.
            It would use `react-hook-form` and shadcn/ui components similar to TrackdayEdit.
          </p>
          <div className="flex justify-between mt-4">
            <Button onClick={handleSubmit}>{t('save_changes')}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t('delete_maintenance')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceEdit;