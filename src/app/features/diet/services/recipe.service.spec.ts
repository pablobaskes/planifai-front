import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { RecipeService } from './recipe.service';

describe('RecipeService', () => {
  let service: RecipeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecipeService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(RecipeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads recipes from the API', () => {
    service.getAllRecipes().subscribe(recipes => {
      expect(recipes.length).toBe(1);
      expect(recipes[0].name).toBe('Arroz');
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/recipes`);
    expect(request.request.method).toBe('GET');
    request.flush([
      {
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
      },
    ]);
  });
});
