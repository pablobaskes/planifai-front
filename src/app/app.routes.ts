import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'diet',
    loadChildren: () =>
      import('./features/diet/diet.routes').then(m => m.DIET_ROUTES)
  },
  { path: '', redirectTo: 'diet', pathMatch: 'full' }
];
