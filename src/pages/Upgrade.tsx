import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gem } from 'lucide-react';
import SubscriptionCard from '@/components/SubscriptionCard';

const Upgrade: React.FC = () => {
  const { t } = useTranslation();

  const plans = [
    {
      nameKey: 'plan_starter_name',
      priceKey: 'plan_starter_price',
      featuresKeys: [
        'feature_trackdays_10',
        'feature_vehicles_2',
        'feature_maintenance_20',
        'feature_basic_analytics',
      ],
      buttonTextKey: 'get_started',
      link: '#',
    },
    {
      nameKey: 'plan_pro_name',
      priceKey: 'plan_pro_price',
      featuresKeys: [
        'feature_trackdays_unlimited',
        'feature_vehicles_5',
        'feature_maintenance_unlimited',
        'feature_advanced_analytics',
        'feature_priority_email_support',
      ],
      buttonTextKey: 'go_pro',
      isPopular: true,
      link: '#',
    },
    {
      nameKey: 'plan_premium_name',
      priceKey: 'plan_premium_price',
      featuresKeys: [
        'feature_trackdays_unlimited',
        'feature_vehicles_unlimited',
        'feature_maintenance_unlimited',
        'feature_advanced_analytics',
        'feature_24_7_support',
        'feature_custom_branding',
      ],
      buttonTextKey: 'contact_sales',
      link: '#',
    },
    {
      nameKey: 'plan_enterprise_name',
      priceKey: 'plan_enterprise_price',
      featuresKeys: [
        'feature_trackdays_unlimited',
        'feature_vehicles_unlimited',
        'feature_maintenance_unlimited',
        'feature_advanced_analytics',
        'feature_24_7_support',
        'feature_custom_branding',
        'feature_dedicated_support',
        'feature_custom_integrations',
        'feature_on_premise_deployment',
      ],
      buttonTextKey: 'contact_sales',
      link: '#',
    },
  ];

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{t('upgrade_to_pro')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('upgrade_description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <SubscriptionCard key={index} plan={plan} />
        ))}
      </div>
    </div>
  );
};

export default Upgrade;