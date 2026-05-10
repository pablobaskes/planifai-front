import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Diet } from '../../models/diet.model';
import { Recipe } from '../../models/recipe.model';
import { DietService } from '../../services/diet.service';
import { RecipeService } from '../../services/recipe.service';
import { DietCalendar } from './diet-calendar';

describe('DietCalendar', () => {
  let component: DietCalendar;
  let fixture: ComponentFixture<DietCalendar>;
  let dietService: {
    getDietsByDateRange: ReturnType<typeof vi.fn>;
    overrideMealSlotRecipe: ReturnType<typeof vi.fn>;
  };
  let recipeService: {
    getAllRecipes: ReturnType<typeof vi.fn>;
  };

  const recipe: Recipe = {
    id: 20,
    name: 'Arroz',
    nutritionSummary: {
      totalCalories: 100,
      totalProtein: 5,
      totalCarbs: 20,
      totalFat: 1,
    },
    tags: [],
    servings: 1,
  };

  const diet: Diet = {
    id: 1,
    name: 'Wave 1 Diet',
    caloriesTarget: 2000,
    initDate: '2026-05-11',
    endDate: '2026-05-17',
    days: [
      {
        id: 100,
        date: '2026-05-11',
        mealSlots: [
          {
            id: 10,
            type: 'LUNCH',
            recipe,
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    dietService = {
      getDietsByDateRange: vi.fn().mockReturnValue(of([diet])),
      overrideMealSlotRecipe: vi.fn().mockReturnValue(of({
        id: 10,
        type: 'LUNCH',
        recipe: { ...recipe, id: 21, name: 'Pasta' },
      })),
    };
    recipeService = {
      getAllRecipes: vi.fn().mockReturnValue(of([
        recipe,
        { ...recipe, id: 21, name: 'Pasta' },
      ])),
    };

    await TestBed.configureTestingModule({
      imports: [DietCalendar],
      providers: [
        { provide: DietService, useValue: dietService },
        { provide: RecipeService, useValue: recipeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DietCalendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads and renders the calendar with change actions', () => {
    expect(component).toBeTruthy();
    expect(dietService.getDietsByDateRange).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Arroz');
    expect(fixture.nativeElement.textContent).toContain('Cambiar');
  });

  it('loads recipes and overrides a meal slot recipe', () => {
    const slot = diet.days[0].mealSlots[0];

    component.startRecipeOverride(slot);
    expect(recipeService.getAllRecipes).toHaveBeenCalled();

    component.onRecipeSelectionChange({ target: { value: '21' } } as unknown as Event);
    component.saveRecipeOverride();

    expect(dietService.overrideMealSlotRecipe).toHaveBeenCalledWith(10, 21);
    expect(dietService.getDietsByDateRange).toHaveBeenCalledTimes(2);
  });

  it('shows backend errors when override fails', () => {
    dietService.overrideMealSlotRecipe.mockReturnValueOnce(throwError(() => ({
      error: { message: 'Recipe not found with id: 99' },
    })));
    const slot = diet.days[0].mealSlots[0];

    component.startRecipeOverride(slot);
    component.onRecipeSelectionChange({ target: { value: '99' } } as unknown as Event);
    component.saveRecipeOverride();

    expect(component.overrideError).toBe('No se pudo cambiar la receta.');
  });
});
