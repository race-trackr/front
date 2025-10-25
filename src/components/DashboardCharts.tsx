import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTranslation } from 'react-i18next';

const trackdayData = [
  { name: 'Jan', trackdays: 4 },
  { name: 'Feb', trackdays: 3 },
  { name: 'Mar', trackdays: 5 },
  { name: 'Apr', trackdays: 2 },
  { name: 'May', trackdays: 6 },
  { name: 'Jun', trackdays: 4 },
];

const maintenanceData = [
  { name: 'Jan', cost: 300 },
  { name: 'Feb', cost: 450 },
  { name: 'Mar', cost: 200 },
  { name: 'Apr', cost: 600 },
  { name: 'May', cost: 350 },
  { name: 'Jun', cost: 700 },
];

const DashboardCharts: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('trackdays_per_month')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trackdayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="trackdays" fill="#8884d8" name={t('number_of_trackdays')} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('maintenance_cost_per_month')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={maintenanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="#82ca9d" name={t('cost_currency')} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;