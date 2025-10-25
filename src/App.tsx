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
import { useTranslation } from 'react-i18next'; // Import useTranslation

const queryClient = new QueryClient();

// Wrapper component to provide t() to route handles
const RouteHandleWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  // This component doesn't render anything itself, it just makes `t` available
  // to the route handles via closure if they are defined within this scope.
  // However, `createBrowserRouter` is called outside of React component tree,
  // so we need to pass `t` directly to the handle functions.
  // The `useBreadcrumbs` hook already uses `useTranslation` internally,
  // so we just need to ensure the strings passed to `crumb` are translation keys.
  return <>{children}</>;
};

const App: React.FC = () => {
  const { t } = useTranslation(); // Get t() here to use in route definitions

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
          handle: { crumb: ({ params }: { params: { id?: string } }) => t('view_trackday', { id: params.id || '' }) },
        },
        {
          path: "/trackdays/edit/:id",
          element: <Layout><TrackdayEdit /></Layout>,
          handle: { crumb: ({ params }: { params: { id?: string } }) => t('edit_trackday', { id: params.id || '' }) },
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
          handle: { crumb: ({ params }: { params: { id?: string } }) => t('view_vehicle', { id: params.id || '' }) },
        },
        {
          path: "/vehicles/edit/:id",
          element: <Layout><VehicleEdit /></Layout>,
          handle: { crumb: ({ params }: { params: { id?: string } }) => t('edit_vehicle', { id: params.id || '' }) },
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
          handle: { crumb: ({ params }: { params: { id?: string } }) => t('view_maintenance', { id: params.id || '' }) },
        },
        {
          path: "/maintenances/edit/:id",
          element: <Layout><MaintenanceEdit /></Layout>,
          handle: { crumb: ({ params }: { params: { id?: string } }) => t('edit_maintenance', { id: params.id || '' }) },
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
          handle: { crumb: () => t('admin_dashboard') },
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
          handle: { crumb: ({ params }: { params: { id?: string } }) => t('edit_track', { id: params.id || '' }) },
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
          handle: { crumb: ({ params }: { params: { id?: string } }) => t('edit_country', { id: params.id || '' }) },
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