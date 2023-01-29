import { TestBed } from '@angular/core/testing';
import { UserService } from '@delfi-gui/components';
import { of } from 'rxjs';

import { UserContextService } from './user-context.service';
import { mockUserService } from '../services.mock';

describe('UserContextService', () => {
  let service: UserContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: mockUserService
        }
      ]
    });

    service = TestBed.inject(UserContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should populate context', (done) => {
    const mockContext = {};
    mockUserService.getContext.mockReturnValueOnce(of(mockContext));
    service.loadContext().subscribe((context) => {
      expect(service.userContext).toEqual(context);
      done();
    });
  });
});
