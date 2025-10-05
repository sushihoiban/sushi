import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminAvailabilityPage from "./pages/admin/AdminAvailabilityPage";
import AdminTablesPage from "./pages/admin/AdminTablesPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import { useMemo } from "react";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { session, isAdmin, loading } = useAuth();

  const routes = useMemo(() => {
    if (loading) {
      return <Route path="*" element={<div>Loading...</div>} />;
    }

    return (
      <>
        <Route path="/" element={!session ? <Auth /> : <Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        
        {session && isAdmin && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="availability" element={<AdminAvailabilityPage />} />
            <Route path="tables" element={<AdminTablesPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        )}
        
        <Route path="*" element={<NotFound />} />
      </>
    );
  }, [session, isAdmin, loading]);


  return (
    <Routes>
      {routes}
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;