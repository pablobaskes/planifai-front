import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { RecipeService } from '../../services/recipe.service';
import { RecipeListPage } from './recipe-list-page';

describe('RecipeListPage', () => {
  let component: RecipeListPage;
  let fixture: ComponentFixture<RecipeListPage>;
  let recipeService: {
    getAllRecipes: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    recipeService = {
      getAllRecipes: vi.fn().mockReturnValue(of([{
        id: 20,
        name: 'Arroz con pollo',
        mealType: 'LUNCH',
        nutritionSummary: {
          totalCalories: 500,
          totalProtein: 35,
          totalCarbs: 55,
          totalFat: 12,
        },
        ingredients: [
          { foodId: 1, foodName: 'Arroz', quantity: 100, unit: 'G' },
          { foodId: 2, foodName: 'Pollo', quantity: 150, unit: 'G' },
        ],
        tags: [],
        servings: 1,
      }])),
    };

    await TestBed.configureTestingModule({
      imports: [RecipeListPage],
      providers: [
        { provide: RecipeService, useValue: recipeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads and renders recipes', () => {
    fixture.detectChanges();

    expect(recipeService.getAllRecipes).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Arroz con pollo');
    expect(fixture.nativeElement.textContent).toContain('Comida');
    expect(fixture.nativeElement.textContent).toContain('500 kcal');
    expect(fixture.nativeElement.textContent).toContain('Arroz, Pollo');
  });

  it('shows load errors', () => {
    recipeService.getAllRecipes.mockReturnValueOnce(throwError(() => new Error('boom')));

    fixture = TestBed.createComponent(RecipeListPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar las recetas.');
  });
});
