import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} /> {/* Default authenticated route */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/trackdays" element={<TrackdayList />} />
                <Route path="/trackdays/create" element={<TrackdayCreate />} />
                <Route path="/trackdays/edit/:id" element={<TrackdayEdit />} />
                <Route path="/vehicles" element={<VehicleList />} />
                <Route path="/vehicles/create" element={<VehicleCreate />} />
                <Route path="/vehicles/edit/:id" element={<VehicleEdit />} />
                <Route path="/maintenances" element={<MaintenanceList />} />
                <Route path="/maintenances/create" element={<MaintenanceCreate />} />
                <Route path="/maintenances/edit/:id" element={<MaintenanceEdit />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/tracks" element={<AdminTracks />} />
                <Route path="/admin/countries" element={<AdminCountries />} />
              </Route>

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;