import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import apiClient from '@/lib/apiClient';
import { CountryType } from '@/types';

const formSchema = z.object({
  name: z.string().min(1, { message: "Le nom du pays est requis." }),
  iso: z.string().length(2, { message: "Le code ISO doit contenir 2 caractères." }),
  timezone: z.string().min(1, { message: "Le fuseau horaire est requis." }),
  capital: z.string().min(1, { message: "La capitale est requise." }),
});

const AdminCountriesCreate: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<Omit<CountryType, 'id' | 'slug' | 'createdAt' | 'updatedAt'>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      iso: '',
      timezone: '',
      capital: '',
    },
  });

  const createCountryMutation = useMutation({
    mutationFn: async (payload: Omit<CountryType, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiClient.post('/countries', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      toast.success(t('country_created_successfully'));
      navigate('/admin/countries');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('failed_to_create_country'));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: Omit<CountryType, 'id' | 'slug' | 'createdAt' | 'updatedAt'> = {
      ...values,
      // Ensure required fields are explicitly handled if Zod's infer makes them optional
      name: values.name,
      iso: values.iso,
      timezone: values.timezone,
      capital: values.capital,
    };
    createCountryMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('create_new_country')}</h1>
      <Card>
        <CardHeader><CardTitle>{t('country_details')}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('country_name')}<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_country_name')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('country_iso')}<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., US, FR" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('timezone')}<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., CET, EST" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('capital')}<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter_capital')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between mt-4 md:col-span-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" className="btn-primary-gradient" disabled={createCountryMutation.isPending}>
                  {createCountryMutation.isPending ? t('creating') : t('save_country')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCountriesCreate;