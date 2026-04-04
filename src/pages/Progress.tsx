import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Footprints, Flame, Award, Dumbbell, Droplets, Lock, Trophy, X } from 'lucide-react';
import { useFitnessStore } from '@/stores/fitnessStore';
import { useAuthStore } from '@/stores/authStore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AppLayout from '@/components/AppLayout';
import toast from 'react-hot-toast';

const Progress = () => {
  const { steps, calories, water, coins, currentLevel, currentDay, completedLevels, totalWorkouts, weightLog, stepsLog, caloriesLog, waterLog, logWeight } = useFitnessStore();
  const user = useAuthStore(s => s.user);
  const [filter, setFilter] = useState<'week' | 'month' | 'all'>('week');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  const totalDays = ((currentLevel - 1) * 5) + currentDay;
  const overviewStats = [
    { icon: Dumbbell, label: 'Total Workouts', value: totalWorkouts },
    { icon: Flame, label: 'Days Streak', value: 0 },
    { icon: Award, label: 'Coins Earned', value: coins },
    { icon: TrendingUp, label: 'Levels Done', value: completedLevels.length },
  ];

  const achievements = [
    { label: 'First Workout', unlocked: totalWorkouts > 0 },
    { label: '7 Day Streak', unlocked: false },
    { label: '1L Water', unlocked: water >= 1000 },
    { label: 'Level 2 Unlocked', unlocked: currentLevel >= 2 },
    { label: '100 Coins', unlocked: coins >= 100 },
  ];

  const handleLogWeight = () => {
    const w = parseFloat(weightInput);
    if (!w || w <= 0) { toast.error('Enter valid weight'); return; }
    logWeight(w);
    toast.success('✨ Weight logged!');
    setWeightInput('');
    setShowWeightModal(false);
  };

  const EmptyChart = ({ text, cta }: { text: string; cta?: () => void }) => (
    <div className="h-32 flex flex-col items-center justify-center text-center">
      <p className="text-sm text-muted-foreground mb-2">{text}</p>
      {cta && <button onClick={cta} className="text-sm text-primary font-medium btn-interactive">Log Now</button>}
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-6 md:pt-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">My Progress</h1>
          <div className="flex bg-muted rounded-full p-0.5">
            {(['week', 'month', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? 'gradient-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Journey progress */}
        <div className="glass-strong rounded-3xl p-5 mb-6 text-center">
          <p className="text-sm text-muted-foreground">Journey Progress</p>
          <p className="text-3xl font-bold text-gradient mt-1">Day {totalDays} / 105</p>
          <div className="h-3 bg-muted rounded-full mt-4 overflow-hidden">
            <motion.div className="h-full gradient-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${((totalDays - 1) / 105) * 100}%` }} transition={{ duration: 1 }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {overviewStats.map(({ icon: Icon, label, value }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-4 text-center">
              <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Weight chart */}
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">Weight Progress</h3>
            <button onClick={() => setShowWeightModal(true)} className="text-xs text-primary font-medium btn-interactive">+ Log Weight</button>
          </div>
          {weightLog.length === 0 ? <EmptyChart text="Start logging weight to see your journey" cta={() => setShowWeightModal(true)} /> : (
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={weightLog}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} animationDuration={1000} /></LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Steps chart */}
        <div className="glass rounded-2xl p-5 mb-4">
          <h3 className="font-display font-semibold text-foreground mb-4">Steps Trend</h3>
          {stepsLog.length === 0 ? <EmptyChart text="No steps logged yet" /> : (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={stepsLog}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="steps" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} animationDuration={1000} /></BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Calories chart */}
        <div className="glass rounded-2xl p-5 mb-4">
          <h3 className="font-display font-semibold text-foreground mb-4">Calories Burned</h3>
          {caloriesLog.length === 0 ? <EmptyChart text="Complete workouts to track calories" /> : (
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={caloriesLog}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Area type="monotone" dataKey="cal" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} animationDuration={1000} /></AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Workout completion radial */}
        <div className="glass rounded-2xl p-5 mb-4 text-center">
          <h3 className="font-display font-semibold text-foreground mb-4">Workout Completion</h3>
          <div className="w-28 h-28 mx-auto relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 50}`} strokeDashoffset={`${2 * Math.PI * 50 * (1 - totalWorkouts / 105)}`} className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-foreground">{totalWorkouts}</span>
              <span className="text-[10px] text-muted-foreground">/ 105</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-gold" />
            <h3 className="font-display font-semibold text-foreground">Achievements</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {achievements.map(a => (
              <div key={a.label} className={`rounded-2xl p-3 text-center transition-all ${a.unlocked ? 'glass-strong' : 'bg-muted/50 opacity-50'}`}>
                <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${a.unlocked ? 'gradient-gold' : 'bg-muted'}`}>
                  {a.unlocked ? <Trophy className="w-5 h-5 text-primary-foreground" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <p className="text-[10px] font-medium text-foreground">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weight modal */}
      <AnimatePresence>
        {showWeightModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowWeightModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} className="glass-strong rounded-3xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold">Log Weight</h3>
                <button onClick={() => setShowWeightModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <input value={weightInput} onChange={e => setWeightInput(e.target.value)} type="number" placeholder="Weight (kg)" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm mb-3" />
              <button onClick={handleLogWeight} className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-semibold btn-interactive">Log Weight</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Progress;