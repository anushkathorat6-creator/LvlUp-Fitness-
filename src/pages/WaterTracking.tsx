import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Trash2, Flame } from 'lucide-react';
import { useFitnessStore } from '@/stores/fitnessStore';
import AppLayout from '@/components/AppLayout';
import toast from 'react-hot-toast';

const WaterTracking = () => {
  const { water, waterEntries, addWater, removeWaterEntry } = useFitnessStore();
  const [customMl, setCustomMl] = useState('');
  const liters = water / 1000;
  const goal = 2.5;
  const pct = Math.min((liters / goal) * 100, 100);

  const handleAdd = (ml: number) => { addWater(ml); toast.success('💧 Water logged!'); };
  const handleCustom = () => {
    const val = parseInt(customMl);
    if (!val || val <= 0) { toast.error('Enter a valid amount'); return; }
    addWater(val);
    toast.success('💧 Water logged!');
    setCustomMl('');
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 md:px-8 pt-6 md:pt-10">
        <h1 className="font-display text-2xl font-bold text-foreground text-center mb-8">Stay Hydrated 💧</h1>

        {/* Glass visualization */}
        <div className="glass-strong rounded-3xl p-8 mb-6 flex flex-col items-center">
          <div className="relative w-40 h-56 mb-6">
            {/* Glass outline */}
            <div className="absolute inset-0 border-4 border-primary/20 rounded-b-3xl rounded-t-xl overflow-hidden">
              {/* Water fill */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400/60 to-cyan-300/40"
                initial={{ height: '0%' }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.7, type: 'spring' }}
              >
                {/* Wave effect */}
                <div className="absolute -top-2 left-0 right-0 h-4 overflow-hidden">
                  <div className="w-[200%] h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgMjAwIDIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDEwIFEgMjUgMCA1MCAxMCBRIDc1IDIwIDEwMCAxMCBRIDEyNSAwIDE1MCAxMCBRIDE3NSAyMCAyMDAgMTAgTDIwMCAyMCBMMCAyMCBaIiBmaWxsPSJyZ2JhKDU5LDEzMCwyNDYsMC4zKSIvPjwvc3ZnPg==')] bg-repeat-x" style={{ animation: 'wave 3s linear infinite' }} />
                </div>
              </motion.div>
              {/* Percentage text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <Droplets className="w-8 h-8 text-primary mb-1" />
                <p className="text-2xl font-bold text-foreground">{liters.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">/ {goal} L</p>
              </div>
            </div>
            {/* Progress ring */}
            <svg className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] -rotate-90" viewBox="0 0 180 260">
              <rect x="10" y="10" width="160" height="240" rx="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <rect x="10" y="10" width="160" height="240" rx="20" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeDasharray="800" strokeDashoffset={800 * (1 - pct / 100)} className="transition-all duration-700" />
            </svg>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{Math.round(pct)}% of daily goal</p>

          {/* Quick add */}
          <div className="grid grid-cols-3 gap-3 w-full mb-4">
            {[250, 500, 1000].map(ml => (
              <motion.button key={ml} whileTap={{ scale: 0.95 }} onClick={() => handleAdd(ml)}
                className="py-3 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm btn-interactive shadow-md">
                +{ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}
              </motion.button>
            ))}
          </div>

          {/* Custom */}
          <div className="flex gap-2 w-full">
            <input value={customMl} onChange={e => setCustomMl(e.target.value)} type="number" placeholder="Custom ml" className="flex-1 px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm" />
            <button onClick={handleCustom} className="px-4 py-3 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm btn-interactive">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Daily log */}
        <div className="glass rounded-2xl p-5 mb-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">Today's Log</h3>
          {waterEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No water logged yet. Start hydrating!</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {waterEntries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{entry.amount}ml</span>
                    <span className="text-xs text-muted-foreground">{entry.time}</span>
                  </div>
                  <button onClick={() => { removeWaterEntry(entry.id); toast.success('Entry removed'); }} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Streak */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-gold" />
            <div>
              <p className="font-semibold text-foreground">Water Streak: 0 Days</p>
              <p className="text-xs text-muted-foreground">Log water daily to build your streak!</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WaterTracking;