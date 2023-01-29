import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { PackageStatuses, ResultsResponseResult } from '@apollo/api/data-packages/vendor';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { MetadataService } from '@apollo/app/metadata';
import { WindowRef } from '@apollo/app/ref';
import { DataPackagesService } from '@apollo/app/services/data-packages';
import { NotificationService } from '@apollo/app/ui/notification';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { of, throwError } from 'rxjs';

import { mockDataPackagesService, mockGoogleAnalyticsService, mockMetadataService, mockNotificationService } from '../../shared/services.mock';
import { VendorDashboardComponent } from './vendor-dashboard.component';

const selectedPackage: ResultsResponseResult = {
  id: 'pkgId1',
  name: 'pkg_name',
  status: PackageStatuses.Draft,
  image: null,
  dataType: [],
  region: null,
  createdBy: '',
  createdOn: '',
  lastUpdatedBy: '',
  lastUpdatedOn: '',
  subscriptionsActive: 0,
  subscriptionsPending: 1
};

const mockWindowRef = {
  nativeWindow: {
    location: {
      reload: jest.fn()
    }
  }
};

describe('VendorDashboardComponent', () => {
  let component: VendorDashboardComponent;
  let fixture: ComponentFixture<VendorDashboardComponent>;
  let dataPackagesService: DataPackagesService;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VendorDashboardComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        {
          provide: NotificationService,
          useValue: mockNotificationService
        },
        {
          provide: DataPackagesService,
          useValue: mockDataPackagesService
        },
        {
          provide: MetadataService,
          useValue: mockMetadataService
        },
        {
          provide: DELFI_USER_CONTEXT,
          useValue: {
            crmAccountId: 'test-account-id'
          }
        },
        {
          provide: GoogleAnalyticsService,
          useValue: mockGoogleAnalyticsService
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => {
              return {
                componentInstance: {
                  yesClickEvent: of({})
                }
              };
            }
          }
        },
        {
          provide: WindowRef,
          useValue: mockWindowRef
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockStore = TestBed.inject(Store) as MockStore;
    dataPackagesService = TestBed.inject(DataPackagesService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show toast', () => {
    jest.spyOn(dataPackagesService, 'getDataPackages').mockReturnValue(throwError({ status: 404 }));
    component.populateDataPackageCards();
    expect(component.showLoader).toBeFalsy();
  });

  it('should handle errors when deleting drafts', () => {
    jest.spyOn(dataPackagesService, 'deleteDraftPackage').mockReturnValue(throwError({ status: 404, error: { message: 'Api error' } }));
    component.deletePackage(selectedPackage);

    expect(mockNotificationService.send).toHaveBeenCalled();
  });

  it('should delete package', () => {
    const mockFilters = {
      filters: {
        status: [],
        regions: [],
        dataType: []
      }
    };
    jest.spyOn(dataPackagesService, 'deleteDraftPackage').mockReturnValue(of({}));
    jest.spyOn(mockStore, 'select').mockReturnValue(of(mockFilters));
    const getDataPackagesSpy = jest.spyOn(dataPackagesService, 'getDataPackages').mockReturnValue(of([]));
    jest.useFakeTimers();
    component.deletePackage(selectedPackage);
    jest.runAllTimers();
    expect(getDataPackagesSpy).toHaveBeenCalled();
  });

  it('should unpublish package', () => {
    const mockFilters = {
      filters: {
        status: [],
        regions: [],
        dataType: []
      }
    };

    jest.spyOn(dataPackagesService, 'unpublishPackage').mockReturnValue(of({}));
    jest.spyOn(mockStore, 'select').mockReturnValue(of(mockFilters));
    const getDataPackagesSpy = jest.spyOn(dataPackagesService, 'getDataPackages').mockReturnValue(of([]));
    jest.useFakeTimers();
    component.unpublishPackage(selectedPackage);
    jest.runAllTimers();
    expect(getDataPackagesSpy).toHaveBeenCalled();
  });

  it('should handle errors when unpublish package', () => {
    jest.spyOn(dataPackagesService, 'unpublishPackage').mockReturnValue(throwError({ status: 404, error: {} }));
    component.unpublishPackage(selectedPackage);

    expect(mockNotificationService.send).toHaveBeenCalled();
  });
});
