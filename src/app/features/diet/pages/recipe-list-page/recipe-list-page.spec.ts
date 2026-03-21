import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeListPage } from './recipe-list-page';

describe('RecipeListPage', () => {
  let component: RecipeListPage;
  let fixture: ComponentFixture<RecipeListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeListPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
