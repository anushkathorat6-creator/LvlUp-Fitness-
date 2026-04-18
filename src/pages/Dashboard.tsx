import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Footprints, Flame, Droplets, Coins, Heart, Bell, Trophy, Sparkles, Plus, X, Bot, Layers } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useFitnessStore } from '@/stores/fitnessStore';
import AppLayout from '@/components/AppLayout';
import StepTracker from '@/components/StepTracker';
import toast from 'react-hot-toast';

const FlyUpNumber = ({ value, show }: { value: string; show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.span
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 0, y: -30 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute -top-2 right-2 text-sm font-bold text-primary pointer-events-none"
      >
        +{value}
      </motion.span>
    )}
  </AnimatePresence>
);

const notifications = [
  { id: 1, text: '🏋️ Time for your daily workout!', time: '2m ago' },
  { id: 2, text: '💧 Don\'t forget to log your water intake', time: '1h ago' },
  { id: 3, text: '🌟 You\'re on a roll! Keep it up!', time: '3h ago' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { steps, calories, water, coins, heartRate, currentLevel, currentDay, setHeartRate, addSteps, addCalories, addWater } = useFitnessStore();
  const [modal, setModal] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [flyUp, setFlyUp] = useState<{ key: string; val: string } | null>(null);

  useEffect(() => {
    if (flyUp) {
      const t = setTimeout(() => setFlyUp(null), 900);
      return () => clearTimeout(t);
    }
  }, [flyUp]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const pct = ((currentDay - 1) / 5) * 100;

  const handleSubmit = () => {
    const val = parseInt(inputVal);
    if (!val || val <= 0) { toast.error('Enter a valid number'); return; }
    if (modal === 'steps') { addSteps(val); toast.success(`👟 +${val} steps logged!`); setFlyUp({ key: 'steps', val: String(val) }); }
    if (modal === 'calories') { addCalories(val); toast.success(`🔥 +${val} calories logged!`); setFlyUp({ key: 'calories', val: String(val) }); }
    if (modal === 'water') { addWater(val); toast.success('💧 Water logged!'); setFlyUp({ key: 'water', val: `${val}ml` }); }
    if (modal === 'heart') { setHeartRate(inputVal); toast.success('❤️ Heart rate updated!'); }
    setInputVal('');
    setModal(null);
  };

  const quickWater = (ml: number) => { addWater(ml); toast.success('💧 Water logged!'); setFlyUp({ key: 'water', val: `${ml}ml` }); setModal(null); };

  const stats = [
    { key: 'water', icon: Droplets, label: 'Water', value: `${(water / 1000).toFixed(1)}L`, color: 'from-cyan-300 to-blue-300' },
    { key: 'coins', icon: Coins, label: 'Coins', value: coins, color: 'from-yellow-300 to-amber-300' },
  ];

  const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  const hrVal = parseInt(heartRate);
  const hrColor = !heartRate ? 'text-muted-foreground' : hrVal < 60 ? 'text-blue-400' : hrVal > 100 ? 'text-red-400' : 'text-green-400';

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-10 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-display font-black tracking-tighter text-white uppercase">
              {greeting}, {user.fullName?.split(' ')[0] || 'CRUSHER'}
            </h1>
            <p className="text-sm text-neon-blue font-medium tracking-wide">READY TO LEVEL UP TODAY?</p>
          </motion.div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowNotif(!showNotif)} 
                className="relative w-12 h-12 rounded-2xl glass-strong flex items-center justify-center border-white/5">
                <Bell className="w-5 h-5 text-white/70" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-green neon-glow-green" />
              </motion.button>
              <AnimatePresence>
                {showNotif && (
                  <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-14 w-72 glass-strong rounded-3xl p-4 shadow-2xl z-50 border-white/10">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 px-1">Alerts</p>
                    {notifications.map(n => (
                      <button key={n.id} onClick={() => { setShowNotif(false); toast(n.text); }}
                        className="w-full text-left px-3 py-3 rounded-2xl hover:bg-white/5 transition-colors mb-1">
                        <p className="text-sm text-white font-medium">{n.text}</p>
                        <p className="text-[10px] text-white/30 uppercase mt-1">{n.time}</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="glass-neon-green rounded-[2.5rem] p-8 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 blur-[80px] -mr-16 -mt-16" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <p className="text-xs font-bold text-neon-green uppercase tracking-[0.2em] mb-1">Current Status</p>
              <div className="flex items-center gap-3">
                <span className="text-5xl font-display font-black text-white tracking-tighter">LVL {currentLevel}</span>
                <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 border-white/20">
                  <Sparkles className="w-4 h-4 text-neon-green" />
                </div>
              </div>
            </div>
            <div className="w-20 h-20 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#CCFF00" strokeWidth="6" strokeLinecap="round" 
                  strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`} 
                  className="transition-all duration-1000 ease-out" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">{Math.round(pct)}%</span>
            </div>
          </div>
          <div className="flex justify-between items-end relative z-10">
            <div>
              <p className="text-sm text-white/60 font-medium">Day <span className="text-white font-bold">{currentDay}</span> of 5</p>
            </div>
            <p className="text-xs font-bold text-neon-green uppercase animate-pulse">KEEP PUSHING</p>
          </div>
          <div className="mt-4 h-3 bg-white/5 rounded-full overflow-hidden relative z-10">
            <motion.div className="h-full bg-neon-green shadow-[0_0_15px_rgba(204,255,0,0.5)]" 
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, ease: "easeOut" }} />
          </div>
        </motion.div>

        {/* Step Tracker (New Detailed Component) */}
        <StepTracker />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.button key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setModal(s.key)} 
              className={`relative glass-strong rounded-[2rem] p-6 text-left border-white/5 hover:border-white/20 transition-all group overflow-hidden`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[40px] -mr-12 -mt-12 group-hover:bg-white/10 transition-colors" />
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform`}>
                <s.icon className={`w-6 h-6 ${s.key === 'steps' ? 'text-neon-blue' : s.key === 'calories' ? 'text-orange-500' : s.key === 'water' ? 'text-neon-blue' : 'text-gold'}`} />
              </div>
              <p className="text-3xl font-display font-black text-white tracking-tighter mb-1 uppercase">{s.value}</p>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{s.label}</p>
              <FlyUpNumber value={flyUp?.val || ''} show={flyUp?.key === s.key} />
            </motion.button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'WORKOUT', path: '/workout', style: 'bg-neon-green text-black', icon: Flame },
            { label: 'MEALS', path: '/diet', style: 'glass-strong text-white', icon: Sparkles },
            { label: 'HYDRATE', path: '/water', style: 'glass-strong text-white', icon: Droplets },
            { label: 'LEVELS', path: '/levels', style: 'bg-neon-blue text-black', icon: Layers },
          ].map(a => (
            <motion.button key={a.label} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(a.path)}
              className={`${a.style} rounded-3xl py-5 px-6 font-black text-sm tracking-widest flex items-center justify-center gap-3 shadow-lg uppercase`}>
              <a.icon className="w-5 h-5" />
              {a.label}
            </motion.button>
          ))}
        </div>

        {/* Daily Challenge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          whileHover={{ y: -4 }}
          className="glass-neon-blue rounded-[2rem] p-6 mb-8 cursor-pointer relative overflow-hidden group" onClick={() => navigate('/workout')}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 blur-[60px] -mr-16 -mt-16" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-neon-blue/20 flex items-center justify-center border border-neon-blue/30">
              <Trophy className="w-6 h-6 text-neon-blue" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter">DAILY MISSION</h3>
              <p className="text-xs text-neon-blue font-bold uppercase tracking-widest">NOT COMPLETED</p>
            </div>
          </div>
          <p className="text-sm text-white/70 font-medium mb-4 relative z-10">Finish your Day {currentDay} session to unlock the next level.</p>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden relative z-10">
            <div className="h-full bg-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all duration-1000" style={{ width: '0%' }} />
          </div>
        </motion.div>

        {/* Heart Rate */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} 
          className="glass-strong rounded-[2rem] p-6 mb-8 border-white/5 overflow-hidden group">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20`}>
              <Heart className={`w-6 h-6 text-red-500 ${heartRate ? 'animate-pulse' : ''}`} />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">VITAL SIGNS</h3>
          </div>
          {heartRate ? (
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-2">
                <motion.p key={heartRate} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-display font-black text-white tracking-tighter uppercase">{heartRate}</motion.p>
                <span className="text-sm font-bold text-white/30 tracking-widest">BPM</span>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setModal('heart')}
                className="text-xs font-black text-black bg-white px-6 py-3 rounded-2xl uppercase tracking-widest">Update</motion.button>
            </div>
          ) : (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setModal('heart')}
              className="w-full py-4 rounded-2xl border border-dashed border-white/20 text-white/40 font-bold text-sm flex items-center justify-center gap-2 hover:border-white/40 hover:text-white transition-all uppercase tracking-widest">
              <Plus className="w-5 h-5" /> LOG VITAL SIGNS
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.95, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="glass-strong rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                  {modal === 'steps' && 'ADD STEPS'}
                  {modal === 'calories' && 'LOG BURN'}
                  {modal === 'water' && 'HYDRATE'}
                  {modal === 'coins' && 'LOOT'}
                  {modal === 'heart' && 'VITALS'}
                </h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setModal(null)} 
                  className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-white/50" />
                </motion.button>
              </div>
              {modal === 'coins' ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-neon-green/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-neon-green/30">
                    <Sparkles className="w-10 h-10 text-neon-green float-animation" />
                  </div>
                  <p className="text-5xl font-display font-black text-white tracking-tighter mb-2 uppercase">{coins}</p>
                  <p className="text-xs font-bold text-white/40 tracking-widest uppercase">AVAILABLE COINS</p>
                </div>
              ) : modal === 'water' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    {[250, 500, 1000].map(ml => (
                      <motion.button key={ml} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => quickWater(ml)} 
                        className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs hover:border-neon-blue hover:text-neon-blue transition-all uppercase tracking-widest">
                        +{ml >= 1000 ? `${ml / 1000}L` : `${ml}ML`}
                      </motion.button>
                    ))}
                  </div>
                  <div className="relative">
                    <input value={inputVal} onChange={e => setInputVal(e.target.value)} type="number" placeholder="CUSTOM ML"
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-neon-blue outline-none text-white font-bold placeholder:text-white/20" />
                  </div>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                    className="w-full py-5 rounded-2xl bg-neon-blue text-black font-black uppercase tracking-[0.2em] shadow-lg shadow-neon-blue/20">LOG HYDRATION</motion.button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <input value={inputVal} onChange={e => setInputVal(e.target.value)} type="number"
                      placeholder={modal === 'heart' ? 'BPM' : `AMOUNT`}
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-neon-green outline-none text-white font-bold placeholder:text-white/20" />
                  </div>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                    className="w-full py-5 rounded-2xl bg-neon-green text-black font-black uppercase tracking-[0.2em] shadow-lg shadow-neon-green/20">CONFIRM LOG</motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Dashboard;
