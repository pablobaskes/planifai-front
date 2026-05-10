export type StorageLocation = 'FRIDGE' | 'FREEZER' | 'PANTRY' | 'OTHER';

export type MeasureUnit = 'G' | 'KG' | 'ML' | 'L' | 'UNIT' | 'TBSP' | 'TSP' | 'CUP';

export interface FoodPortion {
  foodId: number;
  foodName?: string;
  quantity: number;
  unit: MeasureUnit;
  weightPerUnit?: number | null;
}

export interface InventoryItemRequest {
  portion: Pick<FoodPortion, 'foodId' | 'quantity' | 'unit' | 'weightPerUnit'>;
  location: StorageLocation;
}

export interface InventoryItem {
  id: number;
  portion: FoodPortion;
  location: StorageLocation;
}
