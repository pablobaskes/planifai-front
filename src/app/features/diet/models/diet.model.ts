import { DietDay } from "./diet-day.model";

export interface Diet {
  id: number;
  name: string;
  description?: string;
  caloriesTarget: number;
  initDate: string;
  endDate: string;
  days: DietDay[];
}