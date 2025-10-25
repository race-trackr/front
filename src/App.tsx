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
      element: <ProtectedRoute />, // ProtectedRoute acts as a guard
      errorElement: <ErrorPage />,
      children: [
        {
          element: <Layout />, // Layout wraps the Outlet for all its children
          children: [
            {
              path: "/dashboard",
              element: <Dashboard />,
              handle: { crumb: () => t('Dashboard') },
            },
            {
              path: "/trackdays",
              handle: { crumb: () => t('trackdays') },
              children: [
                {
                  index: true,
                  element: <TrackdayList />,
                },
                {
                  path: "create",
                  element: <TrackdayCreate />,
                  handle: { crumb: () => t('create_new_trackday') },
                },
                {
                  path: ":id",
                  element: <TrackdayView />,
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
                  path: "edit/:id",
                  element: <TrackdayEdit />,
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
              ],
            },
            {
              path: "/vehicles",
              handle: { crumb: () => t('vehicles') },
              children: [
                {
                  index: true,
                  element: <VehicleList />,
                },
                {
                  path: "create",
                  element: <VehicleCreate />,
                  handle: { crumb: () => t('create_new_vehicle') },
                },
                {
                  path: ":id",
                  element: <VehicleView />,
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
                  path: "edit/:id",
                  element: <VehicleEdit />,
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
              ],
            },
            {
              path: "/maintenances",
              handle: { crumb: () => t('maintenances') },
              children: [
                {
                  index: true,
                  element: <MaintenanceList />,
                },
                {
                  path: "create",
                  element: <MaintenanceCreate />,
                  handle: { crumb: () => t('create_new_maintenance') },
                },
                {
                  path: ":id",
                  element: <MaintenanceView />,
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
                  path: "edit/:id",
                  element: <MaintenanceEdit />,
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
              ],
            },
            {
              path: "/settings",
              element: <Settings />,
              handle: { crumb: () => t('settings') },
            },
            {
              path: "/profile",
              element: <Profile />,
              handle: { crumb: () => t('my_account') },
            },
            {
              path: "/upgrade",
              element: <Upgrade />,
              handle: { crumb: () => t('upgrade_to_pro') },
            },
          ],
        },
      ],
    },
    {
      element: <ProtectedRoute allowedRoles={['admin']} />, // Admin ProtectedRoute acts as a guard
      errorElement: <ErrorPage />,
      children: [
        {
          element: <Layout />, // Layout wraps the Outlet for all its admin children
          children: [
            {
              path: "/admin",
              handle: { crumb: () => t('admin') },
              children: [
                {
                  index: true,
                  element: <AdminDashboard />,
                },
                {
                  path: "tracks", // This becomes /admin/tracks
                  handle: { crumb: () => t('manage_tracks') },
                  children: [
                    {
                      index: true,
                      element: <AdminTracks />,
                    },
                    {
                      path: "create",
                      element: <AdminTracksCreate />,
                      handle: { crumb: () => t('create_new_track') },
                    },
                    {
                      path: "edit/:id",
                      element: <AdminTracksEdit />,
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
                  ],
                },
                {
                  path: "countries", // This becomes /admin/countries
                  handle: { crumb: () => t('manage_countries') },
                  children: [
                    {
                      index: true,
                      element: <AdminCountries />,
                    },
                    {
                      path: "create",
                      element: <AdminCountriesCreate />,
                      handle: { crumb: () => t('create_new_country') },
                    },
                    {
                      path: "edit/:id",
                      element: <AdminCountriesEdit />,
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
              ],
            },
          ],
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