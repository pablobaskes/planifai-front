import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietCreatePage } from './diet-create-page';

describe('DietCreatePage', () => {
  let component: DietCreatePage;
  let fixture: ComponentFixture<DietCreatePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietCreatePage],
    }).compileComponents();

    fixture = TestBed.createComponent(DietCreatePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
