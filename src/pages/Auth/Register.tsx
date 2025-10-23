import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RegisterPayload, Country } from '@/types';
import apiClient from '@/lib/apiClient';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const Register: React.FC = () => {
  const { register: authRegister, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formSchema = z.object({
    username: z.string().min(2, { message: t('username_min_length') }),
    email: z.string().email({ message: t('invalid_email') }),
    password: z.string().min(6, { message: t('password_min_length') }),
    countryId: z.string().min(1, { message: t('country_required') }),
  });

  const form = useForm<RegisterPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      countryId: '',
    },
  });

  // Fetch countries using react-query
  const { data: countries, isLoading: isLoadingCountries, isError: isErrorCountries } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await apiClient.get('/countries');
      return response.data;
    },
  });

  const onSubmit = async (values: RegisterPayload) => {
    try {
      await authRegister(values);
      navigate('/auth?tab=login', { replace: true });
    } catch (error) {
      // Error handled by AuthContext and toast
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="2xl">{t('register')}</CardTitle>
        <CardDescription>{t('create_account_to_get_started')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('username')}</FormLabel>
                  <FormControl>
                    <Input placeholder="JohnDoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
                  <FormLabel>{t('country')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCountries || isErrorCountries || authLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingCountries ? t('loading_countries') : isErrorCountries ? t('error_loading_countries') : t('select_country')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries?.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('select_your_country')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full btn-primary-gradient" disabled={form.formState.isSubmitting || isLoadingCountries || authLoading}>
              {form.formState.isSubmitting || authLoading ? t('registering') : t('register')}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {t('already_have_account')}{' '}
          <Link to="/auth?tab=login" className="underline">
            {t('login')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default Register;