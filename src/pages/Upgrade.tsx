import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gem } from 'lucide-react';

const Upgrade: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('upgrade_to_pro')}</h1>
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">{t('unlock_pro_features')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Gem className="h-20 w-20 text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">
            {t('upgrade_description')}
          </p>
          <Button className="btn-primary-gradient text-lg px-8 py-6">
            {t('get_pro_now')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upgrade;