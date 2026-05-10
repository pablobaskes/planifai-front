import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { FoodService } from './food.service';

describe('FoodService', () => {
  let service: FoodService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FoodService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(FoodService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads foods from the API', () => {
    service.getAllFoods().subscribe(foods => {
      expect(foods[0].name).toBe('Rice');
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/foods`);
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 101,
        name: 'Rice',
        category: 'GRAIN',
        caloriesPer100g: 130,
        proteinPer100g: 2.7,
        carbsPer100g: 28,
        fatPer100g: 0.3,
      },
    ]);
  });
});
