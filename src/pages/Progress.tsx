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
    { icon: Dumbbell, label: 'TOTAL SESSIONS', value: totalWorkouts, color: 'text-neon-green' },
    { icon: Award, label: 'GAINZ (COINS)', value: coins, color: 'text-neon-blue' },
    { icon: TrendingUp, label: 'LVLS SMASHED', value: completedLevels.length, color: 'text-neon-green' },
  ];

  const achievements = [
    { label: 'First Blood', unlocked: totalWorkouts > 0 },
    { label: '7 Day Elite', unlocked: false },
    { label: 'Hydration God', unlocked: water >= 1000 },
    { label: 'Lvl 2 Chad', unlocked: currentLevel >= 2 },
    { label: 'Crypto Whale', unlocked: coins >= 100 },
  ];

  const handleLogWeight = () => {
    const w = parseFloat(weightInput);
    if (!w || w <= 0) { toast.error('Enter valid weight'); return; }
    logWeight(w);
    toast.success('⚖️ Weight logged!');
    setWeightInput('');
    setShowWeightModal(false);
  };

  const EmptyChart = ({ text, cta }: { text: string; cta?: () => void }) => (
    <div className="h-40 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-[2rem]">
      <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">{text}</p>
      {cta && (
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={cta} 
          className="text-[10px] font-black text-neon-green border border-neon-green/30 px-4 py-2 rounded-xl uppercase tracking-widest"
        >
          LOG NOW
        </motion.button>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-10 pb-28">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tighter text-white uppercase italic underline decoration-neon-green decoration-4 underline-offset-[12px]">MY GAINZ</h1>
            <p className="text-xs font-bold text-white/30 uppercase tracking-[0.3em] mt-6">JOURNEY TRACKER</p>
          </div>
          <div className="flex bg-white/5 rounded-2xl p-1 self-start md:self-center border border-white/5">
            {(['week', 'month', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${filter === f ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'text-white/40'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Global Journey progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="glass-neon-green rounded-[2.5rem] p-8 mb-8 relative overflow-hidden group border-none">
          <div className="absolute top-0 right-0 w-48 h-48 bg-neon-green/5 blur-[100px] -mr-24 -mt-24 pointer-events-none" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <p className="text-[10px] font-black text-neon-green uppercase tracking-[0.3em]">Campaign Progress</p>
            <p className="text-2xl font-display font-black text-white tracking-tighter uppercase">{totalDays} / 105 <span className="text-xs font-bold text-white/30 uppercase ml-1 tracking-widest">DAYS</span></p>
          </div>
          <div className="h-4 bg-black/40 rounded-full mt-4 overflow-hidden p-1 border border-white/5 relative z-10">
            <motion.div className="h-full bg-neon-green rounded-full shadow-[0_0_15px_rgba(204,255,0,0.4)]" initial={{ width: 0 }} animate={{ width: `${((totalDays - 1) / 105) * 100}%` }} transition={{ duration: 1.5, ease: "easeOut" }} />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {overviewStats.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} 
              className="glass-strong rounded-[2rem] p-6 text-left border-white/5 group hover:border-white/10 transition-all">
              <Icon className={`w-8 h-8 ${color} mb-4 group-hover:scale-110 transition-transform`} />
              <p className="text-sm font-bold text-white/30 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-3xl font-display font-black text-white tracking-tighter uppercase">{value}</p>
            </motion.div>
          ))}
        </div>

        {/* Weight chart */}
        <div className="glass-strong rounded-[2.5rem] p-8 mb-8 border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">Gravity Scale</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">WEIGHT MONITOR</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowWeightModal(true)} 
              className="px-6 py-2 rounded-xl bg-neon-green text-black font-black uppercase tracking-widest text-[10px] shadow-lg shadow-neon-green/20">
              LOG NEW
            </motion.button>
          </div>
          {weightLog.length === 0 ? <EmptyChart text="NO DATA ON GRAVITY YET" cta={() => setShowWeightModal(true)} /> : (
            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightLog}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0B', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}
                    itemStyle={{ color: '#CCFF00', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#CCFF00" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Steps chart */}
        <div className="glass-strong rounded-[2.5rem] p-8 mb-8 border-white/5">
          <div className="mb-8">
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">Energy Output</h3>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">ACTIVITY LOG</p>
          </div>
          {stepsLog.length === 0 ? <EmptyChart text="REMAINING STATIC. LOG SOME STEPS." /> : (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stepsLog}>
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                    contentStyle={{ backgroundColor: '#0A0A0B', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}
                  />
                  <Bar dataKey="steps" fill="#00F0FF" radius={[8, 8, 8, 8]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Workout completion radial */}
        <div className="glass-neon-blue rounded-[2.5rem] p-8 mb-8 border-none text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-neon-blue/5 blur-[60px] -ml-16 -mt-16 pointer-events-none" />
          <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter mb-8">Campaign Completion</h3>
          <div className="w-48 h-48 mx-auto relative group-hover:scale-105 transition-transform duration-500">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#00F0FF" strokeWidth="8" strokeLinecap="round" 
                strokeDasharray={`${2 * Math.PI * 50}`} strokeDashoffset={`${2 * Math.PI * 50 * (1 - totalWorkouts / 105)}`} 
                className="transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(0,240,255,0.5)]" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-display font-black text-white tracking-tighter uppercase">{totalWorkouts}</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">/ 105</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-strong rounded-[2.5rem] p-8 mb-8 border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center border border-neon-green/20">
              <Trophy className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">Hall of Fame</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">ACHIEVEMENTS</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map(a => (
              <div key={a.label} className={`rounded-[2rem] p-5 text-left transition-all border ${a.unlocked ? 'bg-white/5 border-white/10' : 'bg-white/2 opacity-30 border-white/5 grayscale'}`}>
                <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${a.unlocked ? 'bg-neon-green/10 border border-neon-green/30' : 'bg-white/5 border border-white/5'}`}>
                  {a.unlocked ? <Trophy className="w-6 h-6 text-neon-green" /> : <Lock className="w-5 h-5 text-white/20" />}
                </div>
                <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weight modal */}
      <AnimatePresence>
        {showWeightModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4" onClick={() => setShowWeightModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} 
              className="glass-strong rounded-[2.5rem] p-10 w-full max-w-sm border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Gravity Check</h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowWeightModal(false)}><X className="w-6 h-6 text-white/30" /></motion.button>
              </div>
              <div className="relative mb-8">
                <input value={weightInput} onChange={e => setWeightInput(e.target.value)} type="number" placeholder="KG" 
                  className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-neon-green outline-none text-2xl font-display font-black text-white placeholder:text-white/10" />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-white/20 uppercase tracking-widest">KG</span>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleLogWeight} 
                className="w-full py-5 rounded-[1.5rem] bg-neon-green text-black font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(204,255,0,0.3)]"
              >
                LOG WEIGHT
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};


export default Progress;