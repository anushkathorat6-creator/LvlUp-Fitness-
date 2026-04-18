import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Zap } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-4 py-3 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Logo */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl glass-strong"
        >
          <div className="w-8 h-8 rounded-lg bg-neon-green flex items-center justify-center neon-glow-green">
            <Zap className="w-5 h-5 text-black fill-current" />
          </div>
          <span className="text-xl font-display font-black tracking-tighter text-white">
            LVL<span className="text-neon-green">UP</span>
          </span>
        </motion.button>

        {/* Profile */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/profile')}
          className="w-12 h-12 rounded-2xl glass-strong flex items-center justify-center group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/20 to-neon-blue/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <User className="w-6 h-6 text-white relative z-10" />
        </motion.button>
      </div>
    </nav>
  );
};

export default Navbar;
