export interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize?: string;
}

const MOCK_FOODS: NutritionData[] = [
  { name: 'Egg (Large)', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0, servingSize: '1 egg' },
  { name: 'Chicken Breast (Cooked)', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, servingSize: '100g' },
  { name: 'Oatmeal', calories: 154, protein: 5.3, carbs: 27, fat: 2.6, fiber: 4, servingSize: '1 cup' },
  { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, servingSize: '1 medium' },
  { name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 3.6, fat: 5, fiber: 0, servingSize: '100g' },
  { name: 'Almonds', calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5, servingSize: '100g' },
  { name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, servingSize: '100g' },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, servingSize: '100g' },
  { name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, servingSize: '100g' },
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6, servingSize: '100g' },
];

export const searchFood = async (query: string): Promise<NutritionData[]> => {
  // Simulate minor delay for UI feel
  await new Promise(resolve => setTimeout(resolve, 300));

  const appId = import.meta.env.VITE_EDAMAM_APP_ID;
  const appKey = import.meta.env.VITE_EDAMAM_APP_KEY;

  // 1. Try Edamam if keys are available
  if (appId && appKey) {
    try {
      const resp = await fetch(`https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${encodeURIComponent(query)}`);
      const data = await resp.json();
      
      if (data.hints && data.hints.length > 0) {
        return data.hints.map((h: any) => ({
          name: h.food.label,
          calories: Math.round(h.food.nutrients.ENERC_KCAL || 0),
          protein: Math.round((h.food.nutrients.PROCNT || 0) * 10) / 10,
          carbs: Math.round((h.food.nutrients.CHOCDF || 0) * 10) / 10,
          fat: Math.round((h.food.nutrients.FAT || 0) * 10) / 10,
          fiber: Math.round((h.food.nutrients.FIBTG || 0) * 10) / 10,
          servingSize: 'Standard Portion'
        }));
      }
    } catch (err) {
      console.error('Edamam API error:', err);
    }
  }

  // 2. Try Open Food Facts (Massive global database, NO API KEY REQUIRED)
  try {
    const resp = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`, {
      headers: {
        'User-Agent': 'LevelUpFitnessApp - dev@student.com'
      }
    });
    
    if (resp.ok) {
      const data = await resp.json();
      if (data.products && data.products.length > 0) {
        return data.products
          .filter((p: any) => p.product_name && p.nutriments)
          .map((p: any) => {
            const n = p.nutriments;
            // Energy can be in kcal or kJ. Prioritize kcal.
            const cal = n['energy-kcal_100g'] || (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0);
            
            return {
              name: p.product_name + (p.brands ? ` (${p.brands})` : ''),
              calories: Math.round(Number(cal) || 0),
              protein: Math.round((Number(n.proteins_100g) || 0) * 10) / 10,
              carbs: Math.round((Number(n.carbohydrates_100g) || 0) * 10) / 10,
              fat: Math.round((Number(n.fat_100g) || 0) * 10) / 10,
              fiber: Math.round((Number(n.fiber_100g) || 0) * 10) / 10,
              servingSize: 'Per 100g'
            };
          });
      }
    }
  } catch (err) {
    console.error('Open Food Facts search error:', err);
  }

  // 3. Fallback to basic mock if both fail or return nothing
  const q = query.toLowerCase();
  const mockResults = MOCK_FOODS.filter(f => f.name.toLowerCase().includes(q));
  return mockResults;
};

