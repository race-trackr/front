import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { CreateTrackdayPayload } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import apiClient from '@/lib/apiClient';
import { useTranslation } from 'react-i18next';

const TrackdayCreate: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formSchema = z.object({
    vehicleId: z.string().min(1, { message: t('vehicle_id_placeholder') }), // Placeholder message
    trackId: z.string().min(1, { message: t('track_id_placeholder') }),     // Placeholder message
    date: z.string().min(1, { message: t('date') }),
    weather: z.string().min(1, { message: t('weather') }),
    airTemperature: z.coerce.number().min(-50).max(50),
    trackTemperature: z.coerce.number().min(-50).max(100),
    trackCondition: z.string().min(1, { message: t('track_condition') }),
    note: z.string().optional(),
    bestLaptime: z.string().optional(),
    totalLaps: z.coerce.number().min(0),
    otherDetails: z.string().optional(), // Will be parsed as JSON
  });

  const form = useForm<CreateTrackdayPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: 'v1', // Placeholder
      trackId: 't1',   // Placeholder
      date: new Date().toISOString().split('T')[0],
      weather: 'Sunny',
      airTemperature: 20,
      trackTemperature: 30,
      trackCondition: 'Dry',
      note: '',
      bestLaptime: '',
      totalLaps: 0,
      otherDetails: '',
    },
  });

  const onSubmit = async (values: CreateTrackdayPayload) => {
    try {
      const payload = {
        ...values,
        otherDetails: values.otherDetails ? JSON.parse(values.otherDetails) : null,
      };
      await apiClient.post('/trackdays', payload);
      showSuccess(t('trackday_created_successfully'));
      navigate('/trackdays');
    } catch (error: any) {
      showError(error.response?.data?.message || t('failed_to_create_trackday'));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('create_new_trackday')}</h1>
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
              <FormField
                control={form.control}
                name="otherDetails"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('other_details_json')}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder='{"tirePressure": "2.0 bar"}' {...field} />
                    </FormControl>
                    <FormDescription>{t('enter_additional_details_json')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full md:col-span-2 btn-primary-gradient" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t('creating') : t('create_trackday')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackdayCreate;