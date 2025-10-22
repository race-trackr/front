import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminTracksEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const handleSubmit = () => {
    // Simulate API call
    console.log(`Updating track ${id}...`);
    navigate('/admin/tracks');
  };
  const handleDelete = () => {
    // Simulate API call
    console.log(`Deleting track ${id}...`);
    navigate('/admin/tracks');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Track #{id}</h1>
      <Card>
        <CardHeader><CardTitle>Track Details</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder for the Track edit form.
            It would use `react-hook-form` and shadcn/ui components.
          </p>
          <div className="flex justify-between mt-4">
            <Button onClick={handleSubmit}>Save Changes</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Track</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTracksEdit;