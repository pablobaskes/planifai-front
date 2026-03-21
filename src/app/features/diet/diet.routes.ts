import { Routes } from "@angular/router";
import { DietCalendarPage } from "./pages/diet-calendar-page/diet-calendar-page";
import { DietCreatePage } from "./pages/diet-create-page/diet-create-page";
import { RecipeListPage } from "./pages/recipe-list-page/recipe-list-page";

export const DIET_ROUTES: Routes = [
  {
    path: 'calendar',
    component: DietCalendarPage
  },
  {
    path: 'create',
    component: DietCreatePage
  },
  {
    path: 'recipes',
    component: RecipeListPage
  }
];