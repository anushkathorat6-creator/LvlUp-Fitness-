import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footprints, Plus, Minus, Zap, RefreshCw, Info } from 'lucide-react';
import { useFitnessStore } from '@/stores/fitnessStore';
import toast from 'react-hot-toast';

const STEP_GOAL = 8000;
const CAL_PER_STEP = 0.045;

const StepTracker = () => {
  const { steps, addSteps } = useFitnessStore();
  const [manualInput, setManualInput] = useState('');
  
  const handleAdjustment = (amount: number) => {
    // Prevent negative steps if possible, though addSteps handles adding to total
    // If the user wants to decrease below 0, we can clamp it in the UI or store
    if (steps + amount < 0) {
      addSteps(-steps);
    } else {
      addSteps(amount);
    }
    toast.success(`${amount > 0 ? '+' : ''}${amount} steps updated!`);
  };

  const handleManualSubmit = () => {
    const val = parseInt(manualInput);
    if (isNaN(val) || val === 0) {
      toast.error('Enter a valid step count');
      return;
    }
    addSteps(val);
    setManualInput('');
    toast.success(`Logged ${val} steps!`);
  };

  const calories = (steps * CAL_PER_STEP).toFixed(1);
  const progressPct = Math.min((steps / STEP_GOAL) * 100, 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-neon-green rounded-[2.5rem] p-8 mb-8 relative overflow-hidden group border-white/5"
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-neon-green/5 blur-[100px] -mr-24 -mt-24 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
              <Footprints className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">Step Tracker</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Progress</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-display font-black text-white tracking-tighter uppercase">{steps}</p>
            <p className="text-[10px] font-bold text-neon-green uppercase tracking-widest">OF {STEP_GOAL} GOAL</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Increments */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Quick Adjust</p>
            <div className="flex gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleAdjustment(100)}
                className="flex-1 py-3 rounded-2xl glass border-white/5 text-white font-bold text-xs"
              >
                +100
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleAdjustment(-100)}
                className="flex-1 py-3 rounded-2xl glass border-white/5 text-white/50 font-bold text-xs"
              >
                -100
              </motion.button>
            </div>
            <div className="flex gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleAdjustment(500)}
                className="flex-1 py-3 rounded-2xl glass border-white/5 text-white font-bold text-xs"
              >
                +500
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleAdjustment(-500)}
                className="flex-1 py-3 rounded-2xl glass border-white/5 text-white/50 font-bold text-xs"
              >
                -500
              </motion.button>
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Manual Entry</p>
            <div className="relative">
              <input 
                type="number" 
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="ADD STEPS"
                className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-neon-green outline-none text-white font-bold text-xs placeholder:text-white/20"
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleManualSubmit}
              className="w-full py-3 rounded-2xl bg-neon-green text-black font-black uppercase tracking-widest text-xs shadow-lg shadow-neon-green/20"
            >
              CONFIRM
            </motion.button>
          </div>
        </div>

        {/* Calories Display */}
        <div className="flex items-center gap-4 mb-8 p-4 rounded-3xl bg-white/5 border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-0.5">Estimated Burn</p>
            <p className="text-xl font-display font-black text-white tracking-tighter uppercase">
              {calories} <span className="text-xs font-bold text-white/30 ml-1">KCAL</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Daily Progress</p>
            <p className="text-sm font-black text-white">{Math.round(progressPct)}%</p>
          </div>
          <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-neon-green rounded-full shadow-[0_0_15px_rgba(204,255,0,0.5)] relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-shimmer" />
            </motion.div>
          </div>
        </div>

        {/* Google Fit Sync Section */}
        <div className="p-5 rounded-3xl bg-black/40 border border-white/5 border-dashed relative overflow-hidden group/sync">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center opacity-40">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white/40 uppercase tracking-widest">Connect Google Fit</h4>
                <p className="text-[9px] font-bold text-neon-blue uppercase tracking-[0.2em] mt-0.5">COMING SOON</p>
              </div>
            </div>
            <Info className="w-4 h-4 text-white/20" />
          </div>
          <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover/sync:opacity-100 transition-opacity pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
};

export default StepTracker;
