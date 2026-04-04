import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit3, Palette, LogOut, Award, Coins, Target, RotateCcw, X } from 'lucide-react';
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
    toast.success('✨ Profile updated!');
    setShowEditModal(false);
  };

  const handleResetProgress = () => {
    fitness.resetProgress();
    dietStore.resetDiet();
    workoutStore.reset();
    toast.success('Progress reset');
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

  const handleThemeChange = (t: string) => {
    setTheme(t);
    toast.success('🎨 Theme updated!');
  };

  const handleUnitsToggle = () => {
    setUnits(isMetric ? 'imperial' : 'metric');
    toast.success(`Units switched to ${isMetric ? 'imperial' : 'metric'}`);
  };

  const Modal = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 40, opacity: 0 }}
            onClick={e => e.stopPropagation()} className="glass-strong rounded-t-3xl md:rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto pb-28">
        {/* Header */}
        <div className="gradient-primary px-6 pt-12 pb-10 rounded-b-3xl">
          <div className="flex flex-col items-center">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className={`w-20 h-20 rounded-full ${avatarColor} flex items-center justify-center mb-3 shadow-lg ring-4 ring-white/30`}>
              <span className="text-2xl font-bold text-white">{initials}</span>
            </motion.button>
            <AnimatePresence>
              {showAvatarPicker && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="flex gap-2 mt-2 glass rounded-full px-3 py-2">
                  {avatarColors.map(c => (
                    <button key={c.label} onClick={() => { setAvatarColor(c.value); setShowAvatarPicker(false); toast.success(`Avatar color: ${c.label}`); }}
                      className={`w-8 h-8 rounded-full ${c.value} ring-2 ${avatarColor === c.value ? 'ring-white' : 'ring-transparent'} transition-all hover:scale-110`} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <h1 className="text-xl font-bold text-primary-foreground mt-2">{user.fullName || 'User'}</h1>
            <p className="text-primary-foreground/70 text-sm">{user.email}</p>
            {memberSince && <p className="text-primary-foreground/50 text-xs mt-1">Member since {new Date(memberSince).toLocaleDateString()}</p>}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowEditModal(true)}
              className="mt-3 px-4 py-2 rounded-full bg-white/20 text-primary-foreground text-sm font-medium flex items-center gap-1.5 backdrop-blur-sm">
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </motion.button>
          </div>
        </div>

        <div className="px-4 -mt-4 space-y-4">
          {/* Stats */}
          <div className="glass-strong rounded-2xl p-5 grid grid-cols-3 gap-3">
            {[
              { icon: Award, label: 'Level', value: `Lv.${fitness.currentLevel}` },
              { icon: Coins, label: 'Coins', value: fitness.coins },
              { icon: Target, label: 'Workouts', value: fitness.totalWorkouts },
            ].map(s => (
              <div key={s.label} className="text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="glass rounded-2xl p-5 space-y-3">
            {[
              ['Age', user.age ? `${user.age} years` : ''],
              ['City', user.city],
              ['Height', displayHeight ? `${displayHeight} ${heightUnit}` : ''],
              ['Weight', displayWeight ? `${displayWeight} ${weightUnit}` : ''],
              ['Target', displayTarget ? `${displayTarget} ${weightUnit}` : ''],
              ['Goal', user.fitnessGoal],
              ['Experience', user.experienceLevel],
              ['Preference', user.workoutPreference],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground">{value || '--'}</span>
              </div>
            ))}
          </div>

          {/* Theme Color */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Theme Color</h3>
            </div>
            <div className="flex gap-3">
              {themeSwatches.map(s => (
                <motion.button key={s.theme} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleThemeChange(s.theme)}
                  className={`w-10 h-10 rounded-full ${s.color} ring-2 transition-all ${theme === s.theme ? 'ring-foreground ring-offset-2 ring-offset-background' : 'ring-transparent'}`} />
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Notifications</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setNotifications(!notifications); toast.success(notifications ? 'Notifications off' : 'Notifications on'); }}
                className={`w-12 h-6 rounded-full transition-all relative ${notifications ? 'gradient-primary' : 'bg-muted'}`}>
                <motion.div layout className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 ${notifications ? 'right-0.5' : 'left-0.5'}`} />
              </motion.button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Units: {isMetric ? 'kg / cm' : 'lb / in'}</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleUnitsToggle}
                className={`w-12 h-6 rounded-full transition-all relative ${!isMetric ? 'gradient-primary' : 'bg-muted'}`}>
                <motion.div layout className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 ${!isMetric ? 'right-0.5' : 'left-0.5'}`} />
              </motion.button>
            </div>
          </div>

          {/* Danger */}
          <div className="space-y-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowResetModal(true)}
              className="w-full glass rounded-2xl px-5 py-4 flex items-center gap-3 hover:bg-orange-500/5 transition-all">
              <RotateCcw className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">Reset Progress</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowLogoutModal(true)}
              className="w-full glass rounded-2xl px-5 py-4 flex items-center gap-3 hover:bg-destructive/5 transition-all">
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-foreground">Edit Profile</h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEditModal(false)}><X className="w-5 h-5 text-muted-foreground" /></motion.button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {([
            ['fullName', 'Full Name', 'text'],
            ['age', 'Age', 'number'],
            ['city', 'City', 'text'],
            ['height', `Height (${heightUnit})`, 'number'],
            ['weight', `Weight (${weightUnit})`, 'number'],
            ['targetWeight', `Target Weight (${weightUnit})`, 'number'],
          ] as const).map(([key, label, type]) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
              <input type={type} value={(editForm as any)[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm" />
            </div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSaveProfile}
          className="w-full mt-4 py-3 rounded-full gradient-primary text-primary-foreground font-semibold">Save Changes</motion.button>
      </Modal>

      {/* Reset Progress Modal */}
      <Modal open={showResetModal} onClose={() => setShowResetModal(false)}>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">Reset Progress?</h3>
        <p className="text-sm text-muted-foreground mb-6">This will reset all your fitness, diet, and water data to zero. Your profile info will be kept. This action cannot be undone.</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowResetModal(false)}
            className="flex-1 py-3 rounded-full bg-muted text-foreground font-medium text-sm">Cancel</motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleResetProgress}
            className="flex-1 py-3 rounded-full bg-orange-500 text-white font-medium text-sm">Reset</motion.button>
        </div>
      </Modal>

      {/* Logout Modal */}
      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">Confirm Logout</h3>
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to log out?</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowLogoutModal(false)}
            className="flex-1 py-3 rounded-full bg-muted text-foreground font-medium text-sm">Cancel</motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleLogout}
            className="flex-1 py-3 rounded-full bg-destructive text-destructive-foreground font-medium text-sm">Logout</motion.button>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default Profile;
