import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide." }),
});

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Simulate API call for password reset
    // In a real application, you would send a request to your backend here.
    console.log("Password reset requested for:", values.email);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    toast.success(t('password_reset_email_sent'));
    navigate('/auth?tab=login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl">{t('forgot_password')}</CardTitle>
          <CardDescription>{t('enter_email_for_reset')}</CardDescription>
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
              <Button type="submit" className="w-full btn-primary-gradient" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t('sending_reset_link') : t('send_reset_link')}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t('remember_password')}
            <Link to="/auth?tab=login" className="underline ml-1 text-primary hover:text-primary-foreground">
              {t('login')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;