import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { Country } from '@/types';

const AdminCountries: React.FC = () => {
  // Placeholder for fetching countries
  const countries: Country[] = [
    {
      id: 'c1', name: 'Germany', slug: 'germany', iso: 'DE', timezone: 'CET', capital: 'Berlin', createdAt: '...', updatedAt: '...'
    },
    {
      id: 'c2', name: 'Belgium', slug: 'belgium', iso: 'BE', timezone: 'CET', capital: 'Brussels', createdAt: '...', updatedAt: '...'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Countries</h1>
        <Button asChild>
          <Link to="/admin/countries/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Country
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.length === 0 ? (
          <p className="text-muted-foreground">No countries added yet.</p>
        ) : (
          countries.map((country) => (
            <Card key={country.id}>
              <CardHeader>
                <CardTitle>{country.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{country.capital} ({country.iso})</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Timezone:</strong> {country.timezone}</p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to={`/admin/countries/edit/${country.id}`}>View/Edit Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCountries;