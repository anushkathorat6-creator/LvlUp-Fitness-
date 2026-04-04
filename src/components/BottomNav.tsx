import { Home, Map, Dumbbell, UtensilsCrossed, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Map, label: 'Levels', path: '/levels' },
  { icon: Dumbbell, label: 'Workout', path: '/workout' },
  { icon: UtensilsCrossed, label: 'Diet', path: '/diet' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/20 md:hidden">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] relative"
            >
              {active && (
                <motion.div layoutId="navIndicator" className="absolute -top-1 w-8 h-1 rounded-full gradient-primary" />
              )}
              <Icon className={`w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;