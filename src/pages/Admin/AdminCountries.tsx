import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { CountryType } from '@/types'; // Changed Country to CountryType
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

const AdminCountries: React.FC = () => {
  const { t } = useTranslation();
  const { data: countries, isLoading, isError } = useQuery<CountryType[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await apiClient.get('/countries');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="space-y-6">{t('loading_countries')}</div>;
  }

  if (isError) {
    return <div className="space-y-6 text-red-500">{t('error_loading_countries')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('manage_countries')}</h1>
        <Button asChild className="btn-primary-gradient">
          <Link to="/admin/countries/create">
            <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_country')}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries && countries.length === 0 ? (
          <p className="text-muted-foreground">{t('no_countries_added')}</p>
        ) : (
          countries?.map((country) => (
            <Card key={country.id}>
              <CardHeader>
                <CardTitle>{country.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{country.capital} ({country.iso})</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>{t('timezone')}:</strong> {country.timezone}</p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to={`/admin/countries/edit/${country.id}`}>{t('view_edit_details')}</Link>
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