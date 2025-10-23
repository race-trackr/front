import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Index from './pages/Index';
import AuthTabs from './pages/Auth/AuthTabs';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import TrackdayList from './pages/Trackdays/TrackdayList';
import TrackdayCreate from './pages/Trackdays/TrackdayCreate';
import TrackdayEdit from './pages/Trackdays/TrackdayEdit';
import VehicleList from './pages/Vehicles/VehicleList';
import VehicleCreate from './pages/Vehicles/VehicleCreate';
import VehicleEdit from './pages/Vehicles/VehicleEdit';
import MaintenanceList from './pages/Maintenances/MaintenanceList';
import MaintenanceCreate from './pages/Maintenances/MaintenanceCreate';
import MaintenanceEdit from './pages/Maintenances/MaintenanceEdit';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminTracks from './pages/Admin/AdminTracks';
import AdminTracksCreate from './pages/Admin/AdminTracksCreate';
import AdminTracksEdit from './pages/Admin/AdminTracksEdit';
import AdminCountries from './pages/Admin/AdminCountries';
import AdminCountriesCreate from './pages/Admin/AdminCountriesCreate';
import AdminCountriesEdit from './pages/Admin/AdminCountriesEdit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const routesConfig = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <AuthTabs />,
  },
  {
    element: <ProtectedRoute />, // Parent route for authenticated users
    children: [
      {
        path: "/dashboard",
        element: <Layout><Dashboard /></Layout>,
        handle: { crumb: () => 'Dashboard' },
      },
      {
        path: "/trackdays",
        element: <Layout><TrackdayList /></Layout>,
        handle: { crumb: () => 'Trackdays' },
      },
      {
        path: "/trackdays/create",
        element: <Layout><TrackdayCreate /></Layout>,
        handle: { crumb: () => 'Create Trackday' },
      },
      {
        path: "/trackdays/edit/:id",
        element: <Layout><TrackdayEdit /></Layout>,
        handle: { crumb: ({ params }: { params: { id?: string } }) => `Edit Trackday ${params.id || ''}` },
      },
      {
        path: "/vehicles",
        element: <Layout><VehicleList /></Layout>,
        handle: { crumb: () => 'Vehicles' },
      },
      {
        path: "/vehicles/create",
        element: <Layout><VehicleCreate /></Layout>,
        handle: { crumb: () => 'Create Vehicle' },
      },
      {
        path: "/vehicles/edit/:id",
        element: <Layout><VehicleEdit /></Layout>,
        handle: { crumb: ({ params }: { params: { id?: string } }) => `Edit Vehicle ${params.id || ''}` },
      },
      {
        path: "/maintenances",
        element: <Layout><MaintenanceList /></Layout>,
        handle: { crumb: () => 'Maintenances' },
      },
      {
        path: "/maintenances/create",
        element: <Layout><MaintenanceCreate /></Layout>,
        handle: { crumb: () => 'Create Maintenance' },
      },
      {
        path: "/maintenances/edit/:id",
        element: <Layout><MaintenanceEdit /></Layout>,
        handle: { crumb: ({ params }: { params: { id?: string } }) => `Edit Maintenance ${params.id || ''}` },
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['owner']} />, // Parent route for admin users
    children: [
      {
        path: "/admin",
        element: <Layout><AdminDashboard /></Layout>,
        handle: { crumb: () => 'Admin Dashboard' },
      },
      {
        path: "/admin/tracks",
        element: <Layout><AdminTracks /></Layout>,
        handle: { crumb: () => 'Manage Tracks' },
      },
      {
        path: "/admin/tracks/create",
        element: <Layout><AdminTracksCreate /></Layout>,
        handle: { crumb: () => 'Create Track' },
      },
      {
        path: "/admin/tracks/edit/:id",
        element: <Layout><AdminTracksEdit /></Layout>,
        handle: { crumb: ({ params }: { params: { id?: string } }) => `Edit Track ${params.id || ''}` },
      },
      {
        path: "/admin/countries",
        element: <Layout><AdminCountries /></Layout>,
        handle: { crumb: () => 'Manage Countries' },
      },
      {
        path: "/admin/countries/create",
        element: <Layout><AdminCountriesCreate /></Layout>,
        handle: { crumb: () => 'Create Country' },
      },
      {
        path: "/admin/countries/edit/:id",
        element: <Layout><AdminCountriesEdit /></Layout>,
        handle: { crumb: ({ params }: { params: { id?: string } }) => `Edit Country ${params.id || ''}` },
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

const router = createBrowserRouter(routesConfig);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;