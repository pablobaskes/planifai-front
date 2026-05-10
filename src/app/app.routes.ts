import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/inventory/pages/inventory-page/inventory-page').then(m => m.InventoryPage)
  },
  {
    path: 'shopping',
    loadComponent: () =>
      import('./features/shopping/pages/shopping-list-page/shopping-list-page').then(m => m.ShoppingListPage)
  },
  {
    path: 'diet',
    loadChildren: () =>
      import('./features/diet/diet.routes').then(m => m.DIET_ROUTES)
  },
  { path: '', redirectTo: 'diet', pathMatch: 'full' }
];
