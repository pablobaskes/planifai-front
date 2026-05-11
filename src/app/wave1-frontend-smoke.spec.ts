import { Routes } from '@angular/router';

import { routes } from './app.routes';

describe('Wave 1 frontend smoke routes', () => {
  it('loads the critical MVP1 routes used by the app shell', async () => {
    const inventoryRoute = routes.find(route => route.path === 'inventory');
    const shoppingRoute = routes.find(route => route.path === 'shopping');
    const dietRoute = routes.find(route => route.path === 'diet');

    expect(inventoryRoute?.loadComponent).toBeTypeOf('function');
    expect(shoppingRoute?.loadComponent).toBeTypeOf('function');
    expect(dietRoute?.loadChildren).toBeTypeOf('function');

    const inventoryComponent = await (inventoryRoute!.loadComponent as () => Promise<unknown>)();
    const shoppingComponent = await (shoppingRoute!.loadComponent as () => Promise<unknown>)();
    const dietRoutes = await (dietRoute!.loadChildren as () => Promise<Routes>)();

    expect((inventoryComponent as { name: string }).name).toContain('InventoryPage');
    expect((shoppingComponent as { name: string }).name).toContain('ShoppingListPage');
    expect(dietRoutes.map(route => route.path)).toEqual(
      expect.arrayContaining(['calendar', 'create', 'recipes'])
    );
  });

  it('redirects the root route into the diet flow', () => {
    const rootRoute = routes.find(route => route.path === '');

    expect(rootRoute?.redirectTo).toBe('diet');
    expect(rootRoute?.pathMatch).toBe('full');
  });
});
