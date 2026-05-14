import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { Recipe } from '../../models/recipe.model';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-list-page',
  imports: [],
  templateUrl: './recipe-list-page.html',
  styleUrl: './recipe-list-page.css',
})
export class RecipeListPage implements OnInit {

  private readonly recipeService = inject(RecipeService);

  protected readonly recipes = signal<Recipe[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRecipes();
  }

  protected loadRecipes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.recipeService.getAllRecipes()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: recipes => this.recipes.set(recipes),
        error: () => this.error.set('No se pudieron cargar las recetas.'),
      });
  }

  protected mealTypeLabel(mealType?: string): string {
    const labels: Record<string, string> = {
      BREAKFAST: 'Desayuno',
      LUNCH: 'Comida',
      DINNER: 'Cena',
      SNACK: 'Snack',
    };
    return mealType ? labels[mealType] ?? mealType : 'Sin tipo';
  }

  protected nutritionLabel(recipe: Recipe): string {
    const nutrition = recipe.nutritionSummary;
    if (!nutrition) {
      return 'Sin nutricion calculada';
    }

    return `${nutrition.totalCalories ?? 0} kcal · ${nutrition.totalProtein ?? 0}g proteina · ${nutrition.totalCarbs ?? 0}g carbs · ${nutrition.totalFat ?? 0}g grasa`;
  }

  protected ingredientsLabel(recipe: Recipe): string {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return 'Sin ingredientes';
    }

    return recipe.ingredients
      .slice(0, 3)
      .map(ingredient => ingredient.foodName ?? `Food #${ingredient.foodId}`)
      .join(', ');
  }
}
