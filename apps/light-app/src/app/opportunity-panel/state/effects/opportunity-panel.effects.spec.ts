import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@apollo/app/ref';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { of, ReplaySubject, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import { GisMapLargeService } from '@slb-innersource/gis-canvas';

import { mockGisMapLargeService, MockHighlightDirective, mockMapLargeHelperService } from '../../../shared/services.mock';
import { HighlightDirective } from '../../directive/highlight.directive';
import { OpportunityPanelService } from '../../services/opportunity-panel.service';
import * as opportunityPanelActions from '../actions/opportunity-panel.actions';
import * as opportunityPanelSelectors from '../selectors/opportunity-panel.selectors';
import { OpportunityPanelEffects } from './opportunity-panel.effects';
import { MapLargeHelperService } from '../../services/maplarge-helper.service';

class MockOpportunityPanelService {
  runMapLargeQuery = jest.fn().mockReturnValue(of([]));
  zoomToExtents = jest.fn();
  getCountRunner = jest.fn();
  getOpportunitiesOnLoad = jest.fn().mockReturnValue(of([]));
  getTableName = jest.fn();
}

const mockWindowRef = {
  nativeWindow: {
    location: {
      assign: jest.fn()
    }
  }
};

describe('OpportunityPanelEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: OpportunityPanelEffects;
  let mockOpportunityPanelService: MockOpportunityPanelService;
  let mockHighlightOnHoverDirective: MockHighlightDirective;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            {
              selector: opportunityPanelSelectors.selectOpportunities,
              value: []
            },
            {
              selector: opportunityPanelSelectors.selectSearchTerm,
              value: 'test'
            },
            {
              selector: opportunityPanelSelectors.selectFilterWhereClause,
              value: [
                {
                  col: 'Asset',
                  test: 'EqualAny',
                  value: 'test'
                }
              ]
            },
            {
              selector: opportunityPanelSelectors.selectLassoArea,
              value: 'test(long, lat)'
            },
            {
              selector: opportunityPanelSelectors.selectFilteredLayers,
              value: ['Asset']
            },
            {
              selector: opportunityPanelSelectors.selectCurrentPageNumber,
              value: 2
            },
            {
              selector: opportunityPanelSelectors.selectIsFilterSelected,
              value: true
            },
            {
              selector: opportunityPanelSelectors.selectFilteredOpportunities,
              value: []
            },
            {
              selector: opportunityPanelSelectors.selectIsMapLoaded,
              value: true
            },
            {
              selector: opportunityPanelSelectors.selectUseMapExtents,
              value: true
            },
            {
              selector: opportunityPanelSelectors.dataOpportunityWorkFlow,
              value: true
            },
            {
              selector: opportunityPanelSelectors.selectMlConnectionInfo,
              value: {
                accessToken: "testtoken",
                baseUrl: "testurl",
                userId: "test_user"
              }
            }
          ]
        }),
        OpportunityPanelEffects,
        {
          provide: OpportunityPanelService,
          useClass: MockOpportunityPanelService
        },
        {
          provide: WindowRef,
          useValue: mockWindowRef
        },
        {
          provide: HighlightDirective,
          useClass: MockHighlightDirective
        },
        {
          provide: GisMapLargeService,
          useValue: mockGisMapLargeService
        },
        {
          provide: MapLargeHelperService,
          useValue: mockMapLargeHelperService
        }
      ]
    });
    effects = TestBed.inject(OpportunityPanelEffects);
    mockOpportunityPanelService = TestBed.inject(OpportunityPanelService) as unknown as MockOpportunityPanelService;
    mockHighlightOnHoverDirective = TestBed.inject(HighlightDirective) as unknown as MockHighlightDirective;
    // mockMapLargeHelperService = TestBed.inject(MapLargeHelperService) as unknown as MockMapLargeHelperService;
  });

  afterEach(() => {
    actions$.complete();
  });

  describe('getOpportunities$', () => {
    it('should return a getOpportunities action', (done) => {
      effects.getAllOpportunities$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Panel] Get Opportunities Success');
        done();
      });
      actions$.next(opportunityPanelActions.isMapLoaded({} as any));
    });
    it('should return a getOpportunitiesFail action', (done) => {
      mockOpportunityPanelService.runMapLargeQuery.mockImplementation(() => throwError(new Error('')));

      effects.getAllOpportunities$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Panel] Get Opportunities Fail');
        done();
      });
      actions$.next(opportunityPanelActions.isMapLoaded({} as any));
    });

    it('should return a getFilteredOpportunities action', (done) => {
      effects.getFilteredOpportunities$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Panel] get Filtered Opportunities Success');
        done();
      });
      actions$.next(opportunityPanelActions.setLayerAttributes({} as any));
    });

    it('should return a getOpportunitiesFail action', (done) => {
      mockOpportunityPanelService.runMapLargeQuery.mockImplementation(() => throwError(new Error('')));

      effects.getFilteredOpportunities$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Panel] get Filtered Opportunities Fail');
        done();
      });
      actions$.next(opportunityPanelActions.setLayerAttributes({} as any));
    });
  });

  describe('zoomAndHighlightOnMap$', () => {
    it('should call highlightResult', (done) => {
      const payload = {
        opportunityId: 'opportunityId'
      };
      actions$.next(opportunityPanelActions.setSelectedOpportunityId(payload));
      effects.highlightOnMap$.pipe(take(1)).subscribe(() => {
        expect(mockHighlightOnHoverDirective.highlightResult).toBeCalledWith(payload.opportunityId);
        expect(mockOpportunityPanelService.zoomToExtents).toBeCalledWith(payload.opportunityId);
        done();
      });
    });

    it('should not call highlightResult opportunity is null', (done) => {
      const payload = {
        opportunityId: null
      };
      actions$.next(opportunityPanelActions.setSelectedOpportunityId(payload));
      effects.highlightOnMap$.pipe(take(1)).subscribe(() => {
        expect(mockHighlightOnHoverDirective.highlightResult).not.toBeCalled();
        done();
      });
    });

    it('should call removeHighlightResult if opportunity id is null', (done) => {
      const payload = {
        opportunityId: null
      };
      actions$.next(opportunityPanelActions.setSelectedOpportunityId(payload));
      effects.highlightOnMap$.pipe(take(1)).subscribe(() => {
        expect(mockHighlightOnHoverDirective.removeHighlightResult).toBeCalled();
        done();
      });
    });
  });

  describe('DataObjectCount', () => {
    it('should return a getDataObjectCountSuccess action', () => {
      effects.getDataObjectCount$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Panel] Get Data Object Count Success');
      });
      actions$.next(opportunityPanelActions.getFilteredOpportunitiesSuccess({} as any));
    });

    it('should return a getDataObjectCountFail action', () => {
      mockOpportunityPanelService.getCountRunner.mockImplementation(() => throwError(new Error('')));
      effects.getDataObjectCount$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Panel] Get Data Object Count Fail');
      });
      actions$.next(opportunityPanelActions.getFilteredOpportunitiesSuccess({} as any));
    });
  });

  describe('getPaginatedOpportunities', () => {
    it('should return a getPaginatedOpportunities action', () => {
      effects.getPaginatedOpportunities$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Panel] get Filtered Opportunities Success');
      });
      actions$.next(opportunityPanelActions.getOpportunities());
    });

    it('should return a getOpportunitiesFail action', (done) => {
      mockOpportunityPanelService.runMapLargeQuery.mockImplementation(() => throwError(new Error('')));

      effects.getPaginatedOpportunities$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Panel] Get Opportunities Fail');
        done();
      });
      actions$.next(opportunityPanelActions.getOpportunities());
    });
  });

  describe('getNextOpportunities', () => {
    it('should return a getNextOpportunities action', () => {
      effects.getNextOpportunities$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Panel] get Filtered Opportunities Success');
      });
      actions$.next(opportunityPanelActions.loadMoreOpportunities({} as any));
    });

    it('should return a getNextOpportunitiesFail action', (done) => {
      mockOpportunityPanelService.runMapLargeQuery.mockImplementation(() => throwError(new Error('')));

      effects.getNextOpportunities$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Panel] get Filtered Opportunities Fail');
        done();
      });
      actions$.next(opportunityPanelActions.loadMoreOpportunities({} as any));
    });
  });

  describe('mlConnectionInfo', () => {
    it('should return a getMlSuccessInfo action', (done) => {
      effects.getMlConnectionInfo$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Panel] Get mlConnectionInfo Success');
        done();
      });
      actions$.next(opportunityPanelActions.getMlConnectionInfo());
    });

    it('should return a getMlConnectionInfoFail action', (done) => {
      jest.spyOn(mockMapLargeHelperService, 'getDeployment').mockImplementation(() => throwError(new Error('')));

      effects.getMlConnectionInfo$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Panel] Get mlConnectionInfo Fail');
        done();
      });
      actions$.next(opportunityPanelActions.getMlConnectionInfo());
    });

    it('should return a getActiveTablesSuccess action', (done) => {
      effects.getActiveTables$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Panel] Get Active Tables Success');
        done();
      });
      actions$.next(opportunityPanelActions.getMlConnectionInfoSuccess({ mlConnectionInfo: <any>{} }));
    });

    it('should return a getActiveTableFail action', (done) => {
      jest.spyOn(mockMapLargeHelperService, 'getActiveTables').mockImplementation(() => throwError(new Error('')));

      effects.getActiveTables$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Panel] Get Active Tables Fail');
        done();
      });
      actions$.next(opportunityPanelActions.getMlConnectionInfoSuccess({ mlConnectionInfo: <any>{} }));
    });
    
  });

  describe('getOpportunitiesBeforeMapLoads', () => {
    it('should return a getFilteredOpportunitiesSuccess action', (done) => {
      effects.getAllOpportunitiesOnLoad$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe( '[Opportunity Panel] get Filtered Opportunities Success');
        done();
      });
      actions$.next(opportunityPanelActions.getActiveTablesSuccess({} as any));
    });
    it('should return a getOpportunitiesFail action', (done) => {
      mockOpportunityPanelService.getOpportunitiesOnLoad.mockImplementation(() => throwError(new Error('')));

      effects.getAllOpportunitiesOnLoad$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Panel] Get Opportunities Fail');
        done();
      });
      actions$.next(opportunityPanelActions.getActiveTablesSuccess({} as any));
    });
  })
});
