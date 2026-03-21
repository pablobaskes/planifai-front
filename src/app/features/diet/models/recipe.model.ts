import { NutritionSummary } from "./nutrition-summary.model";

export interface Recipe {
  id: number;
  name: string;
  nutritionSummary: NutritionSummary;
  tags: string[];
  servings: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
}