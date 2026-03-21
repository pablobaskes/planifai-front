import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietCalendarPage } from './diet-calendar-page';

describe('DietCalendarPage', () => {
  let component: DietCalendarPage;
  let fixture: ComponentFixture<DietCalendarPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietCalendarPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DietCalendarPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
