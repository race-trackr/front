import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { Toaster } from '@/components/ui/sonner'; // Changed to sonner Toaster
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout'; // Import Layout
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

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthTabs />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} handle={{ crumb: () => 'Dashboard' }} />
                
                <Route path="/trackdays" element={<Layout><TrackdayList /></Layout>} handle={{ crumb: () => 'Trackdays' }} />
                <Route path="/trackdays/create" element={<Layout><TrackdayCreate /></Layout>} handle={{ crumb: () => 'Create Trackday' }} />
                <Route path="/trackdays/edit/:id" element={<Layout><TrackdayEdit /></Layout>} handle={{ crumb: (data) => `Edit Trackday ${data?.id || ''}` }} />

                <Route path="/vehicles" element={<Layout><VehicleList /></Layout>} handle={{ crumb: () => 'Vehicles' }} />
                <Route path="/vehicles/create" element={<Layout><VehicleCreate /></Layout>} handle={{ crumb: () => 'Create Vehicle' }} />
                <Route path="/vehicles/edit/:id" element={<Layout><VehicleEdit /></Layout>} handle={{ crumb: (data) => `Edit Vehicle ${data?.id || ''}` }} />

                <Route path="/maintenances" element={<Layout><MaintenanceList /></Layout>} handle={{ crumb: () => 'Maintenances' }} />
                <Route path="/maintenances/create" element={<Layout><MaintenanceCreate /></Layout>} handle={{ crumb: () => 'Create Maintenance' }} />
                <Route path="/maintenances/edit/:id" element={<Layout><MaintenanceEdit /></Layout>} handle={{ crumb: (data) => `Edit Maintenance ${data?.id || ''}` }} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
                <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} handle={{ crumb: () => 'Admin Dashboard' }} />
                <Route path="/admin/tracks" element={<Layout><AdminTracks /></Layout>} handle={{ crumb: () => 'Manage Tracks' }} />
                <Route path="/admin/tracks/create" element={<Layout><AdminTracksCreate /></Layout>} handle={{ crumb: () => 'Create Track' }} />
                <Route path="/admin/tracks/edit/:id" element={<Layout><AdminTracksEdit /></Layout>} handle={{ crumb: (data) => `Edit Track ${data?.id || ''}` }} />
                <Route path="/admin/countries" element={<Layout><AdminCountries /></Layout>} handle={{ crumb: () => 'Manage Countries' }} />
                <Route path="/admin/countries/create" element={<Layout><AdminCountriesCreate /></Layout>} handle={{ crumb: () => 'Create Country' }} />
                <Route path="/admin/countries/edit/:id" element={<Layout><AdminCountriesEdit /></Layout>} handle={{ crumb: (data) => `Edit Country ${data?.id || ''}` }} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;