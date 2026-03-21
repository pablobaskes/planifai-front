import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietCalendar } from './diet-calendar';

describe('DietCalendar', () => {
  let component: DietCalendar;
  let fixture: ComponentFixture<DietCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietCalendar],
    }).compileComponents();

    fixture = TestBed.createComponent(DietCalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
