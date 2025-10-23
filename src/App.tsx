import { Toaster as Sonner } from "@/components/ui/sonner"; // Garde seulement Sonner
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ThemeProvider } from 'next-themes';

// Pages
import AuthTabs from "./pages/Auth/AuthTabs";
import Dashboard from "./pages/Dashboard";
import TrackdayList from "./pages/Trackdays/TrackdayList";
import TrackdayCreate from "./pages/Trackdays/TrackdayCreate";
import TrackdayEdit from "./pages/Trackdays/TrackdayEdit";
import VehicleList from "./pages/Vehicles/VehicleList";
import VehicleCreate from "./pages/Vehicles/VehicleCreate";
import VehicleEdit from "./pages/Vehicles/VehicleEdit";
import MaintenanceList from "./pages/Maintenances/MaintenanceList";
import MaintenanceCreate from "./pages/Maintenances/MaintenanceCreate";
import MaintenanceEdit from "./pages/Maintenances/MaintenanceEdit";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminTracks from "./pages/Admin/AdminTracks";
import AdminCountries from "./pages/Admin/AdminCountries";
import AdminTracksCreate from "./pages/Admin/AdminTracksCreate";
import AdminTracksEdit from "./pages/Admin/AdminTracksEdit";
import AdminCountriesCreate from "./pages/Admin/AdminCountriesCreate";
import AdminCountriesEdit from "./pages/Admin/AdminCountriesEdit";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";


const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    handle: { crumb: () => i18n.t('home') },
  },
  {
    path: "/auth",
    element: <AuthTabs />,
    handle: { crumb: () => i18n.t('auth') },
  },
  {
    element: <Layout><Outlet /></Layout>,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
            handle: { crumb: () => i18n.t('dashboard') },
          },
          {
            path: "/trackdays",
            element: <TrackdayList />,
            handle: { crumb: () => i18n.t('trackdays') },
          },
          {
            path: "/trackdays/create",
            element: <TrackdayCreate />,
            handle: { crumb: () => i18n.t('create_new_trackday') },
          },
          {
            path: "/trackdays/edit/:id",
            element: <TrackdayEdit />,
            handle: { crumb: (data: any) => i18n.t('edit_trackday', { id: data?.id || '' }) },
          },
          {
            path: "/vehicles",
            element: <VehicleList />,
            handle: { crumb: () => i18n.t('vehicles') },
          },
          {
            path: "/vehicles/create",
            element: <VehicleCreate />,
            handle: { crumb: () => i18n.t('create_new_vehicle') },
          },
          {
            path: "/vehicles/edit/:id",
            element: <VehicleEdit />,
            handle: { crumb: (data: any) => i18n.t('edit_vehicle', { id: data?.id || '' }) },
          },
          {
            path: "/maintenances",
            element: <MaintenanceList />,
            handle: { crumb: () => i18n.t('maintenances') },
          },
          {
            path: "/maintenances/create",
            element: <MaintenanceCreate />,
            handle: { crumb: () => i18n.t('create_new_maintenance') },
          },
          {
            path: "/maintenances/edit/:id",
            element: <MaintenanceEdit />,
            handle: { crumb: (data: any) => i18n.t('edit_maintenance', { id: data?.id || '' }) },
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['owner']} />,
        children: [
          {
            path: "/admin",
            element: <AdminDashboard />,
            handle: { crumb: () => i18n.t('admin_dashboard') },
          },
          {
            path: "/admin/tracks",
            element: <AdminTracks />,
            handle: { crumb: () => i18n.t('manage_tracks') },
          },
          {
            path: "/admin/tracks/create",
            element: <AdminTracksCreate />,
            handle: { crumb: () => i18n.t('create_new_track') },
          },
          {
            path: "/admin/tracks/edit/:id",
            element: <AdminTracksEdit />,
            handle: { crumb: (data: any) => i18n.t('edit_track', { id: data?.id || '' }) },
          },
          {
            path: "/admin/countries",
            element: <AdminCountries />,
            handle: { crumb: () => i18n.t('manage_countries') },
          },
          {
            path: "/admin/countries/create",
            element: <AdminCountriesCreate />,
            handle: { crumb: () => i18n.t('create_new_country') },
          },
          {
            path: "/admin/countries/edit/:id",
            element: <AdminCountriesEdit />,
            handle: { crumb: (data: any) => i18n.t('edit_country', { id: data?.id || '' }) },
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
    handle: { crumb: () => i18n.t('oops_page_not_found') },
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
          </TooltipProvider>
          <Sonner /> {/* Sonner est maintenant ici, globalement */}
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;