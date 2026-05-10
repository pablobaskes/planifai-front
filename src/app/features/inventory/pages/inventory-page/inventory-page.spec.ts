import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { InventoryItem } from '../../models/inventory-item.model';
import { InventoryService } from '../../services/inventory.service';
import { FoodService } from '../../../diet/services/food.service';
import { InventoryPage } from './inventory-page';

describe('InventoryPage', () => {
  let fixture: ComponentFixture<InventoryPage>;
  let service: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let foodService: {
    getAllFoods: ReturnType<typeof vi.fn>;
  };

  const item: InventoryItem = {
    id: 1,
    portion: {
      foodId: 101,
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
    foodService = {
      getAllFoods: vi.fn().mockReturnValue(of([
        {
          id: 101,
          name: 'Rice',
          category: 'GRAIN',
          caloriesPer100g: 130,
          proteinPer100g: 2.7,
          carbsPer100g: 28,
          fatPer100g: 0.3,
        },
      ])),
    };

    await TestBed.configureTestingModule({
      imports: [InventoryPage],
      providers: [
        { provide: InventoryService, useValue: service },
        { provide: FoodService, useValue: foodService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryPage);
    fixture.detectChanges();
  });

  it('loads and renders inventory items', () => {
    expect(service.getAll).toHaveBeenCalledWith(undefined);
    expect(foodService.getAllFoods).toHaveBeenCalled();
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
