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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoginPayload } from '@/types';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize useTranslation

  const formSchema = z.object({
    email: z.string().email({ message: t('invalid_email') }),
    password: z.string().min(3, { message: t('password_min_length') }),
  });

  const form = useForm<LoginPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginPayload) => {
    try {
      await login(values);
      console.log('Login successful');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error(error);
      // Error handled by AuthContext and toast
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{t('login')}</CardTitle>
        <CardDescription>{t('enter_email_to_login')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || loading}>
              {form.formState.isSubmitting || loading ? t('logging_in') : t('login')}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {t('dont_have_account')}{' '}
          <Link to="/auth?tab=register" className="underline">
            {t('sign_up')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default Login;