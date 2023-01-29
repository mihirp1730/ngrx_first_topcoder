import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  GisLayersService,
  GisMapDataService,
  GisMapLargeService,
  GisSearchResultActionService,
  GisSearchResultService,
  HighlightOnHoverDirective
} from '@slb-innersource/gis-canvas';
import { ReplaySubject, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { LassoPersistenceService } from '@apollo/app/services/lasso-persistence';
import { OpportunityPanelService } from '../../../opportunity-panel/services/opportunity-panel.service';
import {
  MockGisLayersService,
  MockGisMapDataService,
  mockGisMapLargeService,
  MockGisSearchResultActionService,
  MockGisSearchResultService,
  MockHighlightOnHoverDirective,
  mockLassoPersistenceService,
  mockOpportunityPanelService
} from '../../../shared/services.mock';
import { SidePanelViews } from '../../enums';
import * as mapWrapperActions from '../actions/map-wrapper.actions';
import * as mapWrapperSelectors from '../selectors/map-wrapper.selectors';
import { MapWrapperEffects } from './map-wrapper.effects';

describe('MapWrapperEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: MapWrapperEffects;
  let mockGisSearchResultService: GisSearchResultService;
  let mockGisLayersService: GisLayersService;
  let mockGisSearchResultActionService: GisSearchResultActionService;
  let mockStore: MockStore;
  let mockHighlightOnHoverDirective: HighlightOnHoverDirective;
  let mockGisMapDataService: GisMapDataService;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            {
              selector: mapWrapperSelectors.deduceCurrentSidepanel,
              value: SidePanelViews.RESULTS
            },
            {
              selector: mapWrapperSelectors.selectUseMapExtents,
              value: true
            },
            {
              selector: mapWrapperSelectors.dataOpportunityWorkFlow,
              value: true
            },
            {
              selector: mapWrapperSelectors.deduceGisGetSearchResultRequest,
              value: { layersOrFiltersHaveChanged: true, searchTerm: '' }
            },
            {
              selector: mapWrapperSelectors.selectGISMapClickShape,
              value: { isShapeSelected: true }
            },
            {
              selector: mapWrapperSelectors.selectMapSelectionSpatialQuery,
              value: 'POLYGON(0,0,0,0)'
            },
            {
              selector: mapWrapperSelectors.selectFilterWhereClause,
              value: [
                {
                  col: 'Asset',
                  test: 'EqualAny',
                  value: 'test'
                }
              ]
            },
            {
              selector: mapWrapperSelectors.selectLassoArea,
              value: 'test(long, lat)'
            },
            {
              selector: mapWrapperSelectors.selectFilteredLayers,
              value: ['Asset']
            },
            {
              selector: mapWrapperSelectors.selectSearchTerm,
              value: 'test'
            }
          ]
        }),
        {
          provide: GisSearchResultService,
          useClass: MockGisSearchResultService
        },
        {
          provide: GisLayersService,
          useClass: MockGisLayersService
        },
        {
          provide: GisSearchResultActionService,
          useClass: MockGisSearchResultActionService
        },
        {
          provide: GisMapLargeService,
          useValue: mockGisMapLargeService
        },
        {
          provide: GisMapDataService,
          useClass: MockGisMapDataService
        },
        {
          provide: LassoPersistenceService,
          useValue: mockLassoPersistenceService
        },
        {
          provide: HighlightOnHoverDirective,
          useClass: MockHighlightOnHoverDirective
        },
        {
          provide: OpportunityPanelService,
          useValue: mockOpportunityPanelService
        },
        MapWrapperEffects
      ]
    });
    effects = TestBed.inject(MapWrapperEffects);
    mockGisSearchResultService = TestBed.inject(GisSearchResultService);
    mockGisLayersService = TestBed.inject(GisLayersService);
    mockGisSearchResultActionService = TestBed.inject(GisSearchResultActionService);
    mockHighlightOnHoverDirective = TestBed.inject(HighlightOnHoverDirective);
    mockGisMapDataService = TestBed.inject(GisMapDataService);
    mockStore = TestBed.inject(Store) as MockStore;
  });
  afterEach(() => {
    actions$.complete();
  });

  describe('handleGisCanvasClick$', () => {
    it('should return a handleGisCanvasCenterChange action', (done) => {
      const latLng = { lat: uuid(), lng: uuid() };
      effects.handleGisCanvasClick$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual({
          type: '[Map-Wrapper] Handle GIS Canvas Click',
          lat: latLng.lat,
          lng: latLng.lng
        });
        done();
      });
      mockGisMapLargeService.click$.next(latLng);
    });
  });

  describe('handleGisCenterChange$', () => {
    it('should return a handleGisCanvasCenterChange action', (done) => {
      const center = uuid();
      effects.handleGisCenterChange$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual({
          type: '[Map-Wrapper] Handle GIS Canvas Center Change',
          center
        });
        done();
      });
      mockGisMapLargeService.centerChange$.next(center);
    });
  });

  describe('handle resetLayersAndFilters$', () => {
    it('should return a resetLayersAndFiltersSuccess action', (done) => {
      actions$.next({ type: '[Map-Wrapper] Reset Layers and Filters' } as Action);
      effects.resetLayersAndFilters$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual({
          type: '[Map-Wrapper] Reset Layers and Filters Success'
        });
        done();
      });
    });
  });

  describe('handleGisZoomChange$', () => {
    it('should return a handleGisCanvasCenterChange action', (done) => {
      const zoom = uuid();
      effects.handleGisZoomChange$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual({
          type: '[Map-Wrapper] Handle GIS Canvas Zoom Change',
          zoom
        });
        done();
      });
      mockGisMapLargeService.zoomChange$.next(zoom);
    });
  });

  describe('openMapWrapperComponent$', () => {
    it('should return a package userNavigatedAwayFromPackage action', (done) => {
      effects.openMapWrapperComponent$.pipe(take(1)).subscribe(({ type }) => {
        expect(type).toBe('[Package] User Navigated Away From Package');
        done();
      });
      actions$.next(mapWrapperActions.openMapWrapperComponent());
    });
  });

  describe('setGisMapFilterExtent$', () => {
    it('should set isGisMapFilterExtent with true values', (done) => {
      effects.setGisMapFilterExtent$.pipe(take(1)).subscribe((action) => {
        expect(mockGisSearchResultService.isGisMapFilterExtent).toBe(true);
        expect(action).toEqual({
          type: '[Map-Wrapper] Handle GIS Canvas Is Filter Extent Change'
        });
        done();
      });
      mockStore.setState({});
    });
    it('should return a package all the opportunities, when the map extend checkbox disabled', (done) => {
      mockStore.overrideSelector(mapWrapperSelectors.selectUseMapExtents, false);
      effects.resetMapExtentOpportunities$.pipe().subscribe(() => {
        expect(mockOpportunityPanelService.runMapLargeQuery).toHaveBeenCalled();
        done();
      });
      actions$.next(mapWrapperActions.toggleUseMapExtents({ dataOpportunityWorkflow: true }));
    });
    it('should return a Opportunities Fail action if the opportunity panel service fails', (done) => {
      mockStore.overrideSelector(mapWrapperSelectors.selectUseMapExtents, false);
      mockOpportunityPanelService.runMapLargeQuery.mockImplementation(() => throwError(new Error('')));

      effects.resetMapExtentOpportunities$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Panel] get Filtered Opportunities Fail');
        done();
      });
      actions$.next(mapWrapperActions.toggleUseMapExtents({ dataOpportunityWorkflow: true }));
    });

    it('should set isGisMapFilterExtent with false values', (done) => {
      mockGisSearchResultService.isGisMapFilterExtent = true;
      mockStore.overrideSelector(mapWrapperSelectors.selectUseMapExtents, false);
      mockStore.setState({});
      effects.setGisMapFilterExtent$.pipe(take(1)).subscribe((action) => {
        expect(mockGisSearchResultService.isGisMapFilterExtent).toBe(false);
        expect(mockGisSearchResultService.isGroupMapExtent).toBe(true);
        expect(mockGisSearchResultService.mapExtentWkt).toBe(undefined);
        expect(action).toEqual({
          type: '[Map-Wrapper] Handle GIS Canvas Is Filter Extent Change'
        });
        done();
      });
    });
  });

  describe('getMapExtendOpportunities$', () => {
    it('should return all the opportunities, when the map extend checkbox enabled and data work flow is turned on', (done) => {
      mockStore.overrideSelector(mapWrapperSelectors.selectUseMapExtents, true);
      effects.getMapExtendOpportunities$.pipe().subscribe(() => {
        expect(mockOpportunityPanelService.runMapLargeQuery).toHaveBeenCalled();
        done();
      });
      actions$.next(mapWrapperActions.toggleUseMapExtents({ dataOpportunityWorkflow: true }));
    });
  });

  describe('updateResultsUsingMapExtents$', () => {
    it('should call getMapExtentData with undefined is not using extents', (done) => {
      actions$.next(mapWrapperActions.handleGisCanvasIsFilterExtentChange());
      effects.updateResultsUsingMapExtents$.pipe(take(1)).subscribe({
        complete: () => {
          expect(mockGisSearchResultService.getMapExtentData).not.toHaveBeenCalledWith();
          done();
        }
      });
    });

    it('should call getMapExtentData with polygon data', (done) => {
      mockGisSearchResultService.isGisMapFilterExtent = true;
      actions$.next(mapWrapperActions.handleGisCanvasIsFilterExtentChange());
      effects.updateResultsUsingMapExtents$.pipe(take(1)).subscribe({
        complete: () => {
          expect(mockGisSearchResultService.getMapExtentData).toHaveBeenCalledWith(`POLYGON(0 0,0 0,0 0,0 0,0 0)`);
          done();
        }
      });
    });
  });

  describe('persistLasso$', () => {
    it('should call clearLassoShape', (done) => {
      effects.persistLasso$.pipe(take(1)).subscribe({
        complete: () => {
          expect(mockLassoPersistenceService.clearLassoShape).toHaveBeenCalled();
          done();
        }
      });
    });

    it('should call drawLassoShape with spatialQuery', (done) => {
      effects.persistLasso$.pipe(take(1)).subscribe({
        complete: () => {
          expect(mockLassoPersistenceService.drawLassoShape).toHaveBeenCalledWith('POLYGON(0,0,0,0)');
          done();
        }
      });
    });

    it('should not call drawLassoShape with spatialQuery as null', (done) => {
      mockStore.overrideSelector(mapWrapperSelectors.selectMapSelectionSpatialQuery, null);
      effects.persistLasso$.pipe(take(1)).subscribe({
        complete: () => {
          expect(mockLassoPersistenceService.clearLassoShape).toBeCalled();
          done();
        }
      });
    });
  });

  describe('zoomAndHighlightOnMap$', () => {
    it('should call highlightResult and zoomToExtents', (done) => {
      const payload = {
        opportunityId: 'opportunityId',
        record: {} as any
      };
      actions$.next(mapWrapperActions.setSelectedOpportunityId(payload));
      effects.zoomAndHighlightOnMap$.pipe(take(1)).subscribe(() => {
        expect(mockHighlightOnHoverDirective.highlightResult).toBeCalledWith(payload.record);
        expect(mockGisSearchResultService.zoomToExtents).toBeCalledWith(payload.record);
        done();
      });
    });

    it('should not call highlightResult and zoomToExtents when opportunity null', (done) => {
      const payload = {
        opportunityId: null
      };
      actions$.next(mapWrapperActions.setSelectedOpportunityId(payload));
      effects.zoomAndHighlightOnMap$.pipe(take(1)).subscribe(() => {
        expect(mockHighlightOnHoverDirective.highlightResult).not.toBeCalled();
        expect(mockGisSearchResultService.zoomToExtents).not.toBeCalled();
        done();
      });
    });

    it('should disable highlight if layer found', (done) => {
      const payload = {
        opportunityId: null
      };
      const targetLayer = {
        originalOptions: {
          name: '_gis_highlight_',
          visible: true
        },
        hide: jest.fn()
      };
      mockGisMapDataService.gisMapInstance.layers = [targetLayer];
      actions$.next(mapWrapperActions.setSelectedOpportunityId(payload));
      effects.zoomAndHighlightOnMap$.pipe(take(1)).subscribe(() => {
        expect(targetLayer.originalOptions.visible).toBeFalsy();
        expect(targetLayer.hide).toBeCalled();
        done();
      });
    });
  });
});
