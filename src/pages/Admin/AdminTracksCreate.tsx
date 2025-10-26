import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import apiClient from '@/lib/apiClient';
import { CountryType, TrackType } from '@/types';

const formSchema = z.object({
  name: z.string().min(1, { message: "Le nom de la piste est requis." }),
  countryId: z.coerce.number().min(1, { message: "Le pays est requis." }),
  length: z.coerce.number().min(0.1, { message: "La longueur doit être supérieure à 0." }),
  address: z.string().nullable().optional(),
  city: z.string().min(1, { message: "La ville est requise." }),
  website: z.string().url({ message: "L'URL du site web est invalide." }).nullable().optional(),
});

const AdminTracksCreate: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<Omit<TrackType, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'country' | 'trackDays'>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      countryId: 0,
      length: 0.1,
      address: null,
      city: '',
      website: null,
    },
  });

  const { data: countries, isLoading: isLoadingCountries, isError: isErrorCountries } = useQuery<CountryType[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await apiClient.get('/countries');
      return response.data;
    },
  });

  const createTrackMutation = useMutation({
    mutationFn: async (payload: Omit<TrackType, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'country' | 'trackDays'>) => {
      const response = await apiClient.post('/tracks', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success(t('track_created_successfully'));
      navigate('/admin/tracks');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_create_track'));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: Omit<TrackType, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'country' | 'trackDays'> = {
      ...values,
      name: values.name,
      countryId: values.countryId,
      length: values.length,
      city: values.city,
      address: values.address === '' ? null : values.address,
      website: values.website === '' ? null : values.website,
    };
    createTrackMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('create_new_track')}</h1>
      <Card>
        <CardHeader><CardTitle>{t('track_details')}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('track_name')}<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_track_name')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="countryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('country')}<span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value.toString()} disabled={isLoadingCountries || isErrorCountries || createTrackMutation.isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingCountries ? t('loading_countries') : isErrorCountries ? t('error_loading_countries') : t('select_country')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries?.map((country) => (
                          <SelectItem key={country.id} value={country.id.toString()}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('length_km')}<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('city')}<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_city')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder={t('enter_address')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('website')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder={t('enter_website_url')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between mt-4 md:col-span-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" className="btn-primary-gradient" disabled={createTrackMutation.isPending}>
                  {createTrackMutation.isPending ? t('creating') : t('save_track')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTracksCreate;