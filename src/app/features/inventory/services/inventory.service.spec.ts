import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { InventoryItemRequest } from '../models/inventory-item.model';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/inventory`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InventoryService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(InventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists inventory items with an optional location filter', () => {
    service.getAll('PANTRY').subscribe(items => {
      expect(items).toEqual([]);
    });

    const request = httpMock.expectOne(req =>
      req.method === 'GET' &&
      req.url === baseUrl &&
      req.params.get('location') === 'PANTRY'
    );

    request.flush([]);
  });

  it('creates, updates and deletes inventory items through the API', () => {
    const payload: InventoryItemRequest = {
      portion: {
        foodId: 101,
        quantity: 2,
        unit: 'UNIT',
        weightPerUnit: 60,
      },
      location: 'PANTRY',
    };

    service.create(payload).subscribe(item => {
      expect(item.id).toBe(7);
    });
    httpMock.expectOne(baseUrl).flush({ id: 7, ...payload });

    service.update(7, { ...payload, location: 'FRIDGE' }).subscribe(item => {
      expect(item.location).toBe('FRIDGE');
    });
    const updateRequest = httpMock.expectOne(`${baseUrl}/7`);
    expect(updateRequest.request.method).toBe('PUT');
    updateRequest.flush({ id: 7, ...payload, location: 'FRIDGE' });

    service.delete(7).subscribe(result => {
      expect(result).toBeNull();
    });
    const deleteRequest = httpMock.expectOne(`${baseUrl}/7`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
  });
});
