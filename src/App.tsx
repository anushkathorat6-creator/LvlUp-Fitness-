import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/authStore";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import LevelMap from "./pages/LevelMap";
import LevelDetails from "./pages/LevelDetails";
import Workout from "./pages/Workout";
import GameWorkout from "./pages/GameWorkout";
import DietTracking from "./pages/DietTracking";
import WaterTracking from "./pages/WaterTracking";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = useAuthStore(s => s.theme);
  return <div className={theme}>{children}</div>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ThemeWrapper>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '1rem', fontSize: '14px' },
            }}
          />
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/levels" element={<ProtectedRoute><LevelMap /></ProtectedRoute>} />
            <Route path="/level/:id" element={<ProtectedRoute><LevelDetails /></ProtectedRoute>} />
            <Route path="/workout" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
            <Route path="/game-workout" element={<ProtectedRoute><GameWorkout /></ProtectedRoute>} />
            <Route path="/diet" element={<ProtectedRoute><DietTracking /></ProtectedRoute>} />
            <Route path="/water" element={<ProtectedRoute><WaterTracking /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;