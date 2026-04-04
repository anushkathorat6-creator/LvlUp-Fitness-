import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Footprints, Flame, Droplets, Coins, Heart, Bell, Trophy, Sparkles, Plus, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useFitnessStore } from '@/stores/fitnessStore';
import AppLayout from '@/components/AppLayout';
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
    { key: 'steps', icon: Footprints, label: 'Steps', value: steps, color: 'from-blue-300 to-indigo-300' },
    { key: 'calories', icon: Flame, label: 'Calories', value: calories, color: 'from-orange-300 to-red-300' },
    { key: 'water', icon: Droplets, label: 'Water', value: `${(water / 1000).toFixed(1)}L`, color: 'from-cyan-300 to-blue-300' },
    { key: 'coins', icon: Coins, label: 'Coins', value: coins, color: 'from-yellow-300 to-amber-300' },
  ];

  const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  const hrVal = parseInt(heartRate);
  const hrColor = !heartRate ? 'text-muted-foreground' : hrVal < 60 ? 'text-blue-400' : hrVal > 100 ? 'text-red-400' : 'text-green-400';

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{greeting}, {user.fullName?.split(' ')[0] || 'User'}! 🌸</h1>
            <p className="text-sm text-muted-foreground">Let's crush your goals today</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowNotif(!showNotif)} className="relative w-10 h-10 rounded-full glass flex items-center justify-center">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-background" />
              </motion.button>
              <AnimatePresence>
                {showNotif && (
                  <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-72 glass-strong rounded-2xl p-3 shadow-2xl z-50">
                    <p className="text-xs font-semibold text-foreground mb-2 px-1">Notifications</p>
                    {notifications.map(n => (
                      <button key={n.id} onClick={() => { setShowNotif(false); toast(n.text); }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-colors">
                        <p className="text-sm text-foreground">{n.text}</p>
                        <p className="text-xs text-muted-foreground">{n.time}</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {initials}
            </motion.button>
          </div>
        </div>

        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 mb-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Level</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold font-display text-gradient">{currentLevel}</span>
                <Sparkles className="w-5 h-5 text-gold float-animation" />
              </div>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`} className="transition-all duration-700" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{Math.round(pct)}%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Day {currentDay} of 5</p>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full gradient-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Keep Going! 💪</p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((s, i) => (
            <motion.button key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setModal(s.key)} className="relative glass rounded-2xl p-4 text-left card-hover group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <FlyUpNumber value={flyUp?.val || ''} show={flyUp?.key === s.key} />
            </motion.button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Start Workout', path: '/workout', color: 'gradient-primary' },
            { label: 'Add Meal', path: '/diet', color: 'bg-secondary' },
            { label: 'Log Water', path: '/water', color: 'bg-accent' },
            { label: 'View Map', path: '/levels', color: 'gradient-gold' },
          ].map(a => (
            <motion.button key={a.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(a.path)}
              className={`${a.color} rounded-2xl py-3.5 text-sm font-semibold shadow-md ${a.color.includes('gradient') ? 'text-primary-foreground' : 'text-foreground'}`}>
              {a.label}
            </motion.button>
          ))}
        </div>

        {/* Daily Challenge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          whileHover={{ y: -2 }}
          className="glass rounded-2xl p-5 mb-6 cursor-pointer" onClick={() => navigate('/workout')}>
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-6 h-6 text-gold" />
            <h3 className="font-display text-lg font-bold text-foreground">Today's Challenge</h3>
            <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-600">Not Started</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Complete Day {currentDay} Workout to progress!</p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full gradient-primary rounded-full" style={{ width: '0%' }} />
          </div>
        </motion.div>

        {/* Heart Rate */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Heart className={`w-6 h-6 ${hrColor} ${heartRate ? 'animate-pulse' : ''}`} />
            <h3 className="font-semibold text-foreground">Heart Rate</h3>
          </div>
          {heartRate ? (
            <div className="flex items-end gap-2">
              <motion.p key={heartRate} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className={`text-3xl font-bold ${hrColor}`}>{heartRate}</motion.p>
              <span className="text-sm text-muted-foreground mb-1">BPM</span>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setModal('heart')}
                className="ml-auto text-xs text-primary font-medium px-3 py-1.5 rounded-full bg-primary/10">Update</motion.button>
            </div>
          ) : (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setModal('heart')}
              className="text-sm text-primary font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Log Heart Rate</motion.button>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.95, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="glass-strong rounded-t-3xl md:rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {modal === 'steps' && 'Add Steps'}{modal === 'calories' && 'Add Calories'}{modal === 'water' && 'Add Water'}{modal === 'coins' && 'Coin History'}{modal === 'heart' && 'Heart Rate'}
                </h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setModal(null)} className="p-1 rounded-full hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>
              {modal === 'coins' ? (
                <div className="text-center py-6">
                  <Sparkles className="w-12 h-12 text-gold mx-auto mb-3 float-animation" />
                  <p className="text-2xl font-bold text-foreground">{coins} coins</p>
                  <p className="text-sm text-muted-foreground mt-1">Complete workouts to earn more!</p>
                </div>
              ) : modal === 'water' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[250, 500, 1000].map(ml => (
                      <motion.button key={ml} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => quickWater(ml)} className="py-3 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm">
                        +{ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}
                      </motion.button>
                    ))}
                  </div>
                  <input value={inputVal} onChange={e => setInputVal(e.target.value)} type="number" placeholder="Custom amount (ml)"
                    className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm" />
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                    className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-semibold">Add</motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input value={inputVal} onChange={e => setInputVal(e.target.value)} type="number"
                    placeholder={modal === 'heart' ? 'Enter BPM' : `Enter ${modal}`}
                    className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm" />
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                    className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-semibold">Submit</motion.button>
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
