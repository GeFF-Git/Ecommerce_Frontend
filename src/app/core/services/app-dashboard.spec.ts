import { TestBed } from '@angular/core/testing';

import { AppDashboard } from './app-dashboard';

describe('AppDashboard', () => {
  let service: AppDashboard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppDashboard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
