export type FoodCategory =
  | 'FRUIT'
  | 'VEGETABLE'
  | 'MEAT'
  | 'FISH'
  | 'DAIRY'
  | 'GRAIN'
  | 'LEGUME'
  | 'NUT'
  | 'OIL'
  | 'BEVERAGE'
  | 'OTHER';

export interface Food {
  id: number;
  name: string;
  category: FoodCategory;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}
