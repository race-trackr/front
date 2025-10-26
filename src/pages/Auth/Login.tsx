import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import GoogleIcon from '@/components/GoogleIcon';
import { LoginPayload } from '@/types';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
                  <FormLabel>{t('email')}<span className="text-destructive">*</span></FormLabel>
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
                  <div className="flex items-center">
                    <FormLabel>{t('password')}<span className="text-destructive">*</span></FormLabel>
                    <Link
                      to="/auth/forgot-password"
                      className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-primary"
                    >
                      {t('forgot_password')}
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full btn-primary-gradient" disabled={form.formState.isSubmitting || loading}>
              {form.formState.isSubmitting || loading ? t('logging_in') : t('login')}
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
          {t('login_with_google')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Login;