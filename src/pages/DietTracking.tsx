import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Sun, Moon, Cookie, Plus, Trash2, ChevronDown, ChevronUp, X, Droplets, Search, Loader2, Sparkles, Scale } from 'lucide-react';
import { useDietStore } from '@/stores/dietStore';
import { useFitnessStore } from '@/stores/fitnessStore';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { searchFood, NutritionData } from '@/lib/nutritionApi';
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
  const { meals, addMeal, removeMeal, updateMealQty, getTotals, getMealTotal } = useDietStore();
  const { water, addWater } = useFitnessStore();
  const [expanded, setExpanded] = useState<MealType | null>(null);
  const [showModal, setShowModal] = useState<MealType | null>(null);
  
  // Search and form state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NutritionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<NutritionData | null>(null);
  const [qty, setQty] = useState('1');

  const totals = getTotals();
  const pieData = [
    { name: 'Protein', value: totals.protein || 0, color: '#F4A7B9' },
    { name: 'Carbs', value: totals.carbs || 0, color: '#B5C9A1' },
    { name: 'Fat', value: totals.fat || 0, color: '#C3B1E1' },
  ];
  const hasMacros = totals.protein > 0 || totals.carbs > 0 || totals.fat > 0;
  const goals = { calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 30 };

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchFood(query);
      setResults(res);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = () => {
    if (!selectedFood) return;
    addMeal(showModal!, {
      name: selectedFood.name,
      calories: selectedFood.calories,
      protein: selectedFood.protein,
      carbs: selectedFood.carbs,
      fat: selectedFood.fat,
      fiber: selectedFood.fiber,
      qty: Number(qty || 1)
    });
    toast.success(`✅ Added ${selectedFood.name}`);
    resetModal();
  };

  const resetModal = () => {
    setShowModal(null);
    setQuery('');
    setResults([]);
    setSelectedFood(null);
    setQty('1');
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Diet Tracking 🍽️</h1>
          <div className="flex gap-2">
             <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-tighter flex items-center gap-1">
               <Sparkles className="w-3 h-3" /> AI Enhanced
             </div>
          </div>
        </div>

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
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>P: {totals.protein}g</span>
                <span>C: {totals.carbs}g</span>
                <span>F: {totals.fat}g</span>
                <span>Fib: {totals.fiber}g</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { label: 'Calories', val: totals.calories, goal: goals.calories, unit: 'kcal' },
              { label: 'Protein', val: totals.protein, goal: goals.protein, unit: 'g' },
              { label: 'Carbs', val: totals.carbs, goal: goals.carbs, unit: 'g' },
              { label: 'Fat', val: totals.fat, goal: goals.fat, unit: 'g' },
              { label: 'Fiber', val: totals.fiber, goal: goals.fiber, unit: 'g' },
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
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-muted-foreground">{Math.round(item.calories * item.qty)} kcal</p>
                            <div className="flex items-center gap-2 bg-background/50 rounded-lg px-2 py-0.5">
                              <Scale className="w-3 h-3 text-muted-foreground" />
                              <input 
                                type="number" 
                                value={item.qty} 
                                onChange={(e) => updateMealQty(key, item.id, Number(e.target.value))}
                                className="w-10 bg-transparent border-none outline-none text-[10px] font-bold text-center"
                                step="0.5"
                                min="0.1"
                              />
                            </div>
                          </div>
                        </div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={resetModal}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()} className="glass-strong rounded-t-3xl md:rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold">Add to {mealConfig.find(m => m.key === showModal)?.label}</h3>
                <button onClick={resetModal}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  autoFocus
                  value={query} 
                  onChange={e => setQuery(e.target.value)} 
                  placeholder="Search food (e.g. Apple, Chicken...)" 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm font-medium transition-all" 
                />
                {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {selectedFood ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg">{selectedFood.name}</h4>
                        <p className="text-xs text-muted-foreground tracking-wide uppercase">{selectedFood.servingSize || 'Standard Portion'}</p>
                      </div>
                      <button onClick={() => setSelectedFood(null)} className="p-1 hover:bg-white/10 rounded-lg text-muted-foreground"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-6">
                      {[
                        { label: 'CAL', val: Math.round(selectedFood.calories * Number(qty)), unit: '', color: 'text-primary' },
                        { label: 'PRO', val: Math.round(selectedFood.protein * Number(qty) * 10) / 10, unit: 'g', color: 'text-pink-400' },
                        { label: 'CARB', val: Math.round(selectedFood.carbs * Number(qty) * 10) / 10, unit: 'g', color: 'text-green-400' },
                        { label: 'FAT', val: Math.round(selectedFood.fat * Number(qty) * 10) / 10, unit: 'g', color: 'text-purple-400' },
                      ].map(m => (
                        <div key={m.label} className="bg-background/40 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">{m.label}</p>
                          <p className={`text-sm font-bold ${m.color}`}>{m.val}{m.unit}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-background/40 rounded-2xl p-4">
                         <Scale className="w-5 h-5 text-primary" />
                         <div className="flex-1">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase">Portions / Qty</p>
                           <input 
                            type="number" 
                            step="0.5" 
                            min="0.1"
                            value={qty} 
                            onChange={e => setQty(e.target.value)} 
                            className="w-full bg-transparent border-none outline-none text-xl font-black text-foreground"
                           />
                         </div>
                      </div>
                      <button onClick={handleAdd} className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl btn-interactive">
                        Add {Math.round(selectedFood.calories * Number(qty))} Kcal
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {results.length > 0 ? results.map((food, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedFood(food)}
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold text-sm group-hover:text-primary transition-colors">{food.name}</p>
                          <p className="text-[10px] text-muted-foreground">{food.calories} kcal · {food.protein}P · {food.carbs}C · {food.fat}F</p>
                        </div>
                        <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    )) : query.length >= 2 && !loading && (
                      <p className="text-center py-8 text-muted-foreground text-sm italic">No foods found. Try a different search.</p>
                    )}
                    
                    {query.length < 2 && (
                      <div className="py-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto opacity-50">
                          <Search className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground px-8">Search for any food to see its nutritional breakdown instantly.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default DietTracking;