import { Recipe } from "./recipe.model";

export interface MealSlot {
  id: number;
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  recipe: Recipe;
}