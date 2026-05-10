import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { DietRequest } from '../models/diet.model';
import { DietService } from './diet.service';

describe('DietService', () => {
  let service: DietService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/diets`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DietService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(DietService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates a diet through the API', () => {
    const request: DietRequest = {
      name: 'Wave 1 Diet',
      description: 'Generated',
      caloriesTarget: 2000,
      initDate: '2026-05-11',
      endDate: '2026-05-17',
    };

    service.createDiet(request).subscribe(diet => {
      expect(diet.id).toBe(1);
      expect(diet.name).toBe('Wave 1 Diet');
    });

    const httpRequest = httpMock.expectOne(baseUrl);
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toEqual(request);
    httpRequest.flush({ id: 1, ...request, days: [] });
  });

  it('overrides a meal slot recipe through the API', () => {
    service.overrideMealSlotRecipe(10, 20).subscribe(slot => {
      expect(slot.id).toBe(10);
      expect(slot.recipe.id).toBe(20);
    });

    const httpRequest = httpMock.expectOne(`${environment.apiUrl}/meal-slots/10/recipe`);
    expect(httpRequest.request.method).toBe('PATCH');
    expect(httpRequest.request.body).toEqual({ recipeId: 20 });
    httpRequest.flush({
      id: 10,
      type: 'LUNCH',
      recipe: {
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
    });
  });
});
