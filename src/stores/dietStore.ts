import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FoodItem {
  id: string; name: string; calories: number; protein: number; carbs: number; fat: number; qty: number;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

interface DietState {
  meals: Record<MealType, FoodItem[]>;
  addMeal: (section: MealType, item: Omit<FoodItem, 'id'>) => void;
  removeMeal: (section: MealType, id: string) => void;
  getTotals: () => { calories: number; protein: number; carbs: number; fat: number };
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
      removeMeal: (section, id) => set(s => ({
        meals: { ...s.meals, [section]: s.meals[section].filter(i => i.id !== id) }
      })),
      getTotals: () => {
        const all = Object.values(get().meals).flat();
        return {
          calories: all.reduce((a, i) => a + i.calories * i.qty, 0),
          protein: all.reduce((a, i) => a + i.protein * i.qty, 0),
          carbs: all.reduce((a, i) => a + i.carbs * i.qty, 0),
          fat: all.reduce((a, i) => a + i.fat * i.qty, 0),
        };
      },
      getMealTotal: (section) => get().meals[section].reduce((a, i) => a + i.calories * i.qty, 0),
      resetDiet: () => set({ meals: { ...emptyMeals } }),
    }),
    { name: 'levelfit-diet' }
  )
);