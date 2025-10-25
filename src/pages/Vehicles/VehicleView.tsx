"use client";

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getVehicleById } from '@/lib/api/vehicles';
import { ArrowLeft, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es, it } from 'date-fns/locale';

const VehicleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicleById(id!),
    enabled: !!id,
  });

  const getLocale = () => {
    switch (i18n.language) {
      case 'fr':
        return fr;
      case 'es':
        return es;
      case 'it':
        return it;
      default:
        return enUS;
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">{t('loading_vehicle')}</div>;
  }

  if (isError || !vehicle) {
    return <div className="container mx-auto p-4 text-center text-red-500">{t('error_loading_vehicle')}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('view_vehicle', { name: vehicle.name })}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('back_to_vehicles')}
          </Button>
          <Button asChild className="btn-primary-gradient">
            <Link to={`/vehicles/edit/${vehicle.id}`}>
              <Edit className="mr-2 h-4 w-4" /> {t('edit_vehicle_button')}
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('vehicle_details')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_name')}</p>
            <p className="text-lg">{vehicle.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_type')}</p>
            <p className="text-lg">{vehicle.type ? t(`type_${vehicle.type.toLowerCase()}`) : t('not_specified')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_brand')}</p>
            <p className="text-lg">{vehicle.brand || t('not_specified')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_model')}</p>
            <p className="text-lg">{vehicle.model || t('not_specified')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_year')}</p>
            <p className="text-lg">{vehicle.year || t('not_specified')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_license_plate')}</p>
            <p className="text-lg">{vehicle.licensePlate || t('not_specified')}</p>
          </div>
          {vehicle.vin && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('vin')}</p>
              <p className="text-lg">{vehicle.vin}</p>
            </div>
          )}
          {vehicle.color && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('color')}</p>
              <p className="text-lg">{vehicle.color}</p>
            </div>
          )}
          {vehicle.engineType && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('engine_type')}</p>
              <p className="text-lg">{vehicle.engineType}</p>
            </div>
          )}
          {vehicle.transmissionType && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('transmission_type')}</p>
              <p className="text-lg">{vehicle.transmissionType}</p>
            </div>
          )}
          {vehicle.mileage !== undefined && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('mileage')}</p>
              <p className="text-lg">{vehicle.mileage} km</p>
            </div>
          )}
          {vehicle.lastServiceMileage !== undefined && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('last_service_mileage')}</p>
              <p className="text-lg">{vehicle.lastServiceMileage} km</p>
            </div>
          )}
          {vehicle.purchaseDate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('purchase_date')}</p>
              <p className="text-lg">{format(new Date(vehicle.purchaseDate), 'PPP', { locale: getLocale() })}</p>
            </div>
          )}
          {vehicle.purchasePrice !== undefined && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('purchase_price')}</p>
              <p className="text-lg">{vehicle.purchasePrice} €</p>
            </div>
          )}
          {vehicle.details && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">{t('details')}</p>
              <p className="text-lg">{vehicle.details}</p>
            </div>
          )}
          {vehicle.otherDetails && Object.keys(vehicle.otherDetails).length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">{t('other_details')}</p>
              <pre className="text-sm bg-muted p-2 rounded-md overflow-auto">{JSON.stringify(vehicle.otherDetails, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleView;