import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionPlan {
  nameKey: string;
  priceKey: string;
  featuresKeys: string[];
  buttonTextKey: string;
  isPopular?: boolean;
  link?: string;
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ plan }) => {
  const { t } = useTranslation();

  return (
    <Card className={cn(
      "flex flex-col justify-between p-6 border-2",
      plan.isPopular ? "border-primary shadow-lg" : "border-muted"
    )}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold mb-2">{t(plan.nameKey)}</CardTitle>
        <p className="text-4xl font-extrabold text-primary mb-4">{t(plan.priceKey)}</p>
        <p className="text-sm text-muted-foreground">{t('per_month')}</p>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <ul className="space-y-3 mb-6">
          {plan.featuresKeys.map((featureKey, index) => (
            <li key={index} className="flex items-center text-foreground">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span>{t(featureKey)}</span>
            </li>
          ))}
        </ul>
        <Button asChild className={cn("w-full", plan.isPopular && "btn-primary-gradient")}>
          {plan.link ? (
            <a href={plan.link}>{t(plan.buttonTextKey)}</a>
          ) : (
            <button>{t(plan.buttonTextKey)}</button>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;