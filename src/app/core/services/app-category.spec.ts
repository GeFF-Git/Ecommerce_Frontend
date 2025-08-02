import { TestBed } from '@angular/core/testing';

import { AppCategory } from './app-category';

describe('AppCategory', () => {
  let service: AppCategory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppCategory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
