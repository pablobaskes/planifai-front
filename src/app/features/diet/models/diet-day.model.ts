import { MealSlot } from "./meal-slot.model";

export interface DietDay {
  id: number;
  date: string;
  mealSlots: MealSlot[];
}