import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Square, Plus, Minus, ChevronLeft, ChevronRight, Coins, Trophy, Gamepad2 } from 'lucide-react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useFitnessStore } from '@/stores/fitnessStore';
import AppLayout from '@/components/AppLayout';
import toast from 'react-hot-toast';

const exercises = [
  { name: 'Warm Up Jog', emoji: '🏃', type: 'duration', duration: '5 min', sets: 1, reps: 1 },
  { name: 'Jumping Jacks', emoji: '⭐', type: 'reps', duration: '', sets: 3, reps: 20 },
  { name: 'Push Ups', emoji: '💪', type: 'reps', duration: '', sets: 3, reps: 10 },
  { name: 'Squats', emoji: '🦵', type: 'reps', duration: '', sets: 3, reps: 15 },
  { name: 'Cool Down Stretch', emoji: '🧘', type: 'duration', duration: '5 min', sets: 1, reps: 1 },
];

const Workout = () => {
  const navigate = useNavigate();
  const ws = useWorkoutStore();
  const { addCoins, addCalories, coins } = useFitnessStore();
  const [showComplete, setShowComplete] = useState(false);
  const ex = exercises[ws.currentExerciseIndex];
  const mins = Math.floor(ws.timerSeconds / 60).toString().padStart(2, '0');
  const secs = (ws.timerSeconds % 60).toString().padStart(2, '0');

  const handleFinish = () => {
    ws.stopTimer();
    const cal = Math.round(ws.totalReps * 0.5);
    addCalories(cal);
    addCoins(10);
    setShowComplete(true);
  };

  const handleClaim = () => {
    toast.success('🏆 Workout complete! +10 coins earned!');
    ws.reset();
    setShowComplete(false);
    navigate('/dashboard');
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 md:px-8 pt-10 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button 
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => { ws.reset(); navigate('/dashboard'); }} 
            className="w-12 h-12 rounded-2xl glass-strong flex items-center justify-center border-white/5 active:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <h1 className="text-2xl font-display font-black tracking-tighter text-white uppercase italic">SESSION: DAY 1</h1>
          <div className="flex items-center gap-2 glass-strong rounded-2xl px-4 py-2 border-white/10 shadow-[0_0_15px_rgba(204,255,0,0.1)]">
            <Coins className="w-4 h-4 text-neon-green" />
            <span className="font-black text-sm text-white tracking-tighter">{coins}</span>
          </div>
        </div>

        {/* Game Mode Toggle */}
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/game-workout')} 
          className="w-full glass-neon-blue rounded-3xl p-4 mb-6 flex items-center justify-center gap-3 text-sm font-black text-neon-blue uppercase tracking-widest border-none"
        >
          <Gamepad2 className="w-5 h-5 animate-pulse" /> 
          SWITCH TO GAME MODE
        </motion.button>

        {/* Exercise Card */}
        <motion.div 
          key={ws.currentExerciseIndex} 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="glass-neon-green rounded-[2.5rem] p-8 mb-6 border-none relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <button onClick={ws.prevExercise} disabled={ws.currentExerciseIndex === 0} className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center disabled:opacity-30 text-white"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-[10px] font-black text-neon-green uppercase tracking-[0.3em]">{ws.currentExerciseIndex + 1} / {exercises.length}</span>
            <button onClick={ws.nextExercise} disabled={ws.currentExerciseIndex === exercises.length - 1} className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center disabled:opacity-30 text-white"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="text-center mb-8 relative z-10">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-8xl mb-6 drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">{ex.emoji}</motion.div>
            <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-2 italic underline decoration-neon-green/50 decoration-4 underline-offset-8">{ex.name}</h2>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{ex.type === 'duration' ? `GOAL: ${ex.duration}` : `REPS: ${ex.sets} SETS × ${ex.reps} REPS`}</p>
          </div>
          {ex.type === 'reps' && (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between glass-strong rounded-2xl p-4 border-white/5">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">SET {Math.min(ws.currentSet + 1, ex.sets)} / {ex.sets}</span>
                <div className="h-2 flex-1 mx-4 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-neon-green shadow-[0_0_10px_rgba(204,255,0,0.4)]" initial={{ width: 0 }} animate={{ width: `${(ws.currentSet / ex.sets) * 100}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-center gap-8">
                <motion.button whileTap={{ scale: 0.9 }} onClick={ws.removeRep} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white"><Minus className="w-6 h-6" /></motion.button>
                <motion.span key={ws.currentReps} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl font-display font-black text-white w-20 text-center tracking-tighter">{ws.currentReps}</motion.span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={ws.addRep} className="w-14 h-14 rounded-2xl bg-neon-green flex items-center justify-center text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]"><Plus className="w-6 h-6" /></motion.button>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={ws.completeSet} 
                className="w-full py-5 rounded-[1.5rem] bg-white text-black font-black uppercase tracking-widest text-sm shadow-xl"
              >
                COMPLETE SET
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Timer Card */}
        <div className="glass-strong rounded-[2.5rem] p-8 mb-6 text-center border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className={`text-6xl font-display font-black text-white tracking-widest mb-8 relative z-10 ${ws.isRunning && !ws.isPaused ? 'text-neon-blue animate-pulse' : ''}`}>{mins}:{secs}</p>
          <div className="flex gap-4 justify-center relative z-10">
            {!ws.isRunning ? (
              <button onClick={ws.startTimer} className="flex-1 py-5 rounded-3xl bg-neon-blue text-black font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2"><Play className="w-4 h-4 fill-current" /> START</button>
            ) : ws.isPaused ? (
              <button onClick={ws.resumeTimer} className="flex-1 py-5 rounded-3xl bg-neon-blue text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2"><Play className="w-4 h-4 fill-current" /> RESUME</button>
            ) : (
              <button onClick={ws.pauseTimer} className="flex-1 py-5 rounded-3xl bg-white/10 text-white font-black uppercase tracking-widest text-sm backdrop-blur-md border border-white/10 flex items-center justify-center gap-2"><Pause className="w-4 h-4 fill-current" /> PAUSE</button>
            )}
            <button onClick={handleFinish} className="flex-1 py-5 rounded-3xl bg-red-500/20 text-red-500 font-black uppercase tracking-widest text-sm border border-red-500/30 flex items-center justify-center gap-2"><Square className="w-4 h-4 fill-current" /> STOP</button>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="glass rounded-[2rem] p-6 text-center border-white/5 flex items-center justify-between">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">CUMULATIVE REPS</p>
          <p className="text-3xl font-display font-black text-neon-green tracking-tighter uppercase">{ws.totalReps}</p>
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {showComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <motion.div initial={{ scale: 0.8, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} className="glass-strong rounded-[2.5rem] p-10 w-full max-w-sm text-center border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="w-24 h-24 rounded-[2.5rem] bg-neon-green/10 flex items-center justify-center mx-auto mb-6 border border-neon-green/30 relative">
                <Trophy className="w-12 h-12 text-neon-green float-animation" />
                <div className="absolute inset-0 bg-neon-green/20 blur-[30px] rounded-full -z-10" />
              </div>
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-8 italic">MISSION COMPLETE</h2>
              <div className="space-y-4 mb-10 text-left glass rounded-3xl p-6 border-white/5">
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-white/40 uppercase tracking-widest">TOTAL TIME</span><span className="text-lg font-black text-white tracking-tighter uppercase">{mins}:{secs}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-white/40 uppercase tracking-widest">VOLUME</span><span className="text-lg font-black text-white tracking-tighter uppercase">{ws.totalReps} REPS</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-white/40 uppercase tracking-widest">BURNED</span><span className="text-lg font-black text-neon-blue tracking-tighter uppercase">~{Math.round(ws.totalReps * 0.5)} KCAL</span></div>
                <div className="flex justify-between items-center bg-neon-green/5 -mx-6 -mb-6 px-6 py-4 rounded-b-3xl border-t border-neon-green/10"><span className="text-xs font-black text-neon-green uppercase tracking-[0.2em]">GAINZ</span><span className="text-xl font-black text-neon-green tracking-tighter uppercase">+10 COINS</span></div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleClaim} 
                className="w-full py-5 rounded-[1.5rem] bg-neon-green text-black font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(204,255,0,0.3)]"
              >
                CLAIM REWARDS
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Workout;