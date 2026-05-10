export type ShoppingListStatus = 'PENDING' | 'PARTIALLY_COMPLETED' | 'COMPLETED';

export type ShoppingUnit = 'G' | 'KG' | 'ML' | 'L' | 'UNIT' | 'TBSP' | 'TSP' | 'CUP';

export interface ShoppingListItem {
  id: number;
  foodId: number;
  foodName: string;
  requiredQuantity: number;
  availableQuantity: number;
  missingQuantity: number;
  unit: ShoppingUnit;
  purchased: boolean;
}

export interface ShoppingList {
  id: number;
  weekStart: string;
  status: ShoppingListStatus;
  items: ShoppingListItem[];
}
