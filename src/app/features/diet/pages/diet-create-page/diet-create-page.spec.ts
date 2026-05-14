import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { DietService } from '../../services/diet.service';
import { DietCreatePage } from './diet-create-page';

describe('DietCreatePage', () => {
  let component: DietCreatePage;
  let fixture: ComponentFixture<DietCreatePage>;
  let dietService: {
    createDiet: ReturnType<typeof vi.fn>;
    getAllDiets: ReturnType<typeof vi.fn>;
    deleteDiet: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    dietService = {
      getAllDiets: vi.fn().mockReturnValue(of([{
        id: 1,
        name: 'Wave 1 Diet',
        description: 'Generated',
        caloriesTarget: 2000,
        initDate: '2026-05-11',
        endDate: '2026-05-17',
        days: [],
      }])),
      createDiet: vi.fn().mockReturnValue(of({
        id: 1,
        name: 'Wave 1 Diet',
        description: 'Generated',
        caloriesTarget: 2000,
        initDate: '2026-05-11',
        endDate: '2026-05-17',
        days: [],
      })),
      deleteDiet: vi.fn().mockReturnValue(of(null)),
    };

    await TestBed.configureTestingModule({
      imports: [DietCreatePage],
      providers: [
        { provide: DietService, useValue: dietService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DietCreatePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads created diets', () => {
    fixture.detectChanges();

    expect(dietService.getAllDiets).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Wave 1 Diet');
    expect(fixture.nativeElement.textContent).toContain('2026-05-11 - 2026-05-17');
  });

  it('submits a diet and refreshes the list', () => {
    const form = component['dietForm'];

    form.setValue({
      name: ' Wave 1 Diet ',
      description: ' Generated ',
      initDate: '2026-05-11',
      endDate: '2026-05-17',
      caloriesTarget: 2000,
    });

    component['submit']();

    expect(dietService.createDiet).toHaveBeenCalledWith({
      name: 'Wave 1 Diet',
      description: 'Generated',
      initDate: '2026-05-11',
      endDate: '2026-05-17',
      caloriesTarget: 2000,
    });
    expect(dietService.getAllDiets).toHaveBeenCalled();
  });

  it('deletes a diet and refreshes the list', () => {
    const diet = {
      id: 1,
      name: 'Wave 1 Diet',
      caloriesTarget: 2000,
      initDate: '2026-05-11',
      endDate: '2026-05-17',
      days: [],
    };

    component['deleteDiet'](diet);

    expect(dietService.deleteDiet).toHaveBeenCalledWith(1);
    expect(dietService.getAllDiets).toHaveBeenCalled();
  });

  it('shows backend validation errors', () => {
    dietService.createDiet.mockReturnValueOnce(throwError(() => new HttpErrorResponse({
      error: { message: 'endDate cannot be before initDate.' },
      status: 400,
    })));
    const form = component['dietForm'];

    form.setValue({
      name: 'Invalid',
      description: '',
      initDate: '2026-05-17',
      endDate: '2026-05-11',
      caloriesTarget: 2000,
    });

    component['submit']();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('endDate cannot be before initDate.');
  });

  it('shows overlapping diet conflicts', () => {
    dietService.createDiet.mockReturnValueOnce(throwError(() => new HttpErrorResponse({
      error: { message: 'A diet already exists overlapping the requested range 2026-05-11 to 2026-05-17.' },
      status: 409,
    })));
    const form = component['dietForm'];

    form.setValue({
      name: 'Overlapping',
      description: '',
      initDate: '2026-05-11',
      endDate: '2026-05-17',
      caloriesTarget: 2000,
    });

    component['submit']();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('already exists overlapping');
  });
});
