import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';

import { DietDay } from '../../models/diet-day.model';
import { Diet } from '../../models/diet.model';
import { MealSlot } from '../../models/meal-slot.model';
import { Recipe } from '../../models/recipe.model';
import { DietService } from '../../services/diet.service';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-diet-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diet-calendar.html',
  styleUrl: './diet-calendar.css',
})
export class DietCalendar implements OnInit {
  diet: Diet | null = null;
  weekDays: DietDay[] = [];
  mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
  currentWeekStart: Date = this.getMonday(new Date());
  loading = false;
  recipesLoading = false;
  overrideSaving = false;
  error: string | null = null;
  overrideError: string | null = null;
  recipes: Recipe[] = [];
  editingSlot: MealSlot | null = null;
  selectedRecipeId: number | null = null;

  constructor(
    private readonly dietService: DietService,
    private readonly recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.loadWeek();
  }

  loadWeek(): void {
    this.loading = true;
    this.error = null;

    const from = this.formatDate(this.currentWeekStart);
    const to = this.formatDate(this.getSunday(this.currentWeekStart));

    this.dietService.getDietsByDateRange(from, to)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
      next: diets => {
        this.diet = diets.length > 0 ? diets[0] : null;
        this.weekDays = this.diet?.days ?? [];
      },
      error: () => {
        this.error = 'Error cargando la dieta';
      }
    });
  }

  prevWeek(): void {
    this.currentWeekStart = new Date(
      this.currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000
    );
    this.loadWeek();
  }

  nextWeek(): void {
    this.currentWeekStart = new Date(
      this.currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    this.loadWeek();
  }

  getRecipeForSlot(day: DietDay, mealType: string): string {
    const slot = this.getSlotForMeal(day, mealType);
    return slot?.recipe?.name ?? '-';
  }

  getSlotForMeal(day: DietDay, mealType: string): MealSlot | null {
    return day.mealSlots.find(slot => slot.type === mealType) ?? null;
  }

  getMealLabel(type: string): string {
    const labels: Record<string, string> = {
      BREAKFAST: 'Desayuno',
      LUNCH: 'Comida',
      DINNER: 'Cena'
    };
    return labels[type] ?? type;
  }

  startRecipeOverride(slot: MealSlot | null): void {
    if (!slot) {
      return;
    }

    this.editingSlot = slot;
    this.selectedRecipeId = slot.recipe?.id ?? null;
    this.overrideError = null;

    if (this.recipes.length === 0) {
      this.loadRecipes();
    }
  }

  cancelRecipeOverride(): void {
    this.editingSlot = null;
    this.selectedRecipeId = null;
    this.overrideError = null;
  }

  onRecipeSelectionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedRecipeId = value ? Number(value) : null;
  }

  saveRecipeOverride(): void {
    if (!this.editingSlot || !this.selectedRecipeId) {
      this.overrideError = 'Selecciona una receta.';
      return;
    }

    this.overrideSaving = true;
    this.overrideError = null;

    this.dietService.overrideMealSlotRecipe(this.editingSlot.id, this.selectedRecipeId).subscribe({
      next: () => {
        this.overrideSaving = false;
        this.cancelRecipeOverride();
        this.loadWeek();
      },
      error: error => {
        this.overrideSaving = false;
        this.overrideError = this.resolveError(error);
      }
    });
  }

  get compatibleRecipes(): Recipe[] {
    if (!this.editingSlot) {
      return this.recipes;
    }

    return this.recipes.filter(recipe => !recipe.mealType || recipe.mealType === this.editingSlot?.type);
  }

  formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  }

  get weekRangeLabel(): string {
    const sunday = this.getSunday(this.currentWeekStart);
    return `${this.monthLabel} - ${this.formatDateLabel(this.formatDate(this.currentWeekStart))} - ${this.formatDateLabel(this.formatDate(sunday))}`;
  }

  get monthLabel(): string {
    const sunday = this.getSunday(this.currentWeekStart);
    const month = this.currentWeekStart.toLocaleDateString('es-ES', { month: 'long' });
    const year = this.currentWeekStart.getFullYear();

    if (this.currentWeekStart.getMonth() === sunday.getMonth()) {
      return `${month} ${year}`;
    }

    const endMonth = sunday.toLocaleDateString('es-ES', { month: 'long' });
    return `${month} / ${endMonth} ${year}`;
  }

  private loadRecipes(): void {
    this.recipesLoading = true;
    this.recipeService.getAllRecipes().subscribe({
      next: recipes => {
        this.recipes = recipes;
        this.recipesLoading = false;
      },
      error: error => {
        this.overrideError = this.resolveError(error);
        this.recipesLoading = false;
      }
    });
  }

  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getSunday(monday: Date): Date {
    return new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private resolveError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    return 'No se pudo cambiar la receta.';
  }
}
