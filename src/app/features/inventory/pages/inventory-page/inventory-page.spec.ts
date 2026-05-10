import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { InventoryItem } from '../../models/inventory-item.model';
import { InventoryService } from '../../services/inventory.service';
import { InventoryPage } from './inventory-page';

describe('InventoryPage', () => {
  let fixture: ComponentFixture<InventoryPage>;
  let service: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const item: InventoryItem = {
    id: 1,
    portion: {
      foodId: 101,
      foodName: 'Rice',
      quantity: 2,
      unit: 'KG',
    },
    location: 'PANTRY',
  };

  beforeEach(async () => {
    service = {
      getAll: vi.fn().mockReturnValue(of([item])),
      create: vi.fn().mockReturnValue(of(item)),
      update: vi.fn().mockReturnValue(of(item)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [InventoryPage],
      providers: [
        { provide: InventoryService, useValue: service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryPage);
    fixture.detectChanges();
  });

  it('loads and renders inventory items', () => {
    expect(service.getAll).toHaveBeenCalledWith(undefined);
    expect(fixture.nativeElement.textContent).toContain('Rice');
    expect(fixture.nativeElement.textContent).toContain('2 KG');
  });

  it('creates an inventory item and refreshes the list', () => {
    const component = fixture.componentInstance;
    const form = component['inventoryForm'];

    form.setValue({
      foodId: 202,
      quantity: 4,
      unit: 'UNIT',
      weightPerUnit: 60,
      location: 'FRIDGE',
    });

    component['saveItem']();

    expect(service.create).toHaveBeenCalledWith({
      portion: {
        foodId: 202,
        quantity: 4,
        unit: 'UNIT',
        weightPerUnit: 60,
      },
      location: 'FRIDGE',
    });
    expect(service.getAll).toHaveBeenCalledTimes(2);
  });

  it('shows an error state when loading fails', () => {
    service.getAll.mockReturnValueOnce(throwError(() => new Error('boom')));

    const errorFixture = TestBed.createComponent(InventoryPage);
    errorFixture.detectChanges();

    expect(errorFixture.nativeElement.textContent).toContain('No se pudo completar la operacion.');
  });
});
