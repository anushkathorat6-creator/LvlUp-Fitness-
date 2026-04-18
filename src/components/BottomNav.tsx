import { Home, Sparkles, Dumbbell, UtensilsCrossed, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Sparkles, label: 'AI', path: '/ai-assistant' },
  { icon: Dumbbell, label: 'Workout', path: '/workout' },
  { icon: UtensilsCrossed, label: 'Diet', path: '/diet' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] glass-strong border-t border-white/5 md:hidden pb-safe mb-2 mx-4 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-3xl bg-black/60">
      <div className="max-w-lg mx-auto flex justify-around items-center py-4 px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 min-w-[56px] min-h-[56px] relative active:scale-90"
            >
              {active && (
                <motion.div 
                  layoutId="navIndicator" 
                  className="absolute -top-3 w-6 h-1 rounded-full bg-neon-green shadow-[0_4px_10px_rgba(204,255,0,0.5)]" 
                />
              )}
              <Icon className={`w-5 h-5 transition-all duration-300 ${active ? 'text-neon-green scale-110 drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]' : 'text-white/30'}`} />
              <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${active ? 'text-white opacity-100' : 'text-white/20 opacity-0'} scale-95`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;