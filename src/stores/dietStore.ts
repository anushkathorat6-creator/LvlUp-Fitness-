import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FoodItem {
  id: string; name: string; calories: number; protein: number; carbs: number; fat: number; fiber: number; qty: number;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

interface DietState {
  meals: Record<MealType, FoodItem[]>;
  addMeal: (section: MealType, item: Omit<FoodItem, 'id'>) => void;
  updateMealQty: (section: MealType, id: string, qty: number) => void;
  removeMeal: (section: MealType, id: string) => void;
  getTotals: () => { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  getMealTotal: (section: MealType) => number;
  resetDiet: () => void;
}

const emptyMeals: Record<MealType, FoodItem[]> = { breakfast: [], lunch: [], dinner: [], snacks: [] };

export const useDietStore = create<DietState>()(
  persist(
    (set, get) => ({
      meals: { ...emptyMeals },
      addMeal: (section, item) => set(s => ({
        meals: { ...s.meals, [section]: [...s.meals[section], { ...item, id: Date.now().toString() }] }
      })),
      updateMealQty: (section, id, qty) => set(s => ({
        meals: {
          ...s.meals,
          [section]: s.meals[section].map(i => i.id === id ? { ...i, qty: Math.max(0.1, qty) } : i)
        }
      })),
      removeMeal: (section, id) => set(s => ({
        meals: { ...s.meals, [section]: s.meals[section].filter(i => i.id !== id) }
      })),
      getTotals: () => {
        const all = Object.values(get().meals).flat();
        return {
          calories: Math.round(all.reduce((a, i) => a + i.calories * i.qty, 0)),
          protein: Math.round(all.reduce((a, i) => a + i.protein * i.qty, 0) * 10) / 10,
          carbs: Math.round(all.reduce((a, i) => a + i.carbs * i.qty, 0) * 10) / 10,
          fat: Math.round(all.reduce((a, i) => a + i.fat * i.qty, 0) * 10) / 10,
          fiber: Math.round(all.reduce((a, i) => a + i.fiber * i.qty, 0) * 10) / 10,
        };
      },
      getMealTotal: (section) => Math.round(get().meals[section].reduce((a, i) => a + i.calories * i.qty, 0)),
      resetDiet: () => set({ meals: { ...emptyMeals } }),
    }),
    { name: 'levelfit-diet' }
  )
);