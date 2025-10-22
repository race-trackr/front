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

const formSchema = z.object({
  vehicleId: z.string().min(1, { message: 'Vehicle is required.' }),
  trackId: z.string().min(1, { message: 'Track is required.' }),
  date: z.string().min(1, { message: 'Date is required.' }),
  weather: z.string().min(1, { message: 'Weather is required.' }),
  airTemperature: z.coerce.number().min(-50).max(50),
  trackTemperature: z.coerce.number().min(-50).max(100),
  trackCondition: z.string().min(1, { message: 'Track condition is required.' }),
  note: z.string().optional(),
  bestLaptime: z.string().optional(),
  totalLaps: z.coerce.number().min(0),
  otherDetails: z.string().optional(), // Will be parsed as JSON
});

const TrackdayEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
      otherDetails: '',
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
        otherDetails: { tirePressure: '2.0 bar' },
        createdAt: '2023-10-20T10:00:00Z',
        updatedAt: '2023-10-20T10:00:00Z',
      };

      form.reset({
        ...fetchedTrackday,
        date: fetchedTrackday.date.split('T')[0], // Format date for input type="date"
        otherDetails: fetchedTrackday.otherDetails ? JSON.stringify(fetchedTrackday.otherDetails, null, 2) : '',
      });
    }
  }, [id, form]);

  const onSubmit = async (values: CreateTrackdayPayload) => {
    try {
      const payload = {
        ...values,
        otherDetails: values.otherDetails ? JSON.parse(values.otherDetails) : null,
      };
      await apiClient.put(`/trackdays/${id}`, payload); // Use PUT for updates
      showSuccess('Trackday updated successfully!');
      navigate('/trackdays');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update trackday.');
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this trackday?')) return;
    try {
      await apiClient.delete(`/trackdays/${id}`);
      showSuccess('Trackday deleted successfully!');
      navigate('/trackdays');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to delete trackday.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Trackday #{id}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Trackday Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle ID (Placeholder)</FormLabel>
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
                    <FormLabel>Track ID (Placeholder)</FormLabel>
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
                    <FormLabel>Date</FormLabel>
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
                    <FormLabel>Weather</FormLabel>
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
                    <FormLabel>Air Temperature (°C)</FormLabel>
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
                    <FormLabel>Track Temperature (°C)</FormLabel>
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
                    <FormLabel>Track Condition</FormLabel>
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
                    <FormLabel>Best Laptime</FormLabel>
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
                    <FormLabel>Total Laps</FormLabel>
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
                    <FormLabel>Notes</FormLabel>
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
                    <FormLabel>Other Details (JSON)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder='{"tirePressure": "2.0 bar"}' {...field} />
                    </FormControl>
                    <FormDescription>Enter additional details as a JSON string.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between w-full md:col-span-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="destructive" onClick={onDelete}>
                  Delete Trackday
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