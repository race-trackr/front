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
import { UserVehicleType } from '@/types'; // Changed UserVehicle to UserVehicleType

const VehicleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number(id); // Convert id to number
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data: vehicle, isLoading, isError } = useQuery<UserVehicleType>({ // Changed UserVehicle to UserVehicleType
    queryKey: ['vehicle', vehicleId],
    queryFn: () => getVehicleById(vehicleId),
    enabled: !!vehicleId && !isNaN(vehicleId),
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
        <h1 className="text-3xl font-bold">{t('view_vehicle', { name: `${vehicle.brand} ${vehicle.model}` })}</h1> {/* Adjusted name display */}
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
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_brand')}</p>
            <p className="text-lg">{vehicle.brand}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_model')}</p>
            <p className="text-lg">{vehicle.model}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_year')}</p>
            <p className="text-lg">{vehicle.year}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_type')}</p>
            <p className="text-lg">{t(`type_${vehicle.type.toLowerCase()}`)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_slug')}</p>
            <p className="text-lg">{vehicle.slug}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('vehicle_license_plate')}</p>
            <p className="text-lg">{vehicle.licensePlate || t('not_specified')}</p>
          </div>
          {vehicle.image && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('vehicle_image')}</p>
              <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} className="mt-2 max-h-32 object-cover rounded-md" />
            </div>
          )}
          {vehicle.details && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">{t('details')}</p>
              <p className="text-lg">{vehicle.details}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleView;