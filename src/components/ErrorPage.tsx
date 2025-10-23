import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ErrorPage: React.FC = () => {
  const error = useRouteError();
  const { t } = useTranslation();

  let errorMessage: string;
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || t('unknown_error');
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = t('unknown_error');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-destructive">
            {errorStatus || t('error')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-foreground">
            {t('oops_something_went_wrong')}
          </p>
          <p className="text-muted-foreground italic">
            {errorMessage}
          </p>
          <Button asChild className="btn-primary-gradient mt-6">
            <Link to="/">{t('return_to_home')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;