import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Coffee, Sun, Moon, Cookie, Plus, Trash2, ChevronDown, ChevronUp, X, Droplets } from 'lucide-react';
import { useDietStore } from '@/stores/dietStore';
import { useFitnessStore } from '@/stores/fitnessStore';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import AppLayout from '@/components/AppLayout';
import toast from 'react-hot-toast';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
const mealConfig = [
  { key: 'breakfast' as MealType, label: 'Breakfast', icon: Coffee, color: 'from-amber-300 to-orange-300' },
  { key: 'lunch' as MealType, label: 'Lunch', icon: Sun, color: 'from-green-300 to-emerald-300' },
  { key: 'dinner' as MealType, label: 'Dinner', icon: Moon, color: 'from-indigo-300 to-purple-300' },
  { key: 'snacks' as MealType, label: 'Snacks', icon: Cookie, color: 'from-pink-300 to-rose-300' },
];

const DietTracking = () => {
  const { meals, addMeal, removeMeal, getTotals, getMealTotal } = useDietStore();
  const { water, addWater } = useFitnessStore();
  const [expanded, setExpanded] = useState<MealType | null>(null);
  const [showModal, setShowModal] = useState<MealType | null>(null);
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', qty: '1' });

  const totals = getTotals();
  const pieData = [
    { name: 'Protein', value: totals.protein || 0, color: '#F4A7B9' },
    { name: 'Carbs', value: totals.carbs || 0, color: '#B5C9A1' },
    { name: 'Fat', value: totals.fat || 0, color: '#C3B1E1' },
  ];
  const hasMacros = totals.protein > 0 || totals.carbs > 0 || totals.fat > 0;
  const goals = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

  const handleAdd = () => {
    if (!form.name || !form.calories) { toast.error('Name and calories required'); return; }
    addMeal(showModal!, { name: form.name, calories: Number(form.calories), protein: Number(form.protein || 0), carbs: Number(form.carbs || 0), fat: Number(form.fat || 0), qty: Number(form.qty || 1) });
    toast.success(`✅ Meal added to ${mealConfig.find(m => m.key === showModal)?.label}`);
    setForm({ name: '', calories: '', protein: '', carbs: '', fat: '', qty: '1' });
    setShowModal(null);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-6 md:pt-10">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Diet Tracking 🍽️</h1>

        <div className="glass-strong rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 relative">
              {hasMacros ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={pieData} innerRadius={30} outerRadius={45} paddingAngle={3} dataKey="value">{pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie></PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full rounded-full border-4 border-muted flex items-center justify-center">
                  <p className="text-[10px] text-muted-foreground text-center">Add meals</p>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm text-muted-foreground">Total Calories</p>
              <p className="text-3xl font-bold text-foreground">{totals.calories} <span className="text-sm font-normal text-muted-foreground">kcal</span></p>
              <div className="flex gap-3 text-xs text-muted-foreground"><span>P: {totals.protein}g</span><span>C: {totals.carbs}g</span><span>F: {totals.fat}g</span></div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { label: 'Calories', val: totals.calories, goal: goals.calories, unit: 'kcal' },
              { label: 'Protein', val: totals.protein, goal: goals.protein, unit: 'g' },
              { label: 'Carbs', val: totals.carbs, goal: goals.carbs, unit: 'g' },
              { label: 'Fat', val: totals.fat, goal: goals.fat, unit: 'g' },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs text-muted-foreground mb-0.5"><span>{m.label}</span><span>{m.val} / {m.goal} {m.unit}</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div className="h-full gradient-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min((m.val / m.goal) * 100, 100)}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {mealConfig.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="glass rounded-2xl mb-3 overflow-hidden">
            <button onClick={() => setExpanded(expanded === key ? null : key)} className="w-full p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}><Icon className="w-5 h-5 text-white" /></div>
              <div className="flex-1 text-left"><p className="font-semibold text-foreground">{label}</p><p className="text-xs text-muted-foreground">{getMealTotal(key)} kcal</p></div>
              {expanded === key ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {expanded === key && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-2">
                    {meals[key].length === 0 ? <p className="text-sm text-muted-foreground text-center py-3">No meals added yet</p> : meals[key].map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                        <div><p className="text-sm font-medium text-foreground">{item.name} {item.qty > 1 ? `×${item.qty}` : ''}</p><p className="text-xs text-muted-foreground">{item.calories * item.qty} kcal</p></div>
                        <button onClick={() => { removeMeal(key, item.id); toast.success('Removed'); }} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => setShowModal(key)} className="w-full py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary font-medium text-sm flex items-center justify-center gap-1 btn-interactive"><Plus className="w-4 h-4" /> Add Food</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="glass rounded-2xl p-4 mt-4 mb-6">
          <div className="flex items-center gap-2 mb-3"><Droplets className="w-5 h-5 text-primary" /><span className="font-semibold text-foreground text-sm">Quick Water Log</span><span className="ml-auto text-sm text-muted-foreground">{(water / 1000).toFixed(1)}L</span></div>
          <div className="grid grid-cols-3 gap-2">
            {[250, 500, 1000].map(ml => (
              <button key={ml} onClick={() => { addWater(ml); toast.success('💧 Water logged!'); }} className="py-2 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm btn-interactive">+{ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}</button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowModal(null)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()} className="glass-strong rounded-t-3xl md:rounded-3xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4"><h3 className="font-display text-lg font-bold">Add to {mealConfig.find(m => m.key === showModal)?.label}</h3><button onClick={() => setShowModal(null)}><X className="w-5 h-5 text-muted-foreground" /></button></div>
              <div className="space-y-3">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Food name" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} type="number" placeholder="Calories" className="px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm" />
                  <input value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} type="number" placeholder="Protein (g)" className="px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm" />
                  <input value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} type="number" placeholder="Carbs (g)" className="px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm" />
                  <input value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} type="number" placeholder="Fat (g)" className="px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm" />
                </div>
                <input value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} type="number" placeholder="Quantity" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm" />
                <button onClick={handleAdd} className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-semibold btn-interactive shadow-lg">Add Food</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default DietTracking;