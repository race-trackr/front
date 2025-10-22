import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, Wrench, Flag, Gauge, CalendarDays } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user?.username || 'User'}!</h1>
      <p className="text-lg text-muted-foreground">Your role: <span className="font-semibold capitalize">{user?.role}</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Trackdays</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div> {/* Placeholder data */}
            <p className="text-xs text-muted-foreground">You have participated in 5 trackdays.</p>
            <Button asChild className="mt-4">
              <Link to="/trackdays">View Trackdays</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div> {/* Placeholder data */}
            <p className="text-xs text-muted-foreground">You own 2 vehicles.</p>
            <Button asChild className="mt-4">
              <Link to="/vehicles">Manage Vehicles</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Maintenances</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div> {/* Placeholder data */}
            <p className="text-xs text-muted-foreground">1 maintenance due soon.</p>
            <Button asChild className="mt-4">
              <Link to="/maintenances">View Maintenances</Link>
            </Button>
          </CardContent>
        </Card>

        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Panel</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Access Admin Tools</div>
              <p className="text-xs text-muted-foreground">Manage tracks, countries, and users.</p>
              <Button asChild className="mt-4">
                <Link to="/admin">Go to Admin</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;