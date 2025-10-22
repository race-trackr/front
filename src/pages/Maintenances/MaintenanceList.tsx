import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { Maintenance } from '@/types';

const MaintenanceList: React.FC = () => {
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
        <h1 className="text-3xl font-bold">Your Maintenances</h1>
        <Button asChild>
          <Link to="/maintenances/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Maintenance
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maintenances.length === 0 ? (
          <p className="text-muted-foreground">No maintenances recorded yet. Start by adding one!</p>
        ) : (
          maintenances.map((maintenance) => (
            <Card key={maintenance.id}>
              <CardHeader>
                <CardTitle>{maintenance.name}</CardTitle>
                <p className="text-sm text-muted-foreground">For Vehicle ID: {maintenance.vehicleId}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Type:</strong> {maintenance.type}</p>
                <p><strong>Date:</strong> {new Date(maintenance.date).toLocaleDateString()}</p>
                <p><strong>Cost:</strong> ${maintenance.cost.toFixed(2)}</p>
                <p><strong>Mileage:</strong> {maintenance.mileage} km</p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to={`/maintenances/edit/${maintenance.id}`}>View/Edit Details</Link>
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