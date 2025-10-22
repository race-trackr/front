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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Trackdays par mois</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trackdayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="trackdays" fill="#8884d8" name="Nombre de Trackdays" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coût de maintenance par mois</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={maintenanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="#82ca9d" name="Coût (€)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;