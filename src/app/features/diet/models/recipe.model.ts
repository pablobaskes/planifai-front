import { NutritionSummary } from "./nutrition-summary.model";

export interface FoodPortion {
  foodId: number;
  foodName?: string;
  quantity: number;
  unit: 'G' | 'KG' | 'ML' | 'L' | 'UNIT' | 'TBSP' | 'TSP' | 'CUP';
  weightPerUnit?: number;
}

export interface Recipe {
  id: number;
  name: string;
  nutritionSummary: NutritionSummary;
  ingredients?: FoodPortion[];
  tags: string[];
  servings: number;
  mealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
}
