import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { CreateTrackdayPayload, Trackday } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import apiClient from '@/lib/apiClient';
import { useTranslation } from 'react-i18next';

const TrackdayEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formSchema = z.object({
    vehicleId: z.string().min(1, { message: t('vehicle_id_placeholder') }),
    trackId: z.string().min(1, { message: t('track_id_placeholder') }),
    date: z.string().min(1, { message: t('date') }),
    weather: z.string().min(1, { message: t('weather') }),
    airTemperature: z.coerce.number().min(-50).max(50),
    trackTemperature: z.coerce.number().min(-50).max(100),
    trackCondition: z.string().min(1, { message: t('track_condition') }),
    note: z.string().optional(),
    bestLaptime: z.string().optional(),
    totalLaps: z.coerce.number().min(0),
  });

  const form = useForm<CreateTrackdayPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: '',
      trackId: '',
      date: '',
      weather: '',
      airTemperature: 0,
      trackTemperature: 0,
      trackCondition: '',
      note: '',
      bestLaptime: '',
      totalLaps: 0,
    },
  });

  useEffect(() => {
    if (id) {
      // In a real app, fetch trackday data by ID
      // For now, simulate fetching
      const fetchedTrackday: Trackday = {
        id: id,
        userId: 'user1',
        vehicleId: 'v1',
        trackId: 't1',
        date: '2023-10-26',
        weather: 'Sunny',
        airTemperature: 25,
        trackTemperature: 35,
        trackCondition: 'Dry',
        note: 'Great day!',
        bestLaptime: '1:30.123',
        totalLaps: 20,
        createdAt: '2023-10-20T10:00:00Z',
        updatedAt: '2023-10-20T10:00:00Z',
      };

      form.reset({
        ...fetchedTrackday,
        date: fetchedTrackday.date.split('T')[0], // Format date for input type="date"
      });
    }
  }, [id, form]);

  const onSubmit = async (values: CreateTrackdayPayload) => {
    try {
      const payload = {
        ...values,
      };
      await apiClient.put(`/trackdays/${id}`, payload); // Use PUT for updates
      showSuccess(t('trackday_updated_successfully'));
      navigate('/trackdays');
    } catch (error: any) {
      showError(error.response?.data?.message || t('failed_to_update_trackday'));
    }
  };

  const onDelete = async () => {
    if (!window.confirm(t('confirm_delete_trackday'))) return;
    try {
      await apiClient.delete(`/trackdays/${id}`);
      showSuccess(t('trackday_deleted_successfully'));
      navigate('/trackdays');
    } catch (error: any) {
      showError(error.response?.data?.message || t('failed_to_delete_trackday'));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('edit_trackday', { id })}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('trackday_details')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicle_id_placeholder')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>In a real app, this would be a select dropdown.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trackId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('track_id_placeholder')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>In a real app, this would be a select dropdown.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('date')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weather"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('weather')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="airTemperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('air_temperature')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trackTemperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('track_temperature')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trackCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('track_condition')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bestLaptime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('best_laptime')}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1:30.123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalLaps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('total_laps')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('notes')}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between w-full md:col-span-2">
                <Button type="submit" className="btn-primary-gradient" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? t('saving') : t('save_changes')}
                </Button>
                <Button type="button" variant="destructive" onClick={onDelete}>
                  {t('delete_trackday')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackdayEdit;