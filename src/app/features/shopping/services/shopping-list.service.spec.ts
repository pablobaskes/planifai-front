import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { ShoppingList } from '../models/shopping-list.model';
import { ShoppingListService } from './shopping-list.service';

describe('ShoppingListService', () => {
  let service: ShoppingListService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/shopping-lists`;
  const dietShoppingBaseUrl = `${environment.apiUrl}/diets/42/shopping-lists`;

  const list: ShoppingList = {
    id: 1,
    weekStart: '2026-05-11',
    status: 'PENDING',
    items: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ShoppingListService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ShoppingListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('generates and loads the current shopping list', () => {
    service.generateCurrent(42).subscribe(response => {
      expect(response).toEqual(list);
    });
    const generateRequest = httpMock.expectOne(`${dietShoppingBaseUrl}/generate`);
    expect(generateRequest.request.method).toBe('POST');
    generateRequest.flush(list);

    service.getCurrent().subscribe(response => {
      expect(response.id).toBe(1);
    });
    const currentRequest = httpMock.expectOne(`${baseUrl}/current`);
    expect(currentRequest.request.method).toBe('GET');
    currentRequest.flush(list);
  });

  it('purchases one item and all items', () => {
    service.purchaseItem(12).subscribe(response => {
      expect(response.status).toBe('PENDING');
    });
    const itemRequest = httpMock.expectOne(`${baseUrl}/items/12/purchase`);
    expect(itemRequest.request.method).toBe('PATCH');
    itemRequest.flush(list);

    service.purchaseAll().subscribe(response => {
      expect(response).toEqual(list);
    });
    const allRequest = httpMock.expectOne(`${baseUrl}/purchase-all`);
    expect(allRequest.request.method).toBe('PATCH');
    allRequest.flush(list);
  });
});
