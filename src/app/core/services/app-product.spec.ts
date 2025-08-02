import { TestBed } from '@angular/core/testing';

import { AppProduct } from './app-product';

describe('AppProduct', () => {
  let service: AppProduct;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppProduct);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
