"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar } from 'lucide-react';
import { getTrackdays } from '@/lib/api/trackdays';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";

const TrackdayList: React.FC = () => {
  const { t } = useTranslation();
  const { data: trackdays, isLoading, isError } = useQuery({
    queryKey: ['trackdays'],
    queryFn: getTrackdays,
  });

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">{t('loading_trackdays')}</div>;
  }

  if (isError) {
    return <div className="container mx-auto p-4 text-center text-red-500">{t('error_loading_trackdays')}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-end mb-6">
        <Button asChild className="btn-primary-gradient">
          <Link to="/trackdays/create">
            <PlusCircle className="mr-2 h-5 w-5 flex-shrink-0" /> {t('add_new_trackday')}
          </Link>
        </Button>
      </div>

      {trackdays && trackdays.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('track')}</TableHead>
                <TableHead>{t('vehicle')}</TableHead>
                <TableHead>{t('best_laptime')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trackdays.map((trackday) => (
                <TableRow key={trackday.id}>
                  <TableCell>{format(new Date(trackday.date), 'PPP')}</TableCell>
                  <TableCell>{trackday.track?.name || trackday.trackId}</TableCell>
                  <TableCell>{trackday.vehicle?.license_plate || trackday.vehicleId}</TableCell>
                  <TableCell>{trackday.best_laptime || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/trackdays/${trackday.id}`}>
                      <Button variant="outline" size="sm">{t('view_edit_details')}</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card className="w-full mx-auto text-center p-6"> {/* Removed max-w-md */}
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">{t('no_trackdays_recorded')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrackdayList;