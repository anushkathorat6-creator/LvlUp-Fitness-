import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit3, Palette, LogOut, Award, Coins, Target, RotateCcw, X, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useFitnessStore } from '@/stores/fitnessStore';
import { useDietStore } from '@/stores/dietStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import AppLayout from '@/components/AppLayout';
import toast from 'react-hot-toast';

const avatarColors = [
  { label: 'Pink', value: 'bg-gradient-to-br from-pink-400 to-rose-400' },
  { label: 'Blue', value: 'bg-gradient-to-br from-blue-400 to-indigo-400' },
  { label: 'Green', value: 'bg-gradient-to-br from-emerald-400 to-teal-400' },
  { label: 'Purple', value: 'bg-gradient-to-br from-purple-400 to-violet-400' },
  { label: 'Gold', value: 'bg-gradient-to-br from-amber-400 to-yellow-400' },
  { label: 'Orange', value: 'bg-gradient-to-br from-orange-400 to-red-400' },
];

const themeSwatches = [
  { label: 'Pink', theme: 'theme-female', color: 'bg-pink-400' },
  { label: 'Blue', theme: 'theme-male', color: 'bg-blue-400' },
  { label: 'Green', theme: 'theme-other', color: 'bg-emerald-400' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, setTheme, theme, notifications, setNotifications, units, setUnits, logout, memberSince } = useAuthStore();
  const fitness = useFitnessStore();
  const dietStore = useDietStore();
  const workoutStore = useWorkoutStore();

  const [avatarColor, setAvatarColor] = useState(avatarColors[0].value);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: user.fullName,
    age: user.age,
    city: user.city,
    height: user.height,
    weight: user.weight,
    targetWeight: user.targetWeight,
  });

  const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const isMetric = units === 'metric';
  const displayHeight = isMetric ? user.height : user.height ? String(Math.round(parseFloat(user.height) / 2.54)) : '';
  const displayWeight = isMetric ? user.weight : user.weight ? String(Math.round(parseFloat(user.weight) * 2.205)) : '';
  const displayTarget = isMetric ? user.targetWeight : user.targetWeight ? String(Math.round(parseFloat(user.targetWeight) * 2.205)) : '';
  const heightUnit = isMetric ? 'cm' : 'in';
  const weightUnit = isMetric ? 'kg' : 'lb';

  const handleSaveProfile = () => {
    updateProfile(editForm);
    toast.success('🛡️ Profile secured!');
    setShowEditModal(false);
  };

  const handleResetProgress = () => {
    fitness.resetProgress();
    dietStore.resetDiet();
    workoutStore.reset();
    toast.success('SYSTEM RESET');
    setShowResetModal(false);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('levelfit-fitness');
    localStorage.removeItem('levelfit-diet');
    localStorage.removeItem('levelfit-auth');
    navigate('/login');
    toast.success('Logged out');
  };

  const handleUnitsToggle = () => {
    setUnits(isMetric ? 'imperial' : 'metric');
    toast.success(`Units: ${isMetric ? 'imperial' : 'metric'}`);
  };

  const Modal = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-xl p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 40, opacity: 0 }}
            onClick={e => e.stopPropagation()} className="glass-strong rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border-white/10">
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-10 pb-28">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-neon-green rounded-[3rem] p-10 mb-8 relative overflow-hidden text-center border-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

          <div className="flex flex-col items-center relative z-10">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className={`w-28 h-28 rounded-[2.5rem] bg-black/40 flex items-center justify-center mb-6 shadow-2xl border-2 border-neon-green shadow-neon-green/20`}>
              <span className="text-4xl font-display font-black text-white italic">{initials}</span>
            </motion.button>
            <AnimatePresence>
              {showAvatarPicker && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="flex gap-2 mb-6 glass rounded-2xl px-4 py-3 border-white/10">
                  {avatarColors.map(c => (
                    <button key={c.label} onClick={() => { setAvatarColor(c.value); setShowAvatarPicker(false); toast.success(`Avatar updated`); }}
                      className={`w-10 h-10 rounded-xl ${c.value} ring-2 ${avatarColor === c.value ? 'ring-neon-green' : 'ring-transparent'} transition-all hover:scale-110`} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter mb-1 underline decoration-neon-green decoration-4 underline-offset-8 decoration-dashed">
              {(user.fullName || 'CRUSHER').toUpperCase()}
            </h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-6">ELITE MEMBER</p>
            {memberSince && <p className="text-[9px] font-black text-neon-green/50 uppercase tracking-[0.2em] mt-2">EST. {new Date(memberSince).getFullYear()}</p>}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowEditModal(true)}
              className="mt-8 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 backdrop-blur-xl">
              <Edit3 className="w-4 h-4 text-neon-green" /> EDIT PROTOCOL
            </motion.button>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Main Stats */}
          <div className="glass-strong rounded-[2.5rem] p-8 grid grid-cols-3 gap-6 border-white/5">
            {[
              { icon: Award, label: 'LEVEL', value: fitness.currentLevel, color: 'text-neon-green' },
              { icon: Coins, label: 'COINS', value: fitness.coins, color: 'text-neon-blue' },
              { icon: Target, label: 'SESSIONS', value: fitness.totalWorkouts, color: 'text-neon-green' },
            ].map(s => (
              <div key={s.label} className="text-center group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 border border-white/10 group-hover:scale-110 transition-transform">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-display font-black text-white tracking-tighter uppercase">{s.value}</p>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Vitals & Specs */}
          <div className="glass rounded-[2.5rem] p-8 space-y-4 border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-4 h-4 text-neon-blue" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">USER SPECIFICATIONS</h3>
            </div>
            {[
              ['Age', user.age ? `${user.age} YRS` : ''],
              ['City', user.city?.toUpperCase()],
              ['Height', displayHeight ? `${displayHeight} ${heightUnit.toUpperCase()}` : ''],
              ['Weight', displayWeight ? `${displayWeight} ${weightUnit.toUpperCase()}` : ''],
              ['Goal', user.fitnessGoal?.toUpperCase()],
              ['Experience', user.experienceLevel?.toUpperCase()],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0 growable">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</span>
                <span className="text-[11px] font-black text-white uppercase tracking-widest">{value || '---'}</span>
              </div>
            ))}
          </div>

          {/* Settings Section */}
          <div className="glass rounded-[2.5rem] p-8 space-y-6 border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Palette className="w-4 h-4 text-neon-green" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">PREFERENCES</h3>
            </div>
            <div className="flex items-center justify-between group">
              <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">TRANSMISSIONS</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setNotifications(!notifications); toast.success(notifications ? 'OFFLINE' : 'LIVE'); }}
                className={`w-14 h-7 rounded-full transition-all relative border border-white/10 ${notifications ? 'bg-neon-green' : 'bg-white/5'}`}>
                <motion.div layout className={`w-5 h-5 rounded-full bg-black shadow-md absolute top-0.5 ${notifications ? 'right-0.5' : 'left-0.5'}`} />
              </motion.button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">GRAVITY UNITS ({isMetric ? 'KG/CM' : 'LB/IN'})</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleUnitsToggle}
                className={`w-14 h-7 rounded-full transition-all relative border border-white/10 ${!isMetric ? 'bg-neon-blue' : 'bg-white/5'}`}>
                <motion.div layout className={`w-5 h-5 rounded-full bg-black shadow-md absolute top-0.5 ${!isMetric ? 'right-0.5' : 'left-0.5'}`} />
              </motion.button>
            </div>
          </div>

          {/* Terminal Controls */}
          <div className="space-y-4 pt-4">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowResetModal(true)}
              className="w-full glass rounded-[2rem] px-8 py-5 flex items-center justify-between border-white/5 group hover:bg-orange-500/10 transition-all">
              <div className="flex items-center gap-4">
                <RotateCcw className="w-5 h-5 text-orange-500 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-xs font-black text-white/80 uppercase tracking-widest">NUCLEAR RESET</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowLogoutModal(true)}
              className="w-full glass rounded-[2rem] px-8 py-5 flex items-center justify-between border-white/5 group hover:bg-red-500/10 transition-all">
              <div className="flex items-center gap-4">
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="text-xs font-black text-white/80 uppercase tracking-widest">DISCONNECT SESSION</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter italic">UPDATE SPECS</h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEditModal(false)}><X className="w-6 h-6 text-white/30" /></motion.button>
        </div>
        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {([
            ['fullName', 'IDENTITY', 'text'],
            ['age', 'AGE (YRS)', 'number'],
            ['city', 'CITY CODE', 'text'],
            ['height', `ALTITUDE (${heightUnit.toUpperCase()})`, 'number'],
            ['weight', `GRAVITY (${weightUnit.toUpperCase()})`, 'number'],
            ['targetWeight', `TARGET GRAVITY (${weightUnit.toUpperCase()})`, 'number'],
          ] as const).map(([key, label, type]) => (
            <div key={key}>
              <label className="text-[10px] font-black text-white/30 mb-2 block tracking-widest uppercase">{label}</label>
              <input type={type} value={(editForm as any)[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-neon-green focus:ring-4 focus:ring-neon-green/10 outline-none text-sm font-black text-white tracking-widest placeholder:text-white/20 transition-all" />
            </div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveProfile}
          className="w-full mt-10 py-5 rounded-[1.5rem] bg-neon-green text-black font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(204,255,0,0.3)]">
          SAVE CHANGES
        </motion.button>
      </Modal>

      {/* Reset Progress Modal */}
      <Modal open={showResetModal} onClose={() => setShowResetModal(false)}>
        <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter mb-4 italic text-orange-500">INITIATE WIPE?</h3>
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-loose mb-10">All fitness, diet, and training data will be permanently purged from the system. This action is terminal.</p>
        <div className="flex gap-4">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowResetModal(false)}
            className="flex-1 py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-[10px]">ABORT</motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleResetProgress}
            className="flex-1 py-4 rounded-2xl bg-orange-500 text-black font-black uppercase tracking-widest text-[10px]">WIPE ALL</motion.button>
        </div>
      </Modal>

      {/* Logout Modal */}
      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter mb-4 italic text-red-500">TERMINATE SESSION?</h3>
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-loose mb-10">You will be disconnected from the LVLUP network until you re-authenticate.</p>
        <div className="flex gap-4">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowLogoutModal(false)}
            className="flex-1 py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-[10px]">ABORT</motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleLogout}
            className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-[10px]">LOGOUT</motion.button>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default Profile;
