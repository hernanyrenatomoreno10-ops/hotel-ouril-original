import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
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

const queryClient = new QueryClient();

// Componente para proteger rotas. Se não estiver logado, redireciona pro /login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-background" />; // Tela preta/loading
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
