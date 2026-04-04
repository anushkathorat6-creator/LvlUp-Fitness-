import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WaterEntry { id: string; amount: number; time: string; }

interface FitnessState {
  steps: number;
  calories: number;
  water: number;
  coins: number;
  heartRate: string;
  currentLevel: number;
  currentDay: number;
  completedLevels: number[];
  totalWorkouts: number;
  daysStreak: number;
  waterEntries: WaterEntry[];
  weightLog: { date: string; weight: number }[];
  stepsLog: { date: string; steps: number }[];
  caloriesLog: { date: string; cal: number }[];
  waterLog: { date: string; ml: number }[];
  addSteps: (n: number) => void;
  addCalories: (n: number) => void;
  addWater: (ml: number) => void;
  addCoins: (n: number) => void;
  setHeartRate: (hr: string) => void;
  logWeight: (w: number) => void;
  removeWaterEntry: (id: string) => void;
  resetProgress: () => void;
}

const today = () => new Date().toISOString().split('T')[0];
const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set) => ({
      steps: 0, calories: 0, water: 0, coins: 0, heartRate: '',
      currentLevel: 1, currentDay: 1, completedLevels: [], totalWorkouts: 0, daysStreak: 0,
      waterEntries: [], weightLog: [], stepsLog: [], caloriesLog: [], waterLog: [],
      addSteps: (n) => set(s => {
        const d = today();
        const existing = s.stepsLog.find(e => e.date === d);
        const stepsLog = existing ? s.stepsLog.map(e => e.date === d ? { ...e, steps: e.steps + n } : e) : [...s.stepsLog, { date: d, steps: n }];
        return { steps: s.steps + n, stepsLog };
      }),
      addCalories: (n) => set(s => {
        const d = today();
        const existing = s.caloriesLog.find(e => e.date === d);
        const caloriesLog = existing ? s.caloriesLog.map(e => e.date === d ? { ...e, cal: e.cal + n } : e) : [...s.caloriesLog, { date: d, cal: n }];
        return { calories: s.calories + n, caloriesLog };
      }),
      addWater: (ml) => set(s => {
        const d = today();
        const existing = s.waterLog.find(e => e.date === d);
        const waterLog = existing ? s.waterLog.map(e => e.date === d ? { ...e, ml: e.ml + ml } : e) : [...s.waterLog, { date: d, ml }];
        const entry: WaterEntry = { id: Date.now().toString(), amount: ml, time: timeNow() };
        return { water: s.water + ml, waterLog, waterEntries: [...s.waterEntries, entry] };
      }),
      addCoins: (n) => set(s => ({ coins: s.coins + n })),
      setHeartRate: (hr) => set({ heartRate: hr }),
      logWeight: (w) => set(s => ({ weightLog: [...s.weightLog, { date: today(), weight: w }] })),
      removeWaterEntry: (id) => set(s => {
        const entry = s.waterEntries.find(e => e.id === id);
        if (!entry) return s;
        return { water: Math.max(0, s.water - entry.amount), waterEntries: s.waterEntries.filter(e => e.id !== id) };
      }),
      resetProgress: () => set({ steps: 0, calories: 0, water: 0, coins: 0, heartRate: '', currentLevel: 1, currentDay: 1, completedLevels: [], totalWorkouts: 0, daysStreak: 0, waterEntries: [], weightLog: [], stepsLog: [], caloriesLog: [], waterLog: [] }),
    }),
    { name: 'levelfit-fitness' }
  )
);