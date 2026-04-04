import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Sparkles } from 'lucide-react';

const Splash = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setProgress(p => Math.min(p + 2, 100)), 50);
    const timer = setTimeout(() => navigate('/login', { replace: true }), 2500);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [navigate]);

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center pulse-glow">
            <Dumbbell className="w-12 h-12 text-primary-foreground" />
          </div>
          <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-gold float-animation" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-shimmer mb-3">LevelFit AI</h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-muted-foreground text-lg">Level Up Your Life</motion.p>
      </motion.div>
      <div className="absolute bottom-16 w-64">
        <div className="h-1.5 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div className="h-full gradient-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default Splash;