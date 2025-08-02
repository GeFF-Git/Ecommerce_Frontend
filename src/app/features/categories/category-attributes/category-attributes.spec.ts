import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryAttributes } from './category-attributes';

describe('CategoryAttributes', () => {
  let component: CategoryAttributes;
  let fixture: ComponentFixture<CategoryAttributes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryAttributes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryAttributes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
