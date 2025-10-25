import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import GoogleIcon from '@/components/GoogleIcon';
import { RegisterPayload, CountryType } from '@/types'; // Changed Country to CountryType
import apiClient from '@/lib/apiClient';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const Register: React.FC = () => {
  const { register: authRegister, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formSchema = z.object({
    fullName: z.string().min(2, { message: t('username_min_length') }), // Changed from username
    email: z.string().email({ message: t('invalid_email') }),
    password: z.string().min(6, { message: t('password_min_length') }),
    countryId: z.coerce.number().min(1, { message: t('country_required') }), // Changed to number
  });

  const form = useForm<RegisterPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '', // Changed from username
      email: '',
      password: '',
      countryId: 0, // Default to 0 for number type
    },
  });

  // Fetch countries using react-query
  const { data: countries, isLoading: isLoadingCountries, isError: isErrorCountries } = useQuery<CountryType[]>({ // Changed Country to CountryType
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
              name="fullName" // Changed from username
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('username')}</FormLabel> {/* Keeping translation key as 'username' for now */}
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
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()} disabled={isLoadingCountries || isErrorCountries || authLoading}>
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
        <div className="relative flex justify-center text-xs uppercase mt-6 mb-4">
          <Separator className="absolute inset-0 flex items-center">
            <span className="bg-background px-2 text-muted-foreground">{t('or_separator')}</span>
          </Separator>
        </div>
        <Button variant="outline" className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
          <GoogleIcon />
          {t('register_with_google')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Register;