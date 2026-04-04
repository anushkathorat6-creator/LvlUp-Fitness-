import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Footprints, UtensilsCrossed, Droplets, ArrowLeft, CheckCircle2, Circle, X } from 'lucide-react';
import { useFitnessStore } from '@/stores/fitnessStore';
import AppLayout from '@/components/AppLayout';

const LevelDetails = () => {
  const { id } = useParams();
  const levelNum = parseInt(id || '1');
  const navigate = useNavigate();
  const { currentLevel, currentDay } = useFitnessStore();

  const days = Array.from({ length: 5 }, (_, i) => ({
    day: i + 1,
    completed: levelNum < currentLevel || (levelNum === currentLevel && i + 1 < currentDay),
    current: levelNum === currentLevel && i + 1 === currentDay,
    locked: levelNum > currentLevel || (levelNum === currentLevel && i + 1 > currentDay),
  }));

  const tasks = [
    { icon: Dumbbell, label: 'Workout' },
    { icon: Footprints, label: 'Steps' },
    { icon: UtensilsCrossed, label: 'Diet' },
    { icon: Droplets, label: 'Water' },
  ];

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 md:px-8 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/levels')} className="w-10 h-10 rounded-full glass flex items-center justify-center btn-interactive">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Level {levelNum}</h1>
            <p className="text-sm text-muted-foreground">5 days to complete</p>
          </div>
        </div>

        <div className="space-y-4">
          {days.map((d, i) => (
            <motion.div key={d.day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => d.current && navigate('/workout')}
              className={`glass rounded-2xl p-5 card-hover transition-all ${d.current ? 'ring-2 ring-primary shadow-xl cursor-pointer' : ''} ${d.locked ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground font-display">Day {d.day}</h3>
                {d.completed ? <span className="text-xs font-semibold text-secondary-foreground bg-secondary px-3 py-1 rounded-full">Completed</span> :
                 d.current ? <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">In Progress</span> :
                 <span className="text-xs text-muted-foreground">Locked</span>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tasks.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50">
                    {d.completed ? <CheckCircle2 className="w-4 h-4 text-secondary" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full gradient-primary rounded-full transition-all" style={{ width: d.completed ? '100%' : '0%' }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default LevelDetails;