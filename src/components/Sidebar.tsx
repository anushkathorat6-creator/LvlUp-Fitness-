import { Home, Map, Dumbbell, UtensilsCrossed, Droplets, BarChart3, User, LogOut, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Map, label: 'Levels', path: '/levels' },
  { icon: Dumbbell, label: 'Workout', path: '/workout' },
  { icon: UtensilsCrossed, label: 'Diet', path: '/diet' },
  { icon: Droplets, label: 'Water', path: '/water' },
  { icon: BarChart3, label: 'Progress', path: '/progress' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass-strong border-r border-white/20 p-6 z-40">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-display text-xl font-bold text-foreground">LevelFit AI</span>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-left min-h-[44px] ${
                active ? 'gradient-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{label}</span>
              {active && <motion.div layoutId="sidebarActive" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
            </button>
          );
        })}
      </nav>
      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium text-sm">Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;