import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DietService } from '../../../diet/services/diet.service';
import { ShoppingList } from '../../models/shopping-list.model';
import { ShoppingListService } from '../../services/shopping-list.service';
import { ShoppingListPage } from './shopping-list-page';

describe('ShoppingListPage', () => {
  let fixture: ComponentFixture<ShoppingListPage>;
  let service: {
    generateCurrent: ReturnType<typeof vi.fn>;
    getCurrent: ReturnType<typeof vi.fn>;
    purchaseItem: ReturnType<typeof vi.fn>;
    purchaseAll: ReturnType<typeof vi.fn>;
  };
  let dietService: {
    getDietsByDateRange: ReturnType<typeof vi.fn>;
  };

  const list: ShoppingList = {
    id: 1,
    weekStart: '2026-05-11',
    status: 'PENDING',
    items: [
      {
        id: 12,
        foodId: 5,
        foodName: 'Arroz',
        requiredQuantity: 700,
        availableQuantity: 500,
        missingQuantity: 200,
        unit: 'G',
        purchased: false,
      },
    ],
  };

  beforeEach(async () => {
    service = {
      generateCurrent: vi.fn().mockReturnValue(of(list)),
      getCurrent: vi.fn().mockReturnValue(of(list)),
      purchaseItem: vi.fn().mockReturnValue(of({ ...list, status: 'COMPLETED' })),
      purchaseAll: vi.fn().mockReturnValue(of({ ...list, status: 'COMPLETED' })),
    };
    dietService = {
      getDietsByDateRange: vi.fn().mockReturnValue(of([
        {
          id: 42,
          name: 'Dieta semanal',
          description: 'Wave 1',
          caloriesTarget: 2000,
          initDate: '2026-05-11',
          endDate: '2026-05-17',
          days: [],
        },
      ])),
    };

    await TestBed.configureTestingModule({
      imports: [ShoppingListPage],
      providers: [
        { provide: ShoppingListService, useValue: service },
        { provide: DietService, useValue: dietService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingListPage);
    fixture.detectChanges();
  });

  it('loads and renders the current shopping list', () => {
    expect(dietService.getDietsByDateRange).toHaveBeenCalled();
    expect(service.getCurrent).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Arroz');
    expect(fixture.nativeElement.textContent).toContain('200 G');
  });

  it('generates and purchases shopping list items', () => {
    const component = fixture.componentInstance;

    component['selectDiet']('42');
    component['generateCurrent']();
    expect(service.generateCurrent).toHaveBeenCalledWith(42);

    component['purchaseItem'](list.items[0]);
    expect(service.purchaseItem).toHaveBeenCalledWith(12);

    component['purchaseAll']();
    expect(service.purchaseAll).toHaveBeenCalled();
  });

  it('requires a selected diet before generating', () => {
    const component = fixture.componentInstance;

    component['selectDiet']('');
    component['generateCurrent']();
    fixture.detectChanges();

    expect(service.generateCurrent).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Selecciona una dieta para generar la lista de la compra.');
  });

  it('shows an empty state when the current list is missing', () => {
    service.getCurrent.mockReturnValueOnce(throwError(() => new Error('missing')));

    const errorFixture = TestBed.createComponent(ShoppingListPage);
    errorFixture.detectChanges();

    expect(errorFixture.nativeElement.textContent).toContain('No hay lista cargada.');
  });
});
