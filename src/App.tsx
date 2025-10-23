import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Import i18n configuration
import { ThemeProvider } from 'next-themes'; // Import ThemeProvider
import AppBar from "./components/AppBar"; // Import AppBar

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nextProvider i18n={i18n}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <BrowserRouter>
            <AuthProvider>
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} handle={{ crumb: () => i18n.t('home') }} />
                  <Route path="/auth" element={<AuthTabs />} handle={{ crumb: () => i18n.t('auth') }} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} handle={{ crumb: () => i18n.t('dashboard') }} />
                    <Route path="/trackdays" element={<TrackdayList />} handle={{ crumb: () => i18n.t('trackdays') }} />
                    <Route path="/trackdays/create" element={<TrackdayCreate />} handle={{ crumb: () => i18n.t('create_new_trackday') }} />
                    <Route path="/trackdays/edit/:id" element={<TrackdayEdit />} handle={{ crumb: (data: any) => i18n.t('edit_trackday', { id: data?.id || '' }) }} />
                    <Route path="/vehicles" element={<VehicleList />} handle={{ crumb: () => i18n.t('vehicles') }} />
                    <Route path="/vehicles/create" element={<VehicleCreate />} handle={{ crumb: () => i18n.t('create_new_vehicle') }} />
                    <Route path="/vehicles/edit/:id" element={<VehicleEdit />} handle={{ crumb: (data: any) => i18n.t('edit_vehicle', { id: data?.id || '' }) }} />
                    <Route path="/maintenances" element={<MaintenanceList />} handle={{ crumb: () => i18n.t('maintenances') }} />
                    <Route path="/maintenances/create" element={<MaintenanceCreate />} handle={{ crumb: () => i18n.t('create_new_maintenance') }} />
                    <Route path="/maintenances/edit/:id" element={<MaintenanceEdit />} handle={{ crumb: (data: any) => i18n.t('edit_maintenance', { id: data?.id || '' }) }} />
                  </Route>

                  {/* Admin Protected Routes (only for 'owner' role) */}
                  <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
                    <Route path="/admin" element={<AdminDashboard />} handle={{ crumb: () => i18n.t('admin_dashboard') }} />
                    <Route path="/admin/tracks" element={<AdminTracks />} handle={{ crumb: () => i18n.t('manage_tracks') }} />
                    <Route path="/admin/tracks/create" element={<AdminTracksCreate />} handle={{ crumb: () => i18n.t('create_new_track') }} />
                    <Route path="/admin/tracks/edit/:id" element={<AdminTracksEdit />} handle={{ crumb: (data: any) => i18n.t('edit_track', { id: data?.id || '' }) }} />
                    <Route path="/admin/countries" element={<AdminCountries />} handle={{ crumb: () => i18n.t('manage_countries') }} />
                    <Route path="/admin/countries/create" element={<AdminCountriesCreate />} handle={{ crumb: () => i18n.t('create_new_country') }} />
                    <Route path="/admin/countries/edit/:id" element={<AdminCountriesEdit />} handle={{ crumb: (data: any) => i18n.t('edit_country', { id: data?.id || '' }) }} />
                  </Route>

                  {/* Catch-all Route */}
                  <Route path="*" element={<NotFound />} handle={{ crumb: () => i18n.t('oops_page_not_found') }} />
                </Routes>
              </Layout>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </I18nextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;