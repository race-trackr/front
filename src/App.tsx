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
import MaintenanceView from './pages/Maintenances/MaintenanceView'; // Import MaintenanceView
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminTracks from './pages/Admin/AdminTracks';
import AdminTracksCreate from './pages/Admin/AdminTracksCreate';
import AdminTracksEdit from './pages/Admin/AdminTracksEdit';
import AdminCountries from './pages/Admin/AdminCountries';
import AdminCountriesCreate from './pages/Admin/AdminCountriesCreate';
import AdminCountriesEdit from './pages/Admin/AdminCountriesEdit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorPage from './components/ErrorPage';

const queryClient = new QueryClient();

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
        path: "/trackdays/:id",
        element: <Layout><TrackdayView /></Layout>,
        handle: { crumb: ({ params }: { params: { id?: string } }) => `View Trackday ${params.id || ''}` },
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
        path: "/vehicles/:id",
        element: <Layout><VehicleView /></Layout>,
        handle: { crumb: ({ params }: { params: { id?: string } }) => `View Vehicle ${params.id || ''}` },
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
        path: "/maintenances/:id", // New route for MaintenanceView
        element: <Layout><MaintenanceView /></Layout>,
        handle: { crumb: ({ params }: { params: { id?: string } }) => `View Maintenance ${params.id || ''}` },
      },
      {
        path: "/maintenances/edit/:id",
        element: <Layout><MaintenanceEdit /></Layout>,
        handle: { crumb: ({ params }: { params: { id?: string } }) => `Edit Maintenance ${params.id || ''}` },
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['admin']} />, // Changed 'owner' to 'admin'
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
  },
];

const router = createBrowserRouter(routesConfig);

const App: React.FC = () => {
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