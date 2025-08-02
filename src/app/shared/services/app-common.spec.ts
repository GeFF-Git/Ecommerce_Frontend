import { TestBed } from '@angular/core/testing';

import { AppCommon } from './app-common';

describe('AppCommon', () => {
  let service: AppCommon;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppCommon);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
