import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { DietService } from '../../services/diet.service';
import { DietCreatePage } from './diet-create-page';

describe('DietCreatePage', () => {
  let component: DietCreatePage;
  let fixture: ComponentFixture<DietCreatePage>;
  let dietService: {
    createDiet: ReturnType<typeof vi.fn>;
  };
  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    dietService = {
      createDiet: vi.fn().mockReturnValue(of({
        id: 1,
        name: 'Wave 1 Diet',
        description: 'Generated',
        caloriesTarget: 2000,
        initDate: '2026-05-11',
        endDate: '2026-05-17',
        days: [],
      })),
    };
    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [DietCreatePage],
      providers: [
        { provide: DietService, useValue: dietService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DietCreatePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submits a diet and redirects to the calendar', () => {
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
    expect(router.navigate).toHaveBeenCalledWith(['/diet/calendar']);
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
});
