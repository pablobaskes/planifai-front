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

export interface DietRequest {
  name: string;
  description?: string;
  caloriesTarget: number;
  initDate: string;
  endDate: string;
}

export type { DietDay };
