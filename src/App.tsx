import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import DigitalKey from "./pages/DigitalKey.tsx";
import Concierge from "./pages/Concierge.tsx";
import Experiences from "./pages/Experiences.tsx";
import Checkout from "./pages/Checkout.tsx";
import RoomControl from "./pages/RoomControl.tsx";
import Gastronomy from "./pages/Gastronomy.tsx";
import Login from "./pages/Login.tsx";
import Guide from "./pages/Guide.tsx";
import Notifications from "./pages/Notifications.tsx";
import Medicentro from "./pages/Medicentro.tsx";
import PreArrival from "./pages/PreArrival.tsx";
import Wellness from "./pages/Wellness.tsx";
import StaffRestaurant from "./pages/staff/StaffRestaurant.tsx";
import StaffHousekeeping from "./pages/staff/StaffHousekeeping.tsx";
import StaffAdmin from "./pages/staff/StaffAdmin.tsx";

const queryClient = new QueryClient();

// Componente para proteger rotas. Se não estiver logado, redireciona pro /login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Bypassing auth for development as requested
  return <>{children}</>;
};

const StaffRoute = ({ roles, children }: { roles: Array<"admin" | "restaurant" | "housekeeping">; children: React.ReactNode }) => {
  // Bypassing role checks for development as requested
  return <>{children}</>;
};

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/key" element={<ProtectedRoute><DigitalKey /></ProtectedRoute>} />
            <Route path="/concierge" element={<ProtectedRoute><Concierge /></ProtectedRoute>} />
            <Route path="/experiences" element={<ProtectedRoute><Experiences /></ProtectedRoute>} />
            <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/room" element={<ProtectedRoute><RoomControl /></ProtectedRoute>} />
            <Route path="/gastronomy" element={<ProtectedRoute><Gastronomy /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/medicentro" element={<ProtectedRoute><Medicentro /></ProtectedRoute>} />
            <Route path="/pre-arrival" element={<ProtectedRoute><PreArrival /></ProtectedRoute>} />
            <Route path="/wellness" element={<ProtectedRoute><Wellness /></ProtectedRoute>} />

            <Route path="/staff/restaurant" element={<StaffRoute roles={["restaurant"]}><StaffRestaurant /></StaffRoute>} />
            <Route path="/staff/housekeeping" element={<StaffRoute roles={["housekeeping"]}><StaffHousekeeping /></StaffRoute>} />
            <Route path="/staff/admin" element={<StaffRoute roles={["admin"]}><StaffAdmin /></StaffRoute>} />
            
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ErrorBoundary>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
