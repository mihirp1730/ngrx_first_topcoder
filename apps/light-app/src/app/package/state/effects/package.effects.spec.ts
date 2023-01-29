import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DataPackage } from '@apollo/api/data-packages/consumer';
import { AuthUser } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { ConsumerSubscriptionService } from '@apollo/app/services/consumer-subscription';
import { DataPackagesService, IGetDataPackageResponse } from '@apollo/app/services/data-packages';
import { DataSubscriptionService } from '@apollo/app/services/data-subscription';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import { NotificationService } from '@apollo/app/ui/notification';
import { IDataVendor, VendorAppService } from '@apollo/app/vendor';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { of, ReplaySubject, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import * as mapWrapperActions from '../../../map-wrapper/state/actions/map-wrapper.actions';
import * as mocks from '../../../shared/services.mock';
import { ContentDownloaderService } from '../../../subscription/services/content-downloader.service';
import * as packageActions from '../actions/package.actions';
import * as packageSelectors from '../selectors/package.selectors';
import { PackageEffects } from './package.effects';

describe('PackageEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: PackageEffects;
  let mockStore: MockStore;
  let mockConsumerSubscriptionService: mocks.MockConsumerSubscriptionService;
  let mockContentDownloaderService: mocks.MockContentDownloaderService;
  let mockDataPackagesService: mocks.MockDataPackagesService;
  let mockNotificationService: mocks.MockNotificationService;
  let mockDataSubscriptionService: mocks.MockDataSubscriptionService;
  let mockVendorAppService: mocks.MockVendorAppService;
  let mockMediaDownloadService: mocks.MockMediaDownloadService;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            {
              selector: packageSelectors.selectSelectedProfileId,
              value: null
            },
            {
              selector: packageSelectors.deduceDataPackageSubscriptionRequestPayload,
              value: null
            }
          ]
        }),
        {
          provide: AuthCodeFlowService,
          useValue: mocks.mockAuthCodeFlowService
        },
        {
          provide: MatDialog,
          useValue: mocks.mockMatDialogModal
        },
        {
          provide: ConsumerSubscriptionService,
          useClass: mocks.MockConsumerSubscriptionService
        },
        {
          provide: ContentDownloaderService,
          useClass: mocks.MockContentDownloaderService
        },
        {
          provide: DataPackagesService,
          useClass: mocks.MockDataPackagesService
        },
        {
          provide: GoogleAnalyticsService,
          useClass: mocks.MockGoogleAnalyticsService
        },
        {
          provide: NotificationService,
          useClass: mocks.MockNotificationService
        },
        {
          provide: DataSubscriptionService,
          useClass: mocks.MockDataSubscriptionService
        },
        {
          provide: VendorAppService,
          useValue: mocks.mockVendorAppService
        },
        {
          provide: MediaDownloadService,
          useValue: mocks.mockMediaDownloadService
        },
        PackageEffects
      ]
    });
    effects = TestBed.inject(PackageEffects);
    mockStore = TestBed.inject(Store) as unknown as MockStore;
    mockConsumerSubscriptionService = TestBed.inject(ConsumerSubscriptionService) as unknown as mocks.MockConsumerSubscriptionService;
    mockContentDownloaderService = TestBed.inject(ContentDownloaderService) as unknown as mocks.MockContentDownloaderService;
    mockDataPackagesService = TestBed.inject(DataPackagesService) as unknown as mocks.MockDataPackagesService;
    mockNotificationService = TestBed.inject(NotificationService) as unknown as mocks.MockNotificationService;
    mockDataSubscriptionService = TestBed.inject(DataSubscriptionService) as unknown as mocks.MockDataSubscriptionService;
    mockVendorAppService = TestBed.inject(VendorAppService) as unknown as mocks.MockVendorAppService;
    mockMediaDownloadService = TestBed.inject(MediaDownloadService) as unknown as mocks.MockMediaDownloadService;
  });
  afterEach(() => {
    actions$.complete();
  });

  describe('handleNavigatingAwayFromPackage$', () => {
    it('should return a userNavigatedAwayFromPackage action', (done) => {
      effects.handleNavigatingAwayFromPackage$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual({
          type: '[Package] User Navigated Away From Package'
        });
        done();
      });
      actions$.next(mapWrapperActions.closeSidepanel());
    });
  });

  describe('downloadSelectedPackage$', () => {
    it('should start a download', (done) => {
      mockContentDownloaderService.download.mockReturnValue(Promise.resolve());
      effects.downloadSelectedPackage$.pipe(take(1)).subscribe((action) => {
        expect(mockContentDownloaderService.download).toHaveBeenCalled();
        expect(action.type).toBe('[Package] User Downloads Selected Package Done Processing');
        done();
      });
      actions$.next(packageActions.userDownloadsSelectedPackage());
      mockConsumerSubscriptionService._getConsumerSubscriptions.next([{}]);
    });
  });

  describe('userDownloadsSelectedPackageNoSubscription$', () => {
    it('should send out a notification', (done) => {
      effects.userDownloadsSelectedPackageNoSubscription$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(packageActions.userDownloadsSelectedPackageWithNoSubscription());
    });
  });

  describe('lookupSelectedProfile$', () => {
    it('should filter out null values', (done) => {
      effects.lookupSelectedProfile$.pipe(take(1)).subscribe(() => {
        throw new Error('should not be called');
      });
      mockStore.setState({});
      expect(mockDataPackagesService.getConsumerDataPackage).not.toHaveBeenCalled();
      setTimeout(() => done());
    });
    it('should handle a consumer data package', (done) => {
      mockStore.overrideSelector(packageSelectors.selectSelectedProfileId, '');
      mockDataPackagesService.getConsumerDataPackage.mockReturnValue(
        of({
          dataPackageProfile: {
            dataPackageProfileId: 'test-id'
          },
          subscription: [],
          dataPackageStatus: 'Published',
          dataPackageStatusState: 'Success'
        }) as unknown as DataPackage
      );
      mockDataPackagesService.getPublishedDataPackageById.mockReturnValue(
        of({
          dataPackageProfile: {
            profile: {
              media: [
                { fileId: 'test1', caption: 'caption1' },
                { fileId: 'test2', caption: 'caption2' }
              ]
            }
          },
          vendorId: 'vendor-test'
        } as unknown as IGetDataPackageResponse)
      );
      mockVendorAppService.retrieveDataVendors.mockReturnValue(of([{ dataVendorId: 'vendor-test', name: 'vendorTest' } as IDataVendor]));
      mockMediaDownloadService.downloadMedia.mockReturnValue(of(['']));
      effects.lookupSelectedProfile$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Package] Loaded Selected Package');
        expect(action['dataPackage']).toEqual({
          dataPackageProfile: {
            dataPackageProfileId: 'test-id',
            profile: {
              media: [
                { caption: 'caption1', signedUrl: [''] },
                { caption: 'caption2', signedUrl: [''] }
              ]
            }
          },
          dataPackageStatus: 'Published',
          dataPackageStatusState: 'Success',
          subscription: [],
          vendorId: 'vendor-test',
          vendorName: 'vendorTest'
        });
        done();
      });
      mockStore.setState({});
      expect(mockDataPackagesService.getConsumerDataPackage).toHaveBeenCalled();
      expect(mockDataPackagesService.getPublishedDataPackageById).toHaveBeenCalled();
      expect(mockVendorAppService.retrieveDataVendors).toHaveBeenCalled();
      expect(mockMediaDownloadService.downloadMedia).toHaveBeenCalled();
    });
    it('should handle a consumer data package with errors', (done) => {
      mockStore.overrideSelector(packageSelectors.selectSelectedProfileId, '');
      mockDataPackagesService.getConsumerDataPackage.mockReturnValue(of({}));
      effects.lookupSelectedProfile$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Package] Loaded Selected Package With Error');
        done();
      });
      mockStore.setState({});
      expect(mockDataPackagesService.getConsumerDataPackage).toHaveBeenCalled();
    });
  });

  describe('lookupSelectedProfileWithError$', () => {
    it('should send out a notification', (done) => {
      const errorMessage = null;
      effects.lookupSelectedProfileWithError$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(packageActions.loadedSelectedPackageWithError({ errorMessage }));
    });
    it('should send out a notification with a custom message', (done) => {
      const errorMessage = uuid();
      effects.lookupSelectedProfileWithError$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalledWith({
          severity: 'Error',
          title: 'Package Profile',
          message: errorMessage
        });
        done();
      });
      actions$.next(packageActions.loadedSelectedPackageWithError({ errorMessage }));
    });
  });

  describe('requestPackageSubscription$', () => {
    it('should handle any responses from createSubscriptionRequests', (done) => {
      const comment = uuid();
      const company = uuid();
      const mockRequestPayload = {
        selectedProfileId: uuid(),
        selectedPackageProfileVendorId: uuid()
      };
      const mockSubscriptionRequest = uuid();
      mockStore.overrideSelector(packageSelectors.deduceDataPackageSubscriptionRequestPayload, mockRequestPayload);
      mockDataSubscriptionService.createSubscriptionRequests.mockReturnValue(of(mockSubscriptionRequest));
      effects.requestPackageSubscription$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Package] User Requests Package Subscription Completed');
        expect(mockDataSubscriptionService.createSubscriptionRequests).toHaveBeenCalled();
        done();
      });
      actions$.next(packageActions.userRequestsPackageSubscription({ comment, company }));
    });
    it('should handle any errors from createSubscriptionRequests', (done) => {
      const comment = uuid();
      const company = uuid();
      const mockRequestPayload = {
        selectedProfileId: uuid(),
        selectedPackageProfileVendorId: uuid()
      };
      const mockError = uuid();
      mockStore.overrideSelector(packageSelectors.deduceDataPackageSubscriptionRequestPayload, mockRequestPayload);
      mockDataSubscriptionService.createSubscriptionRequests.mockReturnValue(throwError(mockError));
      effects.requestPackageSubscription$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Package] User Requests Package Subscription With Error');
        expect(mockDataSubscriptionService.createSubscriptionRequests).toHaveBeenCalled();
        done();
      });
      actions$.next(packageActions.userRequestsPackageSubscription({ comment, company }));
    });
  });

  describe('requestPackageSubscriptionCompleted$', () => {
    it('should send out a notification', (done) => {
      effects.requestPackageSubscriptionCompleted$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(packageActions.userRequestsPackageSubscriptionCompleted());
    });
  });

  describe('requestPackageSubscriptionWithError$', () => {
    it('should send out a notification', (done) => {
      const errorMessage = null;
      effects.requestPackageSubscriptionWithError$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(packageActions.userRequestsPackageSubscriptionWithError({ errorMessage }));
    });
    it('should send out a notification with a custom message', (done) => {
      const errorMessage = uuid();
      effects.requestPackageSubscriptionWithError$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalledWith({
          severity: 'Error',
          title: 'Package Profile',
          message: errorMessage
        });
        done();
      });
      actions$.next(packageActions.userRequestsPackageSubscriptionWithError({ errorMessage }));
    });
  });

  describe('userSelectedNonpublicPackage$', () => {
    it('should handle any responses from createSubscriptionRequests', (done) => {
      const id = uuid();
      const mockGetUser = of({ isGuest: true } as AuthUser);
      mocks.mockAuthCodeFlowService.getUser.mockReturnValue(mockGetUser);
      effects.userSelectedNonpublicPackage$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toBe('[Package] User Selected Nonpublic Package As Guest');
        done();
      });
      actions$.next(packageActions.userSelectedNonpublicPackage({ id }));
    });
    it('should handle any errors from createSubscriptionRequests', (done) => {
      const id = uuid();
      const mockGetUser = of({ isGuest: false } as AuthUser);
      mocks.mockAuthCodeFlowService.getUser.mockReturnValue(mockGetUser);
      effects.userSelectedNonpublicPackage$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toBe('[Package] User Selected Package');
        expect(action.id).toBe(id);
        done();
      });
      actions$.next(packageActions.userSelectedNonpublicPackage({ id }));
    });
  });

  describe('userSelectedNonpublicPackageAsGuest$', () => {
    it('should open a modal', (done) => {
      effects.userSelectedNonpublicPackageAsGuest$.pipe(take(1)).subscribe(() => {
        expect(mocks.mockMatDialogModal.open).toHaveBeenCalled();
        done();
      });
      actions$.next(packageActions.userSelectedNonpublicPackageAsGuest());
    });
  });
});
