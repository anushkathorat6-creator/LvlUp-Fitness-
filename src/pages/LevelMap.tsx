import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Star, Sparkles, Crown } from 'lucide-react';
import { useFitnessStore } from '@/stores/fitnessStore';
import AppLayout from '@/components/AppLayout';
import toast from 'react-hot-toast';

const LevelMap = () => {
  const { currentLevel, completedLevels } = useFitnessStore();
  const navigate = useNavigate();

  const levels = Array.from({ length: 21 }, (_, i) => ({
    num: i + 1,
    unlocked: i + 1 <= currentLevel,
    completed: completedLevels.includes(i + 1),
    current: i + 1 === currentLevel,
    milestone: [7, 14, 21].includes(i + 1),
  }));

  const handleClick = (lvl: typeof levels[0]) => {
    if (lvl.unlocked) navigate(`/level/${lvl.num}`);
    else { toast('🔒 Complete previous levels to unlock!'); }
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 md:px-8 pt-6 md:pt-10">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Your Journey</h1>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-medium px-3 py-1 rounded-full glass">Level {currentLevel} / 21</span>
            <span className="text-sm text-muted-foreground px-3 py-1 rounded-full glass">105 Days Total</span>
          </div>
        </div>

        <div className="relative flex flex-col items-center pb-8">
          {/* SVG Path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <motion.path
              d={`M 50% 95% Q 20% 80%, 50% 70% Q 80% 60%, 50% 50% Q 20% 40%, 50% 30% Q 80% 20%, 50% 10%`}
              fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeOpacity="0.2" strokeDasharray="8 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />
          </svg>

          {[...levels].reverse().map((lvl, idx) => {
            const isLeft = idx % 2 === 0;
            const size = lvl.milestone ? 'w-20 h-20' : 'w-16 h-16';
            return (
              <motion.div key={lvl.num} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                className={`relative flex items-center w-full mb-4 ${isLeft ? 'justify-start pl-[10%]' : 'justify-end pr-[10%]'}`}>
                <div className="absolute left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary/20 rounded-full" />
                <motion.button whileHover={lvl.unlocked ? { scale: 1.1 } : {}} whileTap={lvl.unlocked ? { scale: 0.95 } : {}}
                  onClick={() => handleClick(lvl)}
                  className={`relative z-10 ${size} rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                    lvl.current ? 'gradient-primary border-primary shadow-2xl pulse-glow' :
                    lvl.completed ? 'bg-secondary border-secondary shadow-md' :
                    lvl.unlocked ? 'glass border-primary/30' :
                    'bg-muted border-border opacity-50'
                  }`}>
                  {lvl.completed ? <Star className="w-6 h-6 text-gold fill-current" /> :
                   lvl.unlocked ? <span className={`text-lg font-bold ${lvl.current ? 'text-primary-foreground' : 'text-foreground'}`}>{lvl.num}</span> :
                   <Lock className="w-5 h-5 text-muted-foreground" />}
                  {lvl.current && <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-gold float-animation" />}
                  {lvl.milestone && lvl.unlocked && <Crown className="absolute -top-3 w-5 h-5 text-gold" />}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Floating stars */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="fixed pointer-events-none float-animation" style={{ top: `${20 + i * 15}%`, left: `${10 + i * 18}%`, animationDelay: `${i * 0.5}s`, opacity: 0.15 }}>
            <Star className="w-4 h-4 text-gold" />
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default LevelMap;