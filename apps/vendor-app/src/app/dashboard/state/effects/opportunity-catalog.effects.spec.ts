import { TestBed } from '@angular/core/testing';
import { MetadataService } from '@apollo/app/metadata';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { OpportunityService } from '@apollo/app/services/opportunity';
import { NotificationService } from '@apollo/app/ui/notification';
import { VendorAppService } from '@apollo/app/vendor';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import * as mocks from '../../../shared/services.mock';
import { MapLargeHelperService } from '../../services/maplarge-helper.service';
import * as opportunityCatalogActions from '../actions/opportunity-catalog.actions';
import * as opportunityCatalogSelectors from '../selectors/opportunity-catalog.selectors';
import { OpportunityCatalogEffects } from './opportunity-catalog.effects';

describe('OpportunityCatalogEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: OpportunityCatalogEffects;
  let mockOpportunityService: OpportunityService;
  let mockMapLargeHelperService: MapLargeHelperService;
  let mockMetadataService: MetadataService;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            {
              selector: opportunityCatalogSelectors.selectOpportunities,
              value: [
                {
                  opportunityId: 'OP-VD7-klk823ismohb-239351910054'
                }
              ]
            },
            {
              selector: opportunityCatalogSelectors.selectPendingPublishOpportunityIds,
              value: ['123']
            },
            {
              selector: opportunityCatalogSelectors.selectMlConnectionInfo,
              value: {
                baseUrl: ['baseUrl'],
                userId: 'mlUser',
                accessToken: 'mlToken'
              }
            },
            {
              selector: opportunityCatalogSelectors.selectLayerMetadata,
              value: [
                {
                  shapeType: 'geo.dot',
                  layerName: 'Test',
                  displayName: 'Test',
                  maplargeTable: 'Test',
                  primaryKey: 'Test',
                  icon: 'Test'
                }
              ]
            }
          ]
        }),
        {
          provide: OpportunityService,
          useValue: mocks.mockOpportunityService
        },
        {
          provide: NotificationService,
          useValue: mocks.mockNotificationService
        },
        {
          provide: SecureEnvironmentService,
          useValue: mocks.mockSecureEnvironmentService
        },
        {
          provide: MetadataService,
          useValue: mocks.mockMetadataService
        },
        {
          provide: MapLargeHelperService,
          useValue: mocks.mockMapLargeHelperService
        },
        {
          provide: VendorAppService,
          useValue: {
            userContext: { crmAccountId: 'test-account-id' }
          }
        },
        OpportunityCatalogEffects
      ]
    });
    effects = TestBed.inject(OpportunityCatalogEffects);
    mockOpportunityService = TestBed.inject(OpportunityService);
    mockMapLargeHelperService = TestBed.inject(MapLargeHelperService);
    //mockMetadataService = TestBed.inject(MetadataService);
  });
  afterEach(() => {
    actions$.complete();
  });

  describe('getOpportunitiesList$', () => {
    it('should test getOpportunitiesList$ action', (done) => {
      effects.getOpportunitiesList$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Catalog] Update opportunities in store');
        done();
      });
      actions$.next(opportunityCatalogActions.getOpportunities({ isLoading: false }));
    });

    it('should call opportunity API if state of opportunity is not published', (done) => {
      effects.validatePublishStatus$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Catalog] Get Success');
        done();
      });
      actions$.next(opportunityCatalogActions.validatePublishStatus({ opportunities: [] }));
    });

    it('should call opportunity API if state of opportunity is not published', (done) => {
      effects.validatePublishStatus$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Catalog] Get all opportunity');
        done();
      });
      const action = { opportunities: [
        {
          opportunityId: "123",
          opportunityName: 'test',
          opportunityType: 'Public' as any,
          opportunityStatus: 'Publishing'
        }
      ]};
      actions$.next(opportunityCatalogActions.validatePublishStatus({ opportunities: action.opportunities }));
    });

    it('should return a getOpportunitiesFail action', (done) => {
      jest.spyOn(mockOpportunityService, 'getOpportunityList').mockImplementation(() => throwError(new Error('')));
      effects.getOpportunitiesList$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Catalog] Get Fail');
        done();
      });
      actions$.next(opportunityCatalogActions.getOpportunities({ isLoading: false }));
    });

    describe('getOpportunitiesFailed$', () => {
      it('should send out a notification with error', (done) => {
        effects.getOpportunitiesFailed$.pipe(take(1)).subscribe(() => {
          expect(mocks.mockNotificationService.send).toHaveBeenCalled();
          done();
        });
        actions$.next(opportunityCatalogActions.getOpportunitiesFail({ errorMessage: 'Something went wrong!' }));
      });
    });
  });

  describe('deleteOpportiunityFailed$', () => {
    it('should send out a notification with error', (done) => {
      effects.deleteOpportunityFailed$.pipe(take(1)).subscribe(() => {
        expect(mocks.mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityCatalogActions.deleteOpportunityFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('unpublishOpportunityFailed$', () => {
    it('should send out a notification with error', (done) => {
      effects.unPublishOpportunityFailed$.pipe(take(1)).subscribe(() => {
        expect(mocks.mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityCatalogActions.unPublishOpportunityFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('Data objects workflow', () => {
    it('should return a getMlConnectionInfoSuccess action', (done) => {
      effects.getMlConnectionInfo$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Catalog] Get mlConnectionInfo Success');
        done();
      });
      actions$.next(opportunityCatalogActions.getOpportunitiesSuccess({ opportunities: [] }));
    });

    it('should return a getMlConnectionInfoSuccess action', (done) => {
      jest.spyOn(mockMapLargeHelperService, 'getDeployment').mockImplementation(() => throwError(new Error('')));

      effects.getMlConnectionInfo$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Catalog] Get mlConnectionInfo Fail');
        done();
      });
      actions$.next(opportunityCatalogActions.getOpportunitiesSuccess({ opportunities: [] }));
    });

    it('should return a getActiveTablesSuccess action', (done) => {
      effects.getActiveTables$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Catalog] Get Active Tables Success');
        done();
      });
      actions$.next(opportunityCatalogActions.getMlConnectionInfoSuccess({ mlConnectionInfo: <any>{} }));
    });

    it('should return a getMlConnectionInfoFail action', (done) => {
      jest.spyOn(mockMapLargeHelperService, 'getActiveTables').mockImplementation(() => throwError(new Error('')));

      effects.getActiveTables$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Catalog] Get Active Tables Fail');
        done();
      });
      actions$.next(opportunityCatalogActions.getMlConnectionInfoSuccess({ mlConnectionInfo: <any>{} }));
    });

    it('should return a getLayerMetadata action', (done) => {
      effects.getLayerMetadata$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Catalog] Get Layer Metadata Success');
        done();
      });
      actions$.next(opportunityCatalogActions.getActiveTablesSuccess({ tables: [] }));
    });
    it('should return a getDataObjectCountSuccess action', (done) => {
      effects.getDataObjectCount$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Catalog] Get Data Object Count Success');
        done();
      });
      actions$.next(opportunityCatalogActions.getLayerMetadataSuccess({ layerMetadata: [<any>{ maplargeTable: 'test' }] }));
    });

    it('should return a getDataObjectCount Fail action', (done) => {
      jest.spyOn(mockMapLargeHelperService, 'getCountFromMl').mockImplementation(() => throwError(new Error('')));
      effects.getDataObjectCount$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Catalog] Get Data Object Count Fail');
        done();
      });
      actions$.next(opportunityCatalogActions.getLayerMetadataSuccess({ layerMetadata: [<any>{ maplargeTable: 'test' }] }));
    });
  });
});
