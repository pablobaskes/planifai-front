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
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/pages/task-list-page/task-list-page').then(m => m.TaskListPage)
  },
  {
    path: 'finance',
    loadComponent: () =>
      import('./features/finance/pages/finance-page/finance-page').then(m => m.FinancePage)
  },
  {
    path: 'receipts/ocr',
    loadComponent: () =>
      import('./features/receipts/pages/receipt-ocr-page/receipt-ocr-page').then(m => m.ReceiptOcrPage)
  },
  {
    path: 'diet',
    loadChildren: () =>
      import('./features/diet/diet.routes').then(m => m.DIET_ROUTES)
  },
  { path: '', redirectTo: 'diet', pathMatch: 'full' }
];
