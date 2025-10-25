import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Index from './pages/Index';
import AuthTabs from './pages/Auth/AuthTabs';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import TrackdayList from './pages/Trackdays/TrackdayList';
import TrackdayCreate from './pages/Trackdays/TrackdayCreate';
import TrackdayEdit from './pages/Trackdays/TrackdayEdit';
import TrackdayView from './pages/Trackdays/TrackdayView';
import VehicleList from './pages/Vehicles/VehicleList';
import VehicleCreate from './pages/Vehicles/VehicleCreate';
import VehicleEdit from './pages/Vehicles/VehicleEdit';
import VehicleView from './pages/Vehicles/VehicleView';
import MaintenanceList from './pages/Maintenances/MaintenanceList';
import MaintenanceCreate from './pages/Maintenances/MaintenanceCreate';
import MaintenanceEdit from './pages/Maintenances/MaintenanceEdit';
import MaintenanceView from './pages/Maintenances/MaintenanceView';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminTracks from './pages/Admin/AdminTracks';
import AdminTracksCreate from './pages/Admin/AdminTracksCreate';
import AdminTracksEdit from './pages/Admin/AdminTracksEdit';
import AdminCountries from './pages/Admin/AdminCountries';
import AdminCountriesCreate from './pages/Admin/AdminCountriesCreate';
import AdminCountriesEdit from './pages/Admin/AdminCountriesEdit';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Upgrade from './pages/Upgrade';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorPage from './components/ErrorPage';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS, es, it } from 'date-fns/locale';
import apiClient from '@/lib/apiClient';
import { getTrackdayById } from '@/lib/api/trackdays';
import { getVehicleById } from '@/lib/api/vehicles';
import { getMaintenanceById } from '@/lib/api/maintenances';
import { TrackDayType, UserVehicleType, MaintenanceRecordType, TrackType, CountryType } from '@/types';

const queryClient = new QueryClient();

interface RouteMatchWithData {
  params: { [key: string]: string | undefined };
  data?: any; // This will hold the loader's return value
}

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  const getLocale = (lang: string) => {
    switch (lang) {
      case 'fr':
        return fr;
      case 'es':
        return es;
      case 'it':
        return it;
      default:
        return enUS;
    }
  };

  const routesConfig = [
    {
      path: "/",
      element: <Index />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/auth",
      element: <AuthTabs />,
      errorElement: <ErrorPage />,
    },
    {
      element: <ProtectedRoute />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/dashboard",
          element: <Layout><Dashboard /></Layout>,
          handle: { crumb: () => t('Dashboard') },
        },
        {
          path: "/trackdays",
          element: <Layout><TrackdayList /></Layout>,
          handle: { crumb: () => t('trackdays') },
        },
        {
          path: "/trackdays/create",
          element: <Layout><TrackdayCreate /></Layout>,
          handle: { crumb: () => t('create_new_trackday') },
        },
        {
          path: "/trackdays/:id",
          element: <Layout><TrackdayView /></Layout>,
          loader: async ({ params }) => {
            const trackday = await getTrackdayById(params.id!);
            return { trackday };
          },
          handle: {
            crumb: ({ data }: RouteMatchWithData) => {
              const trackday = data?.trackday as TrackDayType;
              return trackday ? t('session_of_date', { date: format(new Date(trackday.date), 'PPP', { locale: getLocale(i18n.language) }) }) : t('view_trackday', { id: data?.params?.id || '' });
            }
          },
        },
        {
          path: "/trackdays/edit/:id",
          element: <Layout><TrackdayEdit /></Layout>,
          loader: async ({ params }) => {
            const trackday = await getTrackdayById(params.id!);
            return { trackday };
          },
          handle: {
            crumb: ({ data }: RouteMatchWithData) => {
              const trackday = data?.trackday as TrackDayType;
              return trackday ? t('edit_session_of_date', { date: format(new Date(trackday.date), 'PPP', { locale: getLocale(i18n.language) }) }) : t('edit_trackday', { id: data?.params?.id || '' });
            }
          },
        },
        {
          path: "/vehicles",
          element: <Layout><VehicleList /></Layout>,
          handle: { crumb: () => t('vehicles') },
        },
        {
          path: "/vehicles/create",
          element: <Layout><VehicleCreate /></Layout>,
          handle: { crumb: () => t('create_new_vehicle') },
        },
        {
          path: "/vehicles/:id",
          element: <Layout><VehicleView /></Layout>,
          loader: async ({ params }) => {
            const vehicle = await getVehicleById(Number(params.id!));
            return { vehicle };
          },
          handle: {
            crumb: ({ data }: RouteMatchWithData) => {
              const vehicle = data?.vehicle as UserVehicleType;
              return vehicle ? t('view_vehicle_name', { brand: vehicle.brand, model: vehicle.model }) : t('view_vehicle', { id: data?.params?.id || '' });
            }
          },
        },
        {
          path: "/vehicles/edit/:id",
          element: <Layout><VehicleEdit /></Layout>,
          loader: async ({ params }) => {
            const vehicle = await getVehicleById(Number(params.id!));
            return { vehicle };
          },
          handle: {
            crumb: ({ data }: RouteMatchWithData) => {
              const vehicle = data?.vehicle as UserVehicleType;
              return vehicle ? t('edit_vehicle_name', { brand: vehicle.brand, model: vehicle.model }) : t('edit_vehicle', { id: data?.params?.id || '' });
            }
          },
        },
        {
          path: "/maintenances",
          element: <Layout><MaintenanceList /></Layout>,
          handle: { crumb: () => t('maintenances') },
        },
        {
          path: "/maintenances/create",
          element: <Layout><MaintenanceCreate /></Layout>,
          handle: { crumb: () => t('create_new_maintenance') },
        },
        {
          path: "/maintenances/:id",
          element: <Layout><MaintenanceView /></Layout>,
          loader: async ({ params }) => {
            const maintenance = await getMaintenanceById(Number(params.id!));
            return { maintenance };
          },
          handle: {
            crumb: ({ data }: RouteMatchWithData) => {
              const maintenance = data?.maintenance as MaintenanceRecordType;
              return maintenance ? t('view_maintenance_name_date', { name: maintenance.name, date: format(new Date(maintenance.date), 'PPP', { locale: getLocale(i18n.language) }) }) : t('view_maintenance', { id: data?.params?.id || '' });
            }
          },
        },
        {
          path: "/maintenances/edit/:id",
          element: <Layout><MaintenanceEdit /></Layout>,
          loader: async ({ params }) => {
            const maintenance = await getMaintenanceById(Number(params.id!));
            return { maintenance };
          },
          handle: {
            crumb: ({ data }: RouteMatchWithData) => {
              const maintenance = data?.maintenance as MaintenanceRecordType;
              return maintenance ? t('edit_maintenance_name_date', { name: maintenance.name, date: format(new Date(maintenance.date), 'PPP', { locale: getLocale(i18n.language) }) }) : t('edit_maintenance', { id: data?.params?.id || '' });
            }
          },
        },
        {
          path: "/settings",
          element: <Layout><Settings /></Layout>,
          handle: { crumb: () => t('settings') },
        },
        {
          path: "/profile",
          element: <Layout><Profile /></Layout>,
          handle: { crumb: () => t('my_account') },
        },
        {
          path: "/upgrade",
          element: <Layout><Upgrade /></Layout>,
          handle: { crumb: () => t('upgrade_to_pro') },
        },
      ],
    },
    {
      element: <ProtectedRoute allowedRoles={['admin']} />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/admin",
          element: <Layout><AdminDashboard /></Layout>,
          handle: { crumb: () => t('admin') },
        },
        {
          path: "/admin/tracks",
          element: <Layout><AdminTracks /></Layout>,
          handle: { crumb: () => t('manage_tracks') },
        },
        {
          path: "/admin/tracks/create",
          element: <Layout><AdminTracksCreate /></Layout>,
          handle: { crumb: () => t('create_new_track') },
        },
        {
          path: "/admin/tracks/edit/:id",
          element: <Layout><AdminTracksEdit /></Layout>,
          loader: async ({ params }) => {
            const response = await apiClient.get(`/tracks/${params.id!}`);
            return { track: response.data };
          },
          handle: {
            crumb: ({ data }: RouteMatchWithData) => {
              const track = data?.track as TrackType;
              return track ? t('edit_track_name', { name: track.name }) : t('edit_track', { id: data?.params?.id || '' });
            }
          },
        },
        {
          path: "/admin/countries",
          element: <Layout><AdminCountries /></Layout>,
          handle: { crumb: () => t('manage_countries') },
        },
        {
          path: "/admin/countries/create",
          element: <Layout><AdminCountriesCreate /></Layout>,
          handle: { crumb: () => t('create_new_country') },
        },
        {
          path: "/admin/countries/edit/:id",
          element: <Layout><AdminCountriesEdit /></Layout>,
          loader: async ({ params }) => {
            const response = await apiClient.get(`/countries/${params.id!}`);
            return { country: response.data };
          },
          handle: {
            crumb: ({ data }: RouteMatchWithData) => {
              const country = data?.country as CountryType;
              return country ? t('edit_country_name', { name: country.name }) : t('edit_country', { id: data?.params?.id || '' });
            }
          },
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
      errorElement: <ErrorPage />,
    },
  ];

  const router = createBrowserRouter(routesConfig);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;