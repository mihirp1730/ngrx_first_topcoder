import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { DataPackagesService } from '@apollo/app/services/data-packages';
import { NotificationService } from '@apollo/app/ui/notification';
import { of } from 'rxjs';

import { mockDataPackagesService, mockRouter, mockNotificationService } from '../shared/services.mock';
import { PackageResolver } from './package.resolver';

jest.mock('./helpers/package.helper', () => {
  return {
    transformPackage: jest.fn((dp, mr) => {
      if (!dp) {
        return null;
      }

      return {};
    })
  };
});

describe('PackageResolver', () => {
  let resolver: PackageResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DataPackagesService,
          useValue: mockDataPackagesService
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        }
      ]
    });
    resolver = TestBed.inject(PackageResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  describe('resolve', () => {
    it('should return the information from the service', (done) => {
      resolver.resolve(({ params: { id: 'test-id' } } as unknown) as ActivatedRouteSnapshot).subscribe((response) => {
        expect(response).toEqual({});
        done();
      });
    });

    it('should toast message if no response from service', (done) => {
      mockDataPackagesService.getDataPackage.mockReturnValueOnce(of(null));
      resolver.resolve(({ params: { id: 'test-id' } } as unknown) as ActivatedRouteSnapshot).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
    });
  });
});
