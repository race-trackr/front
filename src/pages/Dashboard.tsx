import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Wrench, CalendarDays, Users } from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {t('welcome')}, {user?.username || t("user")}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_trackdays')}</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              {t('you_have_participated_in_trackdays', { count: 5 })}
            </p>
            <Button asChild className="mt-4">
              <Link to="/trackdays">{t('view_trackdays')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_vehicles')}</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">{t('you_own_vehicles', { count: 2 })}</p>
            <Button asChild className="mt-4">
              <Link to="/vehicles">{t('manage_vehicles')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('upcoming_maintenances')}
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              {t('maintenance_due_soon', { count: 1 })}
            </p>
            <Button asChild className="mt-4">
              <Link to="/maintenances">{t('view_maintenances')}</Link>
            </Button>
          </CardContent>
        </Card>

        {user?.role === "owner" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin_panel')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t('access_admin_tools')}</div>
              <p className="text-xs text-muted-foreground">
                {t('manage_tracks_countries_users')}
              </p>
              <Button asChild className="mt-4">
                <Link to="/admin">{t('go_to_admin')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <DashboardCharts />
    </div>
  );
};

export default Dashboard;